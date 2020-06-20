import Uploader from './index'
import { getProgress, removeLeadingSlash, Progress } from '@/utils'
import vscode from 'vscode'
import Logger from '@/utils/log'

export async function deleteUri(
  uri: vscode.Uri,
  showProgress = true
): Promise<void> {
  const uploader = Uploader.get()
  // init OSS instance failed
  if (!uploader) return

  const name = removeLeadingSlash(uri.path)
  let progress: Progress['progress'] | undefined
  let progressResolve: Progress['progressResolve'] | undefined
  if (showProgress) {
    const p = getProgress(`Deleting object`)
    progress = p.progress
    progressResolve = p.progressResolve
  }
  try {
    await uploader.delete(name)
    if (progress && progressResolve) {
      progress.report({
        message: `Finish.`,
        increment: 100
      })
      ;((fn): void => {
        setTimeout(() => {
          fn()
        }, 1000)
      })(progressResolve)
    }
  } catch (err) {
    progressResolve && progressResolve()
    Logger.showErrorMessage(
      `Failed to delete object. See output channel for more details`
    )
    Logger.log(`Failed: ${name}.` + ` Reason: ${err.message}`)

    // should throw err, moveUri will catch it
    throw err
  }
}
