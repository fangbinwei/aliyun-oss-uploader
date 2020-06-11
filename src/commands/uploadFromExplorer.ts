import vscode from 'vscode'
import uploadUris from '@/uploader/uploadUris'
import { SUPPORT_EXT } from '@/utils/constant'

export default async function uploadImageFromExplorer(): Promise<void> {
  const result = await vscode.window.showOpenDialog({
    filters: {
      Images: SUPPORT_EXT.slice()
    },
    canSelectMany: true
  })
  if (!result) return

  await uploadUris(result)
}
