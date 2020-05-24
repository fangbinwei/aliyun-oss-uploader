import vscode from 'vscode'
import uploadFromClipboard from './commands/uploadFromClipboard'
import uploadFromExplorer from './commands/uploadFromExplorer'
import uploadFromExplorerContext from './commands/uploadFromExplorerContext'
import Logger from './utils/log'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext): void {
  Logger.channel = vscode.window.createOutputChannel('Elan')

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
    )
  ]
  context.subscriptions.push(...disposable)
}

// this method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}
