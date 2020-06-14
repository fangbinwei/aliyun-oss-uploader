import vscode from 'vscode'
import Uploader from '@/uploader/index'
import { removeTrailingSlash } from '@/utils/index'
import { CONTEXT_VALUE, TIP_FAILED_INIT } from '@/utils/constant'
import { getThemedIconPath } from './iconPath'

export class BucketExplorerProvider
  implements vscode.TreeDataProvider<OSSObjectTreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<OSSObjectTreeItem | void> = new vscode.EventEmitter<OSSObjectTreeItem | void>()

  readonly onDidChangeTreeData: vscode.Event<OSSObjectTreeItem | void> = this
    ._onDidChangeTreeData.event

  private root: OSSObjectTreeItem | null = null

  get uploader(): Uploader | null {
    return Uploader.get()
  }

  refresh(): void {
    this._onDidChangeTreeData.fire()
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
      return Promise.resolve(this.getObjects(element.prefix + element.label))
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

  private async getObjects(prefix: string): Promise<OSSObjectTreeItem[]> {
    if (!this.uploader) return [this.getOSSObjectErrorTreeItem()]

    prefix = prefix === this.uploader.configuration.bucket ? '' : prefix + '/'
    const { objects, prefixes } = await this.uploader.list({
      prefix,
      'max-keys': 100
    })
    const _prefixes = (prefixes || []).map((p) => {
      // e.g. if prefix is 'github', return prefix is 'github/*', should remove redundant string
      p = removeTrailingSlash(p).substr(prefix.length)
      return new OSSObjectTreeItem({
        label: p,
        collapsibleState: vscode.TreeItemCollapsibleState.Collapsed,
        prefix,
        contextValue: CONTEXT_VALUE.FOLDER,
        iconPath: vscode.ThemeIcon.Folder
      })
    })
    // we should create an empty 'folder' sometimes, it will make a empty Object
    let emptyObjectIndex: null | number = null
    const _objects = (objects || []).map((p, index) => {
      const isEmpty = p.name === prefix
      if (isEmpty) emptyObjectIndex = index
      return new OSSObjectTreeItem({
        label: p.name.substr(prefix.length),
        hidden: isEmpty, // TODO: maybe delete this property
        contextValue: CONTEXT_VALUE.OBJECT,
        iconPath: vscode.ThemeIcon.File
      })
    })
    if (emptyObjectIndex != null) _objects.splice(emptyObjectIndex, 1)

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
  collapsibleState?: vscode.TreeItemCollapsibleState
  description?: string
  iconPath?: TreeItemIconPath
  contextValue: string
  prefix?: string
  hidden?: boolean
}

class OSSObjectTreeItem extends vscode.TreeItem {
  prefix: string
  hidden: boolean
  constructor(options: OSSObjectTreeItemOptions) {
    super(options.label, options.collapsibleState)
    this.id = options.id
    this.label = options.label
    this.description = options.description
    this.iconPath = options.iconPath
    this.contextValue = options.contextValue
    this.prefix = options.prefix || ''
    this.hidden = options.hidden || false
  }
  get tooltip(): string {
    return `${this.label}`
  }
}
// TODO: necessary? class ShowMoreTreeItem
