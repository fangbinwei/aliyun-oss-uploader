import vscode from 'vscode'
import path from 'path'
import { isSubDirectory } from '../index'

interface RawConfig {
  outputFormat: string
  uploadName: string
  bucketFolder: string
}

function getRe(match: keyof Template): RegExp {
  return new RegExp(`\\$\\{${match}\\}`, 'g')
}

const fileNameRe = getRe('fileName')
const uploadNameRe = getRe('uploadName')
const urlRe = getRe('url')
const extRe = getRe('ext')
const relativeToVsRootPathRe = getRe('relativeToVsRootPath')

interface Template {
  fileName: string
  uploadName: string
  url: string
  ext: string
  relativeToVsRootPath: string
}

class TemplateStore {
  private fileName = ''
  private uploadName = ''
  private url = ''
  private ext = ''
  private relativeToVsRootPath = ''
  public raw = this.rawConfig()
  private rawConfig(): RawConfig {
    const config = vscode.workspace.getConfiguration('elan')

    return {
      outputFormat: config.get<string>('outputFormat')?.trim() || '',
      uploadName: config.get<string>('uploadName')?.trim() || '',
      bucketFolder: config.get<string>('bucketFolder')?.trim() || ''
    }
  }

  set(key: keyof Template, value: string): void {
    this[key] = value
  }
  transform(key: keyof RawConfig): string {
    switch (key) {
      case 'uploadName': {
        const uploadName = this.raw.uploadName
          .replace(fileNameRe, this.fileName)
          .replace(extRe, this.ext)

        this.set('uploadName', uploadName)
        return uploadName || this.fileName
      }
      case 'outputFormat': {
        const outputFormat = this.raw.outputFormat
          .replace(fileNameRe, this.fileName)
          .replace(uploadNameRe, this.uploadName)
          .replace(urlRe, this.url)

        return outputFormat
      }
      // TODO: slash compatible
      case 'bucketFolder': {
        const workspaceFolders = vscode.workspace.workspaceFolders

        const activeTextEditorFilename =
          vscode.window.activeTextEditor?.document.fileName
        if (workspaceFolders && activeTextEditorFilename) {
          const rootPath = workspaceFolders[0].uri.fsPath
          const activeTextEditorFolder = path.dirname(activeTextEditorFilename)

          const relativePath = path.relative(rootPath, activeTextEditorFolder)
          if (isSubDirectory(rootPath, activeTextEditorFolder)) {
            this.set(
              'relativeToVsRootPath',
              path.sep === '\\' // windows
                ? relativePath.split('\\').join('/')
                : relativePath
            )
          }
        }

        const bucketFolder = this.raw.bucketFolder.replace(
          relativeToVsRootPathRe,
          this.relativeToVsRootPath
        )

        return bucketFolder
      }

      default:
        exhaustiveCheck(key)
    }

    function exhaustiveCheck(message: never): never {
      throw new Error(message)
    }
  }
}

export { TemplateStore }
