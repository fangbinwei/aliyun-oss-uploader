import { OSSObjectTreeItem } from '@/views/bucket'
import { ext } from '@/extensionVariables'
import vscode from 'vscode'
import { CommandContext } from '@/constant'
import { showFolderNameInputBox } from '@/utils/index'

async function uploadFromBucketExplorerClipboard(
  selected: OSSObjectTreeItem
): Promise<void> {
  const folderPlaceholder =
    selected.label === ext.OSSConfiguration.bucket
      ? ''
      : selected.prefix + selected.label + '/'
  const folder = await showFolderNameInputBox(folderPlaceholder)
  if (folder === undefined) return

  await vscode.commands.executeCommand(
    'elan.uploadFromClipboard',
    folder.trim()
  )

  ext.bucketExplorer.refresh()
}
// eslint-disable-next-line
namespace uploadFromBucketExplorerClipboard {
  export const command = CommandContext.BUCKET_EXPLORER_UPLOAD_CLIPBOARD
}

export { uploadFromBucketExplorerClipboard }
