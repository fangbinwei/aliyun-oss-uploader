import vscode from 'vscode'
import { ext } from '@/extensionVariables'
import { deleteFromBucketExplorerContext } from '@/commands/bucketExplorer/deleteFromContext'
import { uploadFromBucketExplorerContext } from '@/commands/bucketExplorer/uploadFromContext'
import { uploadFromBucketExplorerClipboard } from '@/commands/bucketExplorer/uploadFromClipboard'
import { copyLinkFromBucketExplorer } from '@/commands/bucketExplorer/copyLink'
import { copyFromBucketExplorerContext } from '@/commands/bucketExplorer/copyFromContext'
import { CommandContext } from '@/constant'

export function registerBucket(context: vscode.ExtensionContext): void {
  ext.bucketExplorerTreeView = vscode.window.createTreeView('bucketExplorer', {
    treeDataProvider: ext.bucketExplorer,
    // TODO: support select many
    // canSelectMany: true,
    showCollapseAll: true
  })
  const registerCommands = [
    vscode.commands.registerCommand(
      uploadFromBucketExplorerContext.command,
      uploadFromBucketExplorerContext
    ),
    vscode.commands.registerCommand(
      CommandContext.BUCKET_EXPLORER_REFRESH_ROOT,
      () => ext.bucketExplorer.refresh()
    ),
    vscode.commands.registerCommand(
      deleteFromBucketExplorerContext.command,
      deleteFromBucketExplorerContext
    ),
    vscode.commands.registerCommand(
      uploadFromBucketExplorerClipboard.command,
      uploadFromBucketExplorerClipboard
    ),
    vscode.commands.registerCommand(
      copyLinkFromBucketExplorer.command,
      copyLinkFromBucketExplorer
    ),
    vscode.commands.registerCommand(
      copyFromBucketExplorerContext.command,
      copyFromBucketExplorerContext
    )
  ]
  context.subscriptions.push(ext.bucketExplorerTreeView)
  context.subscriptions.push(...registerCommands)
  context.subscriptions.push(
    ext.bucketExplorerTreeView.onDidChangeVisibility(({ visible }) => {
      ext.bucketExplorerTreeViewVisible = visible
    })
  )
}
