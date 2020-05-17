import vscode from 'vscode'

export default class Logger {
  static channel: vscode.OutputChannel

  static log(message: string): void {
    if (this.channel) {
      this.channel.appendLine(`[${new Date().toString()}] ${message}`)
    }
  }

  static showInformationMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined> {
    this.log(message)
    return vscode.window.showInformationMessage(message, ...items)
  }

  static showErrorMessage(
    message: string,
    ...items: string[]
  ): Thenable<string | undefined> {
    this.log(message)
    return vscode.window.showErrorMessage(message, ...items)
  }
}
