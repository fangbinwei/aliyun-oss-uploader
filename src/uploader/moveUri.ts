import { getProgress } from '@/utils'
import vscode from 'vscode'
import Logger from '@/utils/log'
import { copyUri } from './copyUri'
import { deleteUri } from './deleteUri'

export async function moveUri(
  targetUri: vscode.Uri,
  sourceUri: vscode.Uri
): Promise<void> {
  const { progress, progressResolve } = getProgress(`Moving object`)
  try {
    // not atomic
    await copyUri(targetUri, sourceUri, false)
    await deleteUri(sourceUri, false)
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
      `Failed to move object. See output channel for more details`
    )
    Logger.log(
      `Failed: move from ${sourceUri.path} to ${targetUri.path}.` +
        ` Reason: ${err.message}`
    )
  }
}
