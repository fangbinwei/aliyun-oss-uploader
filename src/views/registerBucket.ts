import vscode from 'vscode'
import { ext } from '@/extensionVariables'
import { deleteFromBucketExplorerContext } from '@/commands/bucketExplorer/deleteFromContext'
import { uploadFromBucketExplorerContext } from '@/commands/bucketExplorer/uploadFromContext'
import { uploadFromBucketExplorerClipboard } from '@/commands/bucketExplorer/uploadFromClipboard'
import { copyLinkFromBucketExplorer } from '@/commands/bucketExplorer/copyLink'
import { copyFromBucketExplorerContext } from '@/commands/bucketExplorer/copyFromContext'
import { moveFromBucketExplorerContext } from '@/commands/bucketExplorer/moveFromContext'
import { BucketExplorerProvider } from './bucket'
import { CommandContext } from '@/constant'
import { ShowMoreTreeItem } from '@/views/bucket'

export function registerBucket(): vscode.Disposable[] {
  ext.bucketExplorer = new BucketExplorerProvider()
  ext.bucketExplorerTreeView = vscode.window.createTreeView('bucketExplorer', {
    treeDataProvider: ext.bucketExplorer,
    // TODO: support select many
    // canSelectMany: true,
    showCollapseAll: true
  })
  const _disposable = [
    vscode.commands.registerCommand(
      uploadFromBucketExplorerContext.command,
      uploadFromBucketExplorerContext
    ),
    vscode.commands.registerCommand(
      CommandContext.BUCKET_EXPLORER_SHOW_MORE_CHILDREN,
      (node: ShowMoreTreeItem) => {
        node.showMore()
      }
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
      moveFromBucketExplorerContext.command,
      moveFromBucketExplorerContext
    ),
    vscode.commands.registerCommand(
      copyFromBucketExplorerContext.command,
      copyFromBucketExplorerContext
    ),
    ext.bucketExplorerTreeView
  ]

  ext.bucketExplorerTreeView.onDidChangeVisibility(
    ({ visible }) => {
      ext.bucketExplorerTreeViewVisible = visible
    },
    null,
    _disposable
  )
  return _disposable
}
