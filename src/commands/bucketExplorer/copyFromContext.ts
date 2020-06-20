import vscode from 'vscode'
import { OSSObjectTreeItem } from '@/views/bucket'
import { ext } from '@/extensionVariables'
import { CommandContext } from '@/constant'
import { copyUri } from '@/uploader/copyUri'
import Logger from '@/utils/log'
import { removeLeadingSlash } from '@/utils'

async function copyFromBucketExplorerContext(
  treeItem: OSSObjectTreeItem
): Promise<void> {
  const sourceUri = vscode.Uri.parse(treeItem.url)
  const targetName = await vscode.window.showInputBox({
    value: removeLeadingSlash(sourceUri.path),
    placeHolder: `Enter target name. e.g., 'example/folder/name/target.jpg'`,
    validateInput: (text) => {
      text = text.trim()
      if (text[0] === '/') return `Please do not start with '/'.`
      if (text === '') return `Please enter target name.`
    }
  })
  if (!targetName) return
  try {
    await copyUri(vscode.Uri.file(targetName), sourceUri)
  } catch {
    Logger.log('catch function copyUri error')
  }

  ext.bucketExplorer.refresh()
}
// eslint-disable-next-line @typescript-eslint/no-namespace
namespace copyFromBucketExplorerContext {
  export const command = CommandContext.BUCKET_EXPLORER_COPY_CONTEXT
}

export { copyFromBucketExplorerContext }
