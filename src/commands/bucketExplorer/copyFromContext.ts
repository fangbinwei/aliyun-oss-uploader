import vscode from 'vscode'
import { OSSObjectTreeItem } from '@/views/bucket'
import { ext } from '@/extensionVariables'
import { CommandContext } from '@/constant'
import { copyUri } from '@/uploader/copyUri'
import Logger from '@/utils/log'
import { showObjectNameInputBox } from '@/utils'
import path from 'path'

async function copyFromBucketExplorerContext(
  treeItem: OSSObjectTreeItem
): Promise<void> {
  const sourceUri = vscode.Uri.parse(treeItem.url)
  const sourcePath = sourceUri.path

  const targetName = await showObjectNameInputBox(sourceUri.path, {
    valueSelection: [0, sourcePath.length - path.extname(sourcePath).length - 1]
  })
  if (!targetName) return
  try {
    await copyUri(vscode.Uri.file(targetName.trim()), sourceUri)
  } catch {
    Logger.log('catch function copyUri error')
  }

  ext.bucketExplorer.refresh()
}
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace copyFromBucketExplorerContext {
  export const command = CommandContext.BUCKET_EXPLORER_COPY_CONTEXT
}

export { copyFromBucketExplorerContext }
