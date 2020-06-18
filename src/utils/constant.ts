export enum CommandContext {
  BUCKET_EXPLORER_UPLOAD_CLIPBOARD = 'elan.bucketExplorer.uploadFromClipboard',
  BUCKET_EXPLORER_UPLOAD_CONTEXT = 'elan.bucketExplorer.uploadFromContext',
  BUCKET_EXPLORER_DELETE_CONTEXT = 'elan.bucketExplorer.deleteFromContext',
  BUCKET_EXPLORER_REFRESH_ROOT = 'elan.bucketExplorer.refreshRoot'
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
  BUCKET: 'bucket',
  OBJECT: 'object',
  FOLDER: 'folder',
  CONNECT_ERROR: 'connectError'
}
