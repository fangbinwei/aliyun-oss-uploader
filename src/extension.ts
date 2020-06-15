import vscode from 'vscode'
import uploadFromClipboard from './commands/uploadFromClipboard'
import uploadFromExplorer from './commands/uploadFromExplorer'
import uploadFromExplorerContext from './commands/uploadFromExplorerContext'
import deleteByHover from './commands/deleteByHover'
import hover from './language/hover'
import Logger from './utils/log'
import { BucketExplorerProvider } from './views/bucket'
import { ext } from '@/extensionVariables'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext): void {
  initializeExtensionVariables(context)
  Logger.channel = vscode.window.createOutputChannel('Elan')
  const bucketExplorer = new BucketExplorerProvider()

  const disposable = [
    vscode.commands.registerCommand(
      'elan.uploadFromClipboard',
      uploadFromClipboard
    ),
    vscode.commands.registerCommand(
      'elan.uploadFromExplorer',
      uploadFromExplorer
    ),
    vscode.commands.registerCommand(
      'elan.uploadFromExplorerContext',
      uploadFromExplorerContext
    ),
    vscode.commands.registerCommand('elan.deleteByHover', deleteByHover),
    vscode.languages.registerHoverProvider('markdown', hover),
    // TODO: command registry refactor
    vscode.commands.registerCommand('elan.bucketExplorer.refreshRoot', () =>
      bucketExplorer.refresh()
    )
  ]

  const bucketExplorerTreeView = vscode.window.createTreeView(
    'bucketExplorer',
    {
      treeDataProvider: bucketExplorer
    }
  )
  context.subscriptions.push(bucketExplorerTreeView)
  context.subscriptions.push(...disposable)
}

// this method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}

function initializeExtensionVariables(ctx: vscode.ExtensionContext): void {
  ext.context = ctx
}
