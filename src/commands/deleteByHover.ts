import deleteUri from '@/uploader/deleteUri'
import { getActiveMd } from '@/utils/index'
import vscode from 'vscode'
import { ext } from '@/extensionVariables'

interface PositionToJSON {
  readonly line: number
  readonly character: number
}

type RangeToJSON = Array<PositionToJSON>

export default async function hoverDelete(
  uri: string,
  fileName: string,
  range: RangeToJSON
): Promise<void> {
  await deleteUri(vscode.Uri.parse(uri))
  const [start, end] = range
  const vsRange = new vscode.Range(
    start.line,
    start.character,
    end.line,
    end.character
  )
  deleteGFM(fileName, vsRange)
  if (ext.bucketExplorerTreeViewVisible) ext.bucketExplorer.refresh()
}

function deleteGFM(fileName: string, range: vscode.Range): void {
  const activeTextMd = getActiveMd()
  if (!activeTextMd) return
  if (activeTextMd.document.fileName !== fileName) return
  activeTextMd.edit((editBuilder) => {
    editBuilder.delete(range)
  })
}
