import { OSSObjectTreeItem } from '@/views/bucket'
import { ext } from '@/extensionVariables'
import { SUPPORT_EXT } from '@/utils/constant'
import uploadUris from '@/uploader/uploadUris'
import vscode from 'vscode'

export default async function uploadFromBucketExplorerContext(
  selected: OSSObjectTreeItem
): Promise<void> {
  const folderPlaceholder =
    selected.label === ext.OSSConfiguration.bucket
      ? ''
      : selected.prefix + selected.label + '/'
  const folder = await vscode.window.showInputBox({
    value: folderPlaceholder,
    placeHolder: `Enter folder name. e.g., 'example/folder/name/', '' means root folder`,
    validateInput: (text) => {
      text = text.trim()
      if (text === '') return null
      return text.endsWith('/') ? null : `Please end with '/'`
    }
  })
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
