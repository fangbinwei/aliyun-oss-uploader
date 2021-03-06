import vscode from 'vscode'
import { uploadUris } from '@/uploader/uploadUris'
import { SUPPORT_EXT } from '@/constant'
import { ext } from '@/extensionVariables'

export async function uploadFromExplorer(): Promise<void> {
  const result = await vscode.window.showOpenDialog({
    filters: ext.elanConfiguration.onlyShowImages
      ? {
          Images: SUPPORT_EXT.slice()
        }
      : {},
    canSelectMany: true
  })
  if (!result) return

  await uploadUris(result)
}
