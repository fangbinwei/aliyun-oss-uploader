import Logger from '../utils/log'
import path from 'path'
import fs from 'fs'
import execa from 'execa'
import os from 'os'
import { uploadFsPaths } from '../utils/uploader/index'
import vscode from 'vscode'

interface ClipboardImage {
  noImage: boolean
  data: string
}

export default async function uploadImage(): Promise<void> {
  const targetPath = path.resolve(os.tmpdir(), Date.now().toString())
  const clipboardImage = await saveClipboardImageToFile(targetPath)
  if (!clipboardImage) return
  if (clipboardImage.noImage) {
    Logger.showErrorMessage('no image')
    return
  }
  await uploadFsPaths([vscode.Uri.file(targetPath)])
}

export async function saveClipboardImageToFile(
  targetFilePath: string
): Promise<ClipboardImage | undefined> {
  const platform = process.platform
  let saveResult

  if (platform === 'win32') {
    saveResult = await saveWin32ClipboardImageToFile(targetFilePath)
  } else if (platform === 'darwin') {
    saveResult = await saveMacClipboardImageToFile(targetFilePath)
  } else {
    saveResult = await saveLinuxClipboardImageToFile(targetFilePath)
  }
  return saveResult
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

  const { stderr, stdout } = await execa(command, [
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

  if (stderr) {
    Logger.showErrorMessage(stderr)
    return
  }
  return { noImage: stdout === 'no image', data: stdout }
}

async function saveMacClipboardImageToFile(
  targetFilePath: string
): Promise<ClipboardImage | undefined> {
  const scriptPath = getClipboardConfigPath('mac.applescript')

  try {
    const { stderr, stdout } = await execa('osascript', [
      scriptPath,
      targetFilePath
    ])
    if (stderr) {
      Logger.showErrorMessage(stderr)
      return
    }
    return { noImage: stdout === 'no image', data: stdout }
  } catch (err) {
    Logger.showErrorMessage(err.message)
  }
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
