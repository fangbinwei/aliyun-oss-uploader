import vscode from 'vscode'
import { format } from 'date-fns'

export default class Logger {
  static channel: vscode.OutputChannel

  static log(message: string): void {
    if (this.channel) {
      this.channel.appendLine(
        `[${format(new Date(), 'MM-dd HH:mm:ss')}]: ${message}`
      )
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
