import { ShowMoreTreeItem } from '@/views/bucket'
import { CommandContext } from '@/constant'
function showMoreChildren(node: ShowMoreTreeItem): void {
  node.showMore()
}
// eslint-disable-next-line
namespace showMoreChildren {
  export const command = CommandContext.BUCKET_EXPLORER_SHOW_MORE_CHILDREN
}

export { showMoreChildren }
