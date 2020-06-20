import path from 'path'
import vscode from 'vscode'
import crypto from 'crypto'
import fs from 'fs'
import Logger from './log'
import OSS from 'ali-oss'
import { SUPPORT_EXT } from '@/constant'

export function isSubDirectory(parent: string, dir: string): boolean {
  const relative = path.relative(parent, dir)
  return !!relative && !relative.startsWith('..') && !path.isAbsolute(relative)
}

export function getHashDigest(
  uri: vscode.Uri,
  hashType = 'md5',
  digestType: crypto.HexBase64Latin1Encoding = 'hex',
  maxLength: number
): string {
  try {
    maxLength = maxLength || 9999
    const imageBuffer = fs.readFileSync(uri.fsPath)
    const contentHash = crypto
      .createHash(hashType)
      .update(imageBuffer)
      .digest(digestType)

    return contentHash.substr(0, maxLength)
  } catch (err) {
    Logger.showErrorMessage(
      'Failed to calculate contentHash. See output channel for more details.'
    )
    Logger.log(
      `fsPath: ${uri.fsPath}, hashType: ${hashType}, digestType: ${digestType}, maxLength: ${maxLength} ${err.message}`
    )
    return 'EF_BF_BD'
  }
}

export function getActiveMd(): vscode.TextEditor | undefined {
  const activeTextEditor = vscode.window.activeTextEditor
  if (!activeTextEditor || activeTextEditor.document.languageId !== 'markdown')
    return
  return activeTextEditor
}

export function isAliyunOssUri(uri: string): boolean {
  try {
    const vsUri = vscode.Uri.parse(uri)

    if (!['http', 'https'].includes(vsUri.scheme)) return false

    const { bucket, region } = getOSSConfiguration()
    const [_bucket, _region] = vsUri.authority.split('.')
    if (bucket !== _bucket) return false
    if (region !== _region) return false

    const ext = path.extname(vsUri.path).substr(1)
    if (!SUPPORT_EXT.includes(ext)) return false

    return true
  } catch {
    return false
  }
}

export function removeLeadingSlash(p: string): string {
  return p.replace(/^\/+/, '')
}

export function removeTrailingSlash(p: string): string {
  return p.replace(/\/+$/, '')
}

export function getOSSConfiguration(): OSS.Options {
  const config = vscode.workspace.getConfiguration('elan')
  const aliyunConfig = config.get<OSS.Options>('aliyun', {
    accessKeyId: '',
    accessKeySecret: ''
  })
  return {
    secure: true, // ensure protocol of callback url is https
    accessKeyId: aliyunConfig.accessKeyId.trim(),
    accessKeySecret: aliyunConfig.accessKeySecret.trim(),
    bucket: aliyunConfig.bucket?.trim(),
    region: aliyunConfig.region?.trim()
  }
}

export interface Progress {
  progress: vscode.Progress<{ message?: string; increment?: number }>
  progressResolve: (value?: unknown) => void
  progressReject: (value?: unknown) => void
}

export function getProgress(title = 'Uploading object'): Progress {
  let progressResolve, progressReject, progress
  vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title
    },
    (p) => {
      return new Promise((resolve, reject) => {
        progressResolve = resolve
        progressReject = reject
        progress = p
      })
    }
  )
  if (!progress || !progressResolve || !progressReject)
    throw new Error('Failed to init vscode progress')
  return {
    progress,
    progressResolve,
    progressReject
  }
}

export async function showFolderNameInputBox(
  folderPlaceholder: string
): Promise<string | undefined> {
  return vscode.window.showInputBox({
    value: removeLeadingSlash(folderPlaceholder),
    placeHolder: `Enter folder name. e.g., 'example/folder/name/', '' means root folder`,
    validateInput: (text) => {
      text = text.trim()
      if (text === '') return null
      if (text[0] === '/') return `Please do not start with '/'.`
      if (!text.endsWith('/')) return `Please end with '/'`
      return null
    }
  })
}

export async function showObjectNameInputBox(
  objectNamePlaceholder: string,
  options?: vscode.InputBoxOptions
): Promise<string | undefined> {
  return vscode.window.showInputBox({
    value: removeLeadingSlash(objectNamePlaceholder),
    placeHolder: `Enter target name. e.g., 'example/folder/name/target.jpg'`,
    validateInput: (text) => {
      text = text.trim()
      if (text[0] === '/') return `Please do not start with '/'.`
      if (text === '') return `Please enter target name.`
    },
    ...options
  })
}
