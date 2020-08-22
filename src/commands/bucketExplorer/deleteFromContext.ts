import { deleteUri } from '@/uploader/deleteUri'
import vscode from 'vscode'
import { OSSObjectTreeItem } from '@/views/bucket'
import { ext } from '@/extensionVariables'
import { CommandContext } from '@/constant'

async function deleteFromBucketExplorerContext(
  treeItem: OSSObjectTreeItem
): Promise<void> {
  await deleteUri(vscode.Uri.parse(treeItem.url))

  if (!treeItem.parentFolder) return
  ext.bucketExplorer.refresh(treeItem.parentFolder)
}
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace deleteFromBucketExplorerContext {
  export const command = CommandContext.BUCKET_EXPLORER_DELETE_CONTEXT
}

export { deleteFromBucketExplorerContext }
