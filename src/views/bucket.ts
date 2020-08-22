import vscode from 'vscode'
import Uploader from '@/uploader/index'
import { removeTrailingSlash } from '@/utils/index'
import { CONTEXT_VALUE, TIP_FAILED_INIT, SUPPORT_EXT } from '@/constant'
import { getThemedIconPath } from './iconPath'
import { CommandContext } from '@/constant'
import path from 'path'
import Logger from '@/utils/log'
import { ext } from '@/extensionVariables'
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

  refresh(element?: OSSObjectTreeItem, reset = true): void {
    // if reset is false, means show next page date(pagination)
    if (element && reset) {
      element.marker = ''
    }
    this._onDidChangeTreeData.fire(element)
  }
  getErrorTreeItem(): OSSObjectTreeItem {
    return new ErrorTreeItem()
  }

  getTreeItem(element: OSSObjectTreeItem): vscode.TreeItem {
    return element
  }

  getChildren(element?: OSSObjectTreeItem): Thenable<OSSObjectTreeItem[]> {
    if (!this.uploader) {
      if (this._state === 'uninitialized') return Promise.resolve([])
      return Promise.resolve([this.getErrorTreeItem()])
    }
    if (this.root && this.root.label !== this.uploader.configuration.bucket) {
      this.root = null
      this.refresh()
      return Promise.resolve([])
    }

    // element is 'folder', should add prefix to its label
    if (element) {
      return Promise.resolve(
        this.getObjects(
          element.prefix + element.label,
          element.marker,
          element
        ).then((children) => {
          element.children = children
          return children
        })
      )
    }
    // root
    const bucket = this.uploader.configuration.bucket
    if (!bucket) {
      if (this._state === 'uninitialized') return Promise.resolve([])
      return Promise.resolve([this.getErrorTreeItem()])
    }
    this.root = new OSSObjectTreeItem({
      label: bucket,
      collapsibleState: vscode.TreeItemCollapsibleState.Expanded,
      iconPath: getThemedIconPath('database'),
      contextValue: CONTEXT_VALUE.BUCKET
    })
    return Promise.resolve([this.root])
  }
  // getObjects with certain prefix ('folder') and marker
  private async getObjects(
    prefix: string,
    marker = '',
    parentFolder: OSSObjectTreeItem
  ): Promise<OSSObjectTreeItem[]> {
    try {
      if (!this.uploader) return [this.getErrorTreeItem()]

      prefix = prefix === this.uploader.configuration.bucket ? '' : prefix + '/'

      const res = await this.uploader.list({
        prefix,
        marker
      })
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
        parentFolderIsObject: emptyObjectIndex !== null
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
      const nodes = _prefixes.concat(_objects)

      // click 'Show More' button
      if (marker) {
        // remove 'hasMore' item
        parentFolder.children.pop()
        nodes.unshift(...parentFolder.children)
      }

      if (!res.isTruncated) return nodes
      // if has nextPage
      nodes.push(
        new ShowMoreTreeItem({
          parentFolder,
          // since isTruncated is true, nextMarker must be string
          nextMarker: res.nextMarker as string
        })
      )
      return nodes
    } catch (err) {
      Logger.showErrorMessage(
        'Failed to list objects. See output channel for more details.'
      )
      Logger.log(
        `Failed: list objects.` +
          ` Reason: ${err.message}` +
          ` If you set customDomain, is it match to the bucket? `
      )
      return [this.getErrorTreeItem()]
    }
  }
}

interface OSSObjectTreeItemOptions extends vscode.TreeItem {
  label: string
  url?: string
  prefix?: string
  parentFolder?: OSSObjectTreeItem
  parentFolderIsObject?: boolean
  hidden?: boolean
}

export class OSSObjectTreeItem extends vscode.TreeItem {
  label: string
  prefix: string
  hidden: boolean
  url: string
  isFolder: boolean
  parentFolder: OSSObjectTreeItem | null
  parentFolderIsObject: boolean
  children: OSSObjectTreeItem[] = []
  isTruncated = false
  marker = ''
  constructor(options: OSSObjectTreeItemOptions) {
    super(options.label, options.collapsibleState)
    // folder has children object/folder
    this.isFolder = options.collapsibleState !== undefined
    // this.id = options.id
    this.label = options.label
    this.description = options.description
    this.iconPath = options.iconPath
    this.contextValue = options.contextValue
    this.prefix = options.prefix || ''
    this.hidden = !!options.hidden
    this.url = options.url || ''
    this.parentFolder = options.parentFolder || null
    this.parentFolderIsObject = !!options.parentFolderIsObject
    this.resourceUri = options.resourceUri
    this.command = options.command
  }
  get tooltip(): string {
    return `${this.label}`
  }
}

class ErrorTreeItem extends OSSObjectTreeItem {
  constructor() {
    super({
      label: TIP_FAILED_INIT,
      iconPath: getThemedIconPath('statusWarning'),
      contextValue: CONTEXT_VALUE.CONNECT_ERROR
    })
  }
}
interface ShowMoreTreeItemOptions {
  parentFolder: OSSObjectTreeItem
  nextMarker: string
}

export class ShowMoreTreeItem extends OSSObjectTreeItem {
  nextMarker: string
  constructor(options: ShowMoreTreeItemOptions) {
    super({ label: 'Show More', parentFolder: options.parentFolder })
    this.nextMarker = options.nextMarker
    this.command = this.getCommand()
    this.iconPath = getThemedIconPath('ellipsis')
  }
  getCommand(): vscode.Command {
    return {
      command: CommandContext.BUCKET_EXPLORER_SHOW_MORE_CHILDREN,
      title: 'Show More',
      arguments: [this]
    }
  }
  showMore(): void {
    if (!this.parentFolder) return
    this.parentFolder.marker = this.nextMarker
    ext.bucketExplorer.refresh(this.parentFolder, false)
  }
}
