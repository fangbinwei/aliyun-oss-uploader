import vscode from 'vscode'
import Uploader from '@/uploader/index'
import { removeTrailingSlash } from '@/utils/index'
import { CONTEXT_VALUE, TIP_FAILED_INIT, SUPPORT_EXT } from '@/constant'
import { getThemedIconPath } from './iconPath'
import path from 'path'
import Logger from '@/utils/log'
type State = 'uninitialized' | 'initialized'

export class BucketExplorerProvider
  implements vscode.TreeDataProvider<OSSObjectTreeItem> {
  private _state: State = 'uninitialized'
  private _onDidChangeTreeData: vscode.EventEmitter<OSSObjectTreeItem | void> = new vscode.EventEmitter<OSSObjectTreeItem | void>()

  readonly onDidChangeTreeData: vscode.Event<OSSObjectTreeItem | void> = this
    ._onDidChangeTreeData.event

  private root: OSSObjectTreeItem | null = null
  constructor() {
    this.setState('uninitialized')
    if (this.uploader && this.uploader.configuration.bucket) {
      // after the codes below are executed, the state will always be 'initialized
      this.setState('initialized')
    }
  }

  get uploader(): Uploader | null {
    const u = Uploader.get()
    // after the codes below are executed, the state will always be 'initialized
    if (u && u.configuration.bucket && this._state === 'uninitialized')
      this.setState('initialized')
    return u
  }

  setState(state: State): void {
    this._state = state
    vscode.commands.executeCommand('setContext', 'elan.state', state)
  }

  refresh(element?: OSSObjectTreeItem): void {
    this._onDidChangeTreeData.fire(element)
  }
  getOSSObjectErrorTreeItem(): OSSObjectTreeItem {
    return new OSSObjectTreeItem({
      label: TIP_FAILED_INIT,
      iconPath: getThemedIconPath('statusWarning'),
      contextValue: CONTEXT_VALUE.CONNECT_ERROR
    })
  }

  getTreeItem(element: OSSObjectTreeItem): vscode.TreeItem {
    return element
  }

  getChildren(element?: OSSObjectTreeItem): Thenable<OSSObjectTreeItem[]> {
    if (!this.uploader) {
      if (this._state === 'uninitialized') return Promise.resolve([])
      return Promise.resolve([this.getOSSObjectErrorTreeItem()])
    }
    if (this.root && this.root.label !== this.uploader.configuration.bucket) {
      this.root = null
      this.refresh()
      return Promise.resolve([])
    }

    if (element) {
      // element is 'folder', should add prefix to its label
      return Promise.resolve(
        this.getObjects(element.prefix + element.label, element)
      )
    }
    // root
    const bucket = this.uploader.configuration.bucket
    if (!bucket) {
      if (this._state === 'uninitialized') return Promise.resolve([])
      return Promise.resolve([this.getOSSObjectErrorTreeItem()])
    }
    this.root = new OSSObjectTreeItem({
      label: bucket,
      collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
      iconPath: getThemedIconPath('database'),
      contextValue: CONTEXT_VALUE.BUCKET
    })
    return Promise.resolve([this.root])
  }

  private async getObjects(
    prefix: string,
    parentFolder: OSSObjectTreeItem
  ): Promise<OSSObjectTreeItem[]> {
    try {
      if (!this.uploader) return [this.getOSSObjectErrorTreeItem()]

      prefix = prefix === this.uploader.configuration.bucket ? '' : prefix + '/'

      const res = await this.uploader.list({ prefix })
      // we should create an empty 'folder' sometimes
      // this 'empty object' is the 'parent folder' of these objects
      let emptyObjectIndex: null | number = null
      res.objects = res.objects || []
      res.prefixes = res.prefixes || []

      res.objects.some((p, index) => {
        const isEmpty = p.name === prefix
        if (isEmpty) emptyObjectIndex = index
        return isEmpty
      })
      const commonOptions = {
        prefix,
        parentFolder,
        parentFolderIsObject: emptyObjectIndex !== null,
        total: res.prefixes.length + res.objects.length
      }
      let _objects = res.objects.map((p, index) => {
        const isImage = SUPPORT_EXT.includes(
          path.extname(p.name).substr(1).toLowerCase()
        )
        const isEmpty = index === emptyObjectIndex
        return new OSSObjectTreeItem({
          ...commonOptions,
          url: p.url,
          label: p.name.substr(prefix.length),
          hidden: isEmpty, // TODO: maybe delete this property
          contextValue: CONTEXT_VALUE.OBJECT,
          iconPath: vscode.ThemeIcon.File,
          resourceUri: vscode.Uri.parse(p.url),
          command: isImage
            ? ({
                command: 'elan.webView.imagePreview',
                title: 'preview',
                arguments: [p.url]
              } as vscode.Command)
            : undefined
        })
      })
      if (emptyObjectIndex != null) _objects.splice(emptyObjectIndex, 1)

      if (this.uploader.configuration.onlyShowImages) {
        //TODO: after realizing pagination, we can show all ext
        _objects = _objects.filter((o) => {
          return SUPPORT_EXT.includes(
            path.extname(o.label).substr(1).toLowerCase()
          )
        })
      }

      const _prefixes = res.prefixes.map((p) => {
        // e.g. if prefix is 'github', return prefix is 'github/*', should remove redundant string
        p = removeTrailingSlash(p).substr(prefix.length)
        return new OSSObjectTreeItem({
          ...commonOptions,
          label: p,
          collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
          contextValue: CONTEXT_VALUE.FOLDER,
          iconPath: vscode.ThemeIcon.Folder
        })
      })

      return _prefixes.concat(_objects)
    } catch (err) {
      Logger.showErrorMessage(
        'Failed to list Objects. See output channel for more details.'
      )
      return [this.getOSSObjectErrorTreeItem()]
    }
  }
}

interface OSSObjectTreeItemOptions extends vscode.TreeItem {
  label: string
  url?: string
  prefix?: string
  parentFolder?: OSSObjectTreeItem
  parentFolderIsObject?: boolean
  total?: number
  hidden?: boolean
}

export class OSSObjectTreeItem extends vscode.TreeItem {
  label: string
  prefix: string
  hidden: boolean
  url: string
  parentFolder: OSSObjectTreeItem | null
  parentFolderIsObject: boolean
  total: number // sibling + itself
  constructor(options: OSSObjectTreeItemOptions) {
    super(options.label, options.collapsibleState)
    this.id = options.id
    this.label = options.label
    this.description = options.description
    this.iconPath = options.iconPath
    this.contextValue = options.contextValue
    this.prefix = options.prefix || ''
    this.hidden = !!options.hidden
    this.url = options.url || ''
    this.parentFolder = options.parentFolder || null
    this.parentFolderIsObject = !!options.parentFolderIsObject
    this.total = options.total || 0
    this.resourceUri = options.resourceUri
    this.command = options.command
  }
  get tooltip(): string {
    return `${this.label}`
  }
}
// TODO: necessary? class ShowMoreTreeItem
