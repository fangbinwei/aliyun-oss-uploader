import deleteUri from '@/uploader/deleteUri'
import vscode from 'vscode'
import { OSSObjectTreeItem } from '@/views/bucket'
import { ext } from '@/extensionVariables'

export default async function deleteFromBucketExplorerContext(
  treeItem: OSSObjectTreeItem
): Promise<void> {
  await deleteUri(vscode.Uri.parse(treeItem.url))

  if (!treeItem.parentFolder) return
  ext.bucketExplorer.refresh(treeItem.parentFolder)

  // TODO: since reserve the folder is meaningful, for uploading from folder context
  // const refresh = ext.bucketExplorer.refresh.bind(ext.bucketExplorer)
  // if (treeItem.total !== 1) return refresh(treeItem.parentFolder)
  // if (treeItem.parentFolderIsObject) return refresh(treeItem.parentFolder)

  // if the deleted one is the last treeItem of the 'parent folder' and 'parent folder' is emptyObject
  // we should show find folder which is object, and delete
  // because 'parent folder' is not 'exist'
  // let t = treeItem.parentFolder
  // while (!t.parentFolderIsObject) {
  //   if (!t.parentFolder) break
  //   t = t.parentFolder
  // }
  // return refresh(t)
}
