import vscode from 'vscode'
import Uploader from '@/uploader/index'
import { removeTrailingSlash } from '@/utils/index'
import { CONTEXT_VALUE, TIP_FAILED_INIT, SUPPORT_EXT } from '@/constant'
import { getThemedIconPath } from './iconPath'
import path from 'path'

export class BucketExplorerProvider
  implements vscode.TreeDataProvider<OSSObjectTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<OSSObjectTreeItem | void> = new vscode.EventEmitter<OSSObjectTreeItem | void>()

  readonly onDidChangeTreeData: vscode.Event<OSSObjectTreeItem | void> = this
    ._onDidChangeTreeData.event

  private root: OSSObjectTreeItem | null = null

  get uploader(): Uploader | null {
    return Uploader.get()
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
    if (!this.uploader)
      return Promise.resolve([this.getOSSObjectErrorTreeItem()])
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
    if (!bucket) return Promise.resolve([this.getOSSObjectErrorTreeItem()])
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
    if (!this.uploader) return [this.getOSSObjectErrorTreeItem()]

    prefix = prefix === this.uploader.configuration.bucket ? '' : prefix + '/'
    const res = await this.uploader.list({
      prefix,
      'max-keys': 100 //TODO: need config by user, need use 'maker' when exceed 1000
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
      parentFolderIsObject: emptyObjectIndex !== null,
      total: res.prefixes.length + res.objects.length
    }
    //TODO: config by user?
    const filteredObject = res.objects.filter((o) => {
      return SUPPORT_EXT.includes(path.extname(o.name).substr(1))
    })
    const _objects = filteredObject.map((p, index) => {
      const isEmpty = index === emptyObjectIndex
      return new OSSObjectTreeItem({
        ...commonOptions,
        url: p.url,
        label: p.name.substr(prefix.length),
        hidden: isEmpty, // TODO: maybe delete this property
        contextValue: CONTEXT_VALUE.OBJECT,
        iconPath: vscode.ThemeIcon.File
      })
    })
    if (emptyObjectIndex != null) _objects.splice(emptyObjectIndex, 1)

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
  }
}
type TreeItemIconPath =
  | string
  | vscode.Uri
  | { light: string | vscode.Uri; dark: string | vscode.Uri }
  | vscode.ThemeIcon

interface OSSObjectTreeItemOptions {
  id?: string
  label: string
  url?: string
  collapsibleState?: vscode.TreeItemCollapsibleState
  description?: string
  iconPath?: TreeItemIconPath
  contextValue: string
  prefix?: string
  parentFolder?: OSSObjectTreeItem
  parentFolderIsObject?: boolean
  total?: number
  hidden?: boolean
}

export class OSSObjectTreeItem extends vscode.TreeItem {
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
  }
  get tooltip(): string {
    return `${this.label}`
  }
}
// TODO: necessary? class ShowMoreTreeItem
