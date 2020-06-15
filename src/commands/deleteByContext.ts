import deleteUri from '@/uploader/deleteUri'
import vscode from 'vscode'
import { OSSObjectTreeItem } from '@/views/bucket'
import { ext } from '@/extensionVariables'

export default async function deleteByContext(
  treeItem: OSSObjectTreeItem
): Promise<void> {
  await deleteUri(vscode.Uri.parse(treeItem.url))

  if (!treeItem.parentFolder) return
  const refresh = ext.bucketExplorer.refresh.bind(ext.bucketExplorer)
  if (treeItem.total !== 1) return refresh(treeItem.parentFolder)
  if (treeItem.parentFolderIsObject) return refresh(treeItem.parentFolder)

  // if the deleted one is the last treeItem of the 'parent folder' and 'parent folder' is emptyObject, we should show refresh parentFolder.parentFolder
  // because 'parent folder' is not 'exist'
  if (treeItem.parentFolder.parentFolder)
    return refresh(treeItem.parentFolder.parentFolder)
}
