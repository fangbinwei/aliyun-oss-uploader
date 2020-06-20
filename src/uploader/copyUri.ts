import Uploader from './index'
import { getProgress, removeLeadingSlash, Progress } from '@/utils'
import vscode from 'vscode'
import Logger from '@/utils/log'

export async function copyUri(
  targetUri: vscode.Uri,
  sourceUri: vscode.Uri,
  showProgress = true
): Promise<void> {
  const uploader = Uploader.get()
  // init OSS instance failed
  if (!uploader) return

  // path '/ex/path', the 'ex' means source bucket name, should remove leading slash
  const sourceName = removeLeadingSlash(sourceUri.path)
  // leading slash of targetName is irrelevant
  const targetName = removeLeadingSlash(targetUri.path)

  let progress: Progress['progress'] | undefined
  let progressResolve: Progress['progressResolve'] | undefined
  if (showProgress) {
    const p = getProgress(`Copying object`)
    progress = p.progress
    progressResolve = p.progressResolve
  }
  try {
    await uploader.copy(targetName, sourceName)
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
      `Failed to copy object. See output channel for more details`
    )
    Logger.log(
      `Failed: copy from ${sourceName} to ${targetName}.` +
        ` Reason: ${err.message}`
    )
    throw err
  }
}
