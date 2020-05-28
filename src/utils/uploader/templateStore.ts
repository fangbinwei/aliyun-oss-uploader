import vscode from 'vscode'
import path from 'path'
import { isSubDirectory, getHashDigest } from '../index'

interface RawConfig {
  outputFormat: string
  uploadName: string
  bucketFolder: string
}

function getRe(match: keyof Store): RegExp {
  return new RegExp(`\\$\\{${match}\\}`, 'gi')
}

const fileNameRe = getRe('fileName')
const uploadNameRe = getRe('uploadName')
const urlRe = getRe('url')
const extRe = getRe('ext')
const relativeToVsRootPathRe = getRe('relativeToVsRootPath')
// ${<hashType>:hash:<digestType>:<length>}
const contentHashRe = /\$\{(?:([^:}]+):)?contentHash(?::([a-z]+\d*))?(?::(\d+))?\}/gi

interface Store {
  fileName: string
  uploadName: string
  url: string
  ext: string
  relativeToVsRootPath: string
  contentHash: string
  imageUri: vscode.Uri | null
}

class TemplateStore {
  private store: Store = {
    fileName: '',
    uploadName: '',
    url: '',
    ext: '',
    relativeToVsRootPath: '',
    contentHash: '',
    imageUri: null
  }
  public raw = this.rawConfig()

  private rawConfig(): RawConfig {
    const config = vscode.workspace.getConfiguration('elan')

    return {
      outputFormat: config.get<string>('outputFormat')?.trim() || '',
      uploadName: config.get<string>('uploadName')?.trim() || '',
      bucketFolder: config.get<string>('bucketFolder')?.trim() || ''
    }
  }

  set<K extends keyof Store>(key: K, value: Store[K]): void {
    this.store[key] = value
  }
  get<K extends keyof Store>(key: K): Store[K] {
    return this.store[key]
  }
  transform(key: keyof RawConfig): string {
    switch (key) {
      case 'uploadName': {
        let uploadName = this.raw.uploadName
          .replace(fileNameRe, this.get('fileName'))
          .replace(extRe, this.get('ext'))

        const imageUri = this.get('imageUri')
        if (imageUri) {
          uploadName = uploadName.replace(
            contentHashRe,
            (_, hashType, digestType, maxLength) => {
              return getHashDigest(
                imageUri,
                hashType,
                digestType,
                parseInt(maxLength, 10)
              )
            }
          )
        }

        this.set('uploadName', uploadName)
        return uploadName || this.get('fileName')
      }
      case 'outputFormat': {
        const outputFormat = this.raw.outputFormat
          .replace(fileNameRe, this.get('fileName'))
          .replace(uploadNameRe, this.get('uploadName'))
          .replace(urlRe, this.get('url'))

        return outputFormat
      }
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

        let bucketFolder = this.raw.bucketFolder.replace(
          relativeToVsRootPathRe,
          this.get('relativeToVsRootPath')
        )
        // since relativeToVsRootPath may be empty string, normalize it
        bucketFolder =
          bucketFolder
            .split('/')
            .filter((s) => s !== '')
            .join('/') + '/'

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
