import vscode, { Hover } from 'vscode'
import { isAliyunOssUri } from '@/utils/index'
import { MARKDOWN_PATH_REG } from '@/utils/constant'

function getCommandUriString(
  text: string,
  command: string,
  ...args: unknown[]
): string {
  const uri = vscode.Uri.parse(
    `command:${command}` +
      (args.length ? `?${encodeURIComponent(JSON.stringify(args))}` : '')
  )
  return `[${text}](${uri})`
}

class HoverProvider implements vscode.HoverProvider {
  provideHover(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.ProviderResult<vscode.Hover> {
    const keyRange = this.getKeyRange(document, position)
    if (!keyRange) return

    const uriMatch = MARKDOWN_PATH_REG.exec(document.getText(keyRange))
    if (!uriMatch) return

    const uri = uriMatch[1]

    if (!isAliyunOssUri(uri)) return

    const delCommandUri = getCommandUriString(
      'Delete image',
      'elan.delete',
      uri,
      document.fileName,
      keyRange
    )
    const contents = new vscode.MarkdownString(delCommandUri)
    contents.isTrusted = true
    return new Hover(contents, keyRange)
  }
  getKeyRange(
    document: vscode.TextDocument,
    position: vscode.Position
  ): vscode.Range | undefined {
    const keyRange = document.getWordRangeAtPosition(
      position,
      MARKDOWN_PATH_REG
    )

    return keyRange
  }
}

export default new HoverProvider()
