import path from 'path'
import vscode from 'vscode'
import crypto from 'crypto'
import fs from 'fs'
import Logger from './log'

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
