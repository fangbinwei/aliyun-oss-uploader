export enum CommandContext {
  BUCKET_EXPLORER_UPLOAD_CLIPBOARD = 'elan.bucketExplorer.uploadFromClipboard',
  BUCKET_EXPLORER_UPLOAD_CONTEXT = 'elan.bucketExplorer.uploadFromContext',
  BUCKET_EXPLORER_DELETE_CONTEXT = 'elan.bucketExplorer.deleteFromContext',
  BUCKET_EXPLORER_COPY_CONTEXT = 'elan.bucketExplorer.copyFromContext',
  BUCKET_EXPLORER_MOVE_CONTEXT = 'elan.bucketExplorer.moveFromContext',
  BUCKET_EXPLORER_REFRESH_ROOT = 'elan.bucketExplorer.refreshRoot',
  BUCKET_EXPLORER_COPY_LINK = 'elan.bucketExplorer.copyLink',
  BUCKET_EXPLORER_SHOW_MORE_CHILDREN = 'elan.bucketExplorer.showMoreChildren'
}
export const SUPPORT_EXT: ReadonlyArray<string> = [
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'bmp',
  'tiff',
  'ico',
  'svg'
]
export const MARKDOWN_PATH_REG = /!\[.*?\]\((.+?)\)/g

export const TIP_FAILED_INIT =
  'Failed to connect OSS. Is the configuration correct?'
export const CONTEXT_VALUE = {
  BUCKET: 'elan:bucket',
  OBJECT: 'elan:object',
  FOLDER: 'elan:folder',
  CONNECT_ERROR: 'elan:connectError',
  PAGER: 'elan:pager'
}

export const OSS_REGION = [
  'oss-cn-hangzhou',
  'oss-cn-shanghai',
  'oss-cn-qingdao',
  'oss-cn-beijing',
  'oss-cn-zhangjiakou',
  'oss-cn-huhehaote',
  'oss-cn-wulanchabu',
  'oss-cn-shenzhen',
  'oss-cn-heyuan',
  'oss-cn-chengdu',
  'oss-cn-hongkong',
  'oss-us-west-1',
  'oss-us-east-1',
  'oss-ap-southeast-1',
  'oss-ap-southeast-2',
  'oss-ap-southeast-3',
  'oss-ap-southeast-5',
  'oss-ap-northeast-1',
  'oss-ap-south-1',
  'oss-eu-central-1',
  'oss-eu-west-1',
  'oss-me-east-1'
]
