import vscode from 'vscode'
import { uploadUris } from '../utils/uploader/index'

export default async function uploadImageFromExplorer(): Promise<void> {
  const result = await vscode.window.showOpenDialog({
    filters: {
      Images: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'bmp', 'tiff', 'ico', 'svg']
    },
    canSelectMany: true
  })
  if (!result) return

  await uploadUris(result)
}
