import Uploader from './index'
import { getProgress, removeLeadingSlash } from '@/utils'
import vscode from 'vscode'
import Logger from '@/utils/log'

export async function deleteUri(uri: vscode.Uri): Promise<void> {
  const uploader = Uploader.get()
  // init OSS instance failed
  if (!uploader) return

  const name = removeLeadingSlash(uri.path)
  const { progress, progressResolve } = getProgress(`Deleting image`)
  try {
    await uploader.delete(name)
    progress.report({
      message: `Finish.`,
      increment: 100
    })
    setTimeout(() => {
      progressResolve()
    }, 1000)
  } catch (err) {
    progressResolve()
    Logger.showErrorMessage(
      `Failed to delete image. See output channel for more details`
    )
    Logger.log(`Failed: ${name}.` + ` Reason: ${err.message}`)
  }
}
