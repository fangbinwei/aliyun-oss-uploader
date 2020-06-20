import vscode from 'vscode'
import { OSSObjectTreeItem } from '@/views/bucket'
import { ext } from '@/extensionVariables'
import { CommandContext } from '@/constant'
import { showObjectNameInputBox } from '@/utils/index'
import { moveUri } from '@/uploader/moveUri'
import path from 'path'

async function moveFromBucketExplorerContext(
  treeItem: OSSObjectTreeItem
): Promise<void> {
  const sourceUri = vscode.Uri.parse(treeItem.url)
  const sourcePath = sourceUri.path

  const targetName = await showObjectNameInputBox(sourceUri.path, {
    valueSelection: [0, sourcePath.length - path.extname(sourcePath).length - 1]
  })
  if (!targetName) return

  await moveUri(vscode.Uri.file(targetName.trim()), sourceUri)

  ext.bucketExplorer.refresh()
}
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace moveFromBucketExplorerContext {
  export const command = CommandContext.BUCKET_EXPLORER_MOVE_CONTEXT
}

export { moveFromBucketExplorerContext }
