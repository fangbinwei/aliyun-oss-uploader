import vscode from 'vscode'
import { ext } from '@/extensionVariables'
import deleteFromBucketExplorerContext from '@/commands/deleteFromBucketExplorerContext'
import uploadFromBucketExplorerContext from '@/commands/uploadFromBucketExplorerContext'

export function registerBucket(context: vscode.ExtensionContext): void {
  ext.bucketExplorerTreeView = vscode.window.createTreeView('bucketExplorer', {
    treeDataProvider: ext.bucketExplorer,
    // TODO: support select many
    // canSelectMany: true,
    showCollapseAll: true
  })
  const registerCommands = [
    vscode.commands.registerCommand(
      'elan.bucketExplorer.upload',
      uploadFromBucketExplorerContext
    ),
    vscode.commands.registerCommand('elan.bucketExplorer.refreshRoot', () =>
      ext.bucketExplorer.refresh()
    ),
    vscode.commands.registerCommand(
      'elan.bucketExplorer.delete',
      deleteFromBucketExplorerContext
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
