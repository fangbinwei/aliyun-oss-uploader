import vscode, { ExtensionContext } from 'vscode'
import { OSSObjectTreeItem, BucketExplorerProvider } from '@/views/bucket'
/**
 * Namespace for common variables used throughout the extension. They must be initialized in the activate() method of extension.ts
 */

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace ext {
  export let context: vscode.ExtensionContext
  export let bucketExplorer: BucketExplorerProvider
  export let bucketExplorerTreeView: vscode.TreeView<OSSObjectTreeItem>
}
