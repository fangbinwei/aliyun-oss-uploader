import vscode from 'vscode'
import { uploadUris } from '@/uploader/uploadUris'
import { SUPPORT_EXT } from '@/constant'

export async function uploadFromExplorer(): Promise<void> {
  const result = await vscode.window.showOpenDialog({
    filters: {
      Images: SUPPORT_EXT.slice()
    },
    canSelectMany: true
  })
  if (!result) return

  await uploadUris(result)
}
