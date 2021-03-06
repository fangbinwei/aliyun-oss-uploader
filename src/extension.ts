import vscode from 'vscode'
import { uploadFromClipboard } from './commands/uploadFromClipboard'
import { uploadFromExplorer } from './commands/uploadFromExplorer'
import { uploadFromExplorerContext } from './commands/uploadFromExplorerContext'
import { setOSSConfiguration } from './commands/setOSSConfiguration'
import deleteByHover from './commands/deleteByHover'
import hover from './language/hover'
import Logger from './utils/log'
import { ext } from '@/extensionVariables'
import { getElanConfiguration } from '@/utils/index'
import { registerBucket } from './views/registerBucket'
import { ElanImagePreviewPanel } from '@/webview/imagePreview'

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

export function activate(context: vscode.ExtensionContext): void {
  initializeExtensionVariables(context)
  Logger.channel = vscode.window.createOutputChannel('Elan')
  const registeredCommands = [
    vscode.commands.registerCommand('elan.webView.imagePreview', (imageSrc) => {
      ElanImagePreviewPanel.createOrShow(context.extensionUri, imageSrc)
    }),
    vscode.commands.registerCommand(
      'elan.setOSSConfiguration',
      setOSSConfiguration
    ),
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
    vscode.languages.registerHoverProvider('markdown', hover)
    // TODO: command registry refactor
  ]
  context.subscriptions.push(...registeredCommands)

  // views/bucket
  context.subscriptions.push(...registerBucket())
}

// this method is called when your extension is deactivated
// eslint-disable-next-line @typescript-eslint/no-empty-function
export function deactivate(): void {}

function initializeExtensionVariables(ctx: vscode.ExtensionContext): void {
  ext.context = ctx
  // there are two position get oss configuration now, may redundant
  ext.elanConfiguration = getElanConfiguration()
  ctx.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(() => {
      ext.elanConfiguration = getElanConfiguration()
    })
  )
}
