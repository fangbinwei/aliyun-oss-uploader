import { OSSObjectTreeItem } from '@/views/bucket'
import { ext } from '@/extensionVariables'
import { SUPPORT_EXT } from '@/constant'
import { uploadUris } from '@/uploader/uploadUris'
import vscode from 'vscode'
import { CommandContext } from '@/constant'
import { showFolderNameInputBox } from '@/utils/index'

async function uploadFromBucketExplorerContext(
  selected: OSSObjectTreeItem
): Promise<void> {
  const folderPlaceholder =
    selected.label === ext.elanConfiguration.bucket
      ? ''
      : selected.prefix + selected.label + '/'

  const folder = await showFolderNameInputBox(folderPlaceholder)
  if (folder === undefined) return

  const images = await vscode.window.showOpenDialog({
    filters: {
      Images: SUPPORT_EXT.slice()
    },
    canSelectMany: true
  })
  if (!images) return

  await uploadUris(images, folder.trim())

  ext.bucketExplorer.refresh()
}

// eslint-disable-next-line
namespace uploadFromBucketExplorerContext {
  export const command = CommandContext.BUCKET_EXPLORER_UPLOAD_CONTEXT
}

export { uploadFromBucketExplorerContext }
