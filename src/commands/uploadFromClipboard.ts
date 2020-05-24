import Logger from '../utils/log'
import path from 'path'
import fs from 'fs'
import execa from 'execa'
import os from 'os'
import { uploadUris } from '../utils/uploader/index'
import vscode from 'vscode'
import { format } from 'date-fns'

interface ClipboardImage {
  noImage: boolean
  data: string
}

export default async function uploadImage(): Promise<void> {
  const targetPath = path.resolve(
    os.tmpdir(),
    format(new Date(), 'yyyy-MM-dd-HH-mm-ss') + '.png'
  )
  const clipboardImage = await saveClipboardImageToFile(targetPath)
  if (!clipboardImage) return
  if (clipboardImage.noImage) {
    Logger.showErrorMessage('The clipboard does not contain image data.')
    return
  }
  await uploadUris([vscode.Uri.file(targetPath)])
}

export async function saveClipboardImageToFile(
  targetFilePath: string
): Promise<ClipboardImage | undefined> {
  const platform = process.platform
  let saveResult

  try {
    if (platform === 'win32') {
      saveResult = await saveWin32ClipboardImageToFile(targetFilePath)
    } else if (platform === 'darwin') {
      saveResult = await saveMacClipboardImageToFile(targetFilePath)
    } else {
      saveResult = await saveLinuxClipboardImageToFile(targetFilePath)
    }
    return saveResult
  } catch (err) {
    // encoding maybe wrong(powershell may use gbk encoding in China, etc)
    Logger.showErrorMessage(err.message)
  }
}

function getClipboardConfigPath(fileName: string): string {
  return path.resolve(__dirname, '../utils/clipboard/', fileName)
}

async function saveWin32ClipboardImageToFile(
  targetFilePath: string
): Promise<ClipboardImage | undefined> {
  const scriptPath = getClipboardConfigPath('pc.ps1')

  let command = 'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
  const powershellExisted = fs.existsSync(command)
  command = powershellExisted ? command : 'powershell'
  try {
    const { stdout } = await execa(command, [
      '-noprofile',
      '-noninteractive',
      '-nologo',
      '-sta',
      '-executionpolicy',
      'unrestricted',
      '-windowstyle',
      'hidden',
      '-file',
      scriptPath,
      targetFilePath
    ])

    return { noImage: stdout === 'no image', data: stdout }
  } catch (err) {
    if (err.code === 'ENOENT') {
      Logger.showErrorMessage('Failed to execute powershell')
      return
    }
    throw err
  }
}

async function saveMacClipboardImageToFile(
  targetFilePath: string
): Promise<ClipboardImage | undefined> {
  const scriptPath = getClipboardConfigPath('mac.applescript')

  const { stderr, stdout } = await execa('osascript', [
    scriptPath,
    targetFilePath
  ])
  if (stderr) {
    Logger.showErrorMessage(stderr)
    return
  }
  return { noImage: stdout === 'no image', data: stdout }
}

async function saveLinuxClipboardImageToFile(
  targetFilePath: string
): Promise<ClipboardImage | undefined> {
  const scriptPath = getClipboardConfigPath('linux.sh')

  const { stderr, stdout } = await execa('sh', [scriptPath, targetFilePath])
  if (stderr) {
    Logger.showErrorMessage(stderr)
    return
  }
  return { noImage: stdout === 'no image', data: stdout }
}
