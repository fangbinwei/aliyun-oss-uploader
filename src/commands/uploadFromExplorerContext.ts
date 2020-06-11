import vscode from 'vscode'
import uploadUris from '@/uploader/uploadUris'

// TODO: compatible with Bucket Folder > ${relativeToVsRootPath} even no active file
export default async function uploadFromExplorerContext(
  uri: vscode.Uri
): Promise<void> {
  await uploadUris([uri])
}
