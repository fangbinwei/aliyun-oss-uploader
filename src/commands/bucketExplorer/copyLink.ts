import vscode from 'vscode'
import { OSSObjectTreeItem } from '@/views/bucket'
import { CommandContext } from '@/constant'
import Logger from '@/utils/log'

async function copyLinkFromBucketExplorer(
  treeItem: OSSObjectTreeItem
): Promise<void> {
  vscode.env.clipboard.writeText(treeItem.url)
  Logger.showInformationMessage('Copy Link Successfully!')
}

// eslint-disable-next-line @typescript-eslint/no-namespace
namespace copyLinkFromBucketExplorer {
  export const command = CommandContext.BUCKET_EXPLORER_COPY_LINK
}

export { copyLinkFromBucketExplorer }
