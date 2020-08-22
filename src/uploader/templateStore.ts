import vscode from 'vscode'
import path from 'path'
import { getHashDigest } from '@/utils/index'
import { getDate, format, getYear } from 'date-fns'

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
const activeMdFilenameRe = getRe('activeMdFilename')
const dateRe = getRe('date')
const monthRe = getRe('month')
const yearRe = getRe('year')
const pathnameRe = getRe('pathname')
// ${<hashType>:hash:<digestType>:<length>}
const contentHashRe = /\$\{(?:([^:}]+):)?contentHash(?::([a-z]+\d*))?(?::(\d+))?\}/gi

interface Store {
  readonly year: string
  readonly month: string
  readonly date: string
  // maybe should named to filename ....
  fileName: string
  pathname: string
  activeMdFilename: string
  uploadName: string
  url: string
  ext: string
  relativeToVsRootPath: string
  contentHash: string
  imageUri: vscode.Uri | null
}

class TemplateStore {
  private store: Store = {
    get year(): string {
      return getYear(new Date()).toString()
    },
    get month(): string {
      return format(new Date(), 'MM')
    },
    get date(): string {
      const d = getDate(new Date()).toString()
      return d.length > 1 ? d : '0' + d
    },
    fileName: '',
    activeMdFilename: '',
    uploadName: '',
    url: '',
    pathname: '',
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
          .replace(activeMdFilenameRe, this.get('activeMdFilename'))

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
          .replace(pathnameRe, this.get('pathname'))
          .replace(activeMdFilenameRe, this.get('activeMdFilename'))

        return outputFormat
      }
      case 'bucketFolder': {
        const activeTextEditorFilename =
          vscode.window.activeTextEditor?.document.fileName

        let bucketFolder = this.raw.bucketFolder
        if (
          relativeToVsRootPathRe.test(this.raw.bucketFolder) &&
          vscode.workspace.workspaceFolders &&
          activeTextEditorFilename
        ) {
          const activeTextEditorFolder = path.dirname(activeTextEditorFilename)

          // when 'includeWorkspaceFolder' is true, name of the workspaceFolder is prepended
          // here we don't prepend workspaceFolder name
          const relativePath = vscode.workspace.asRelativePath(
            activeTextEditorFolder,
            false
          )
          if (relativePath !== activeTextEditorFolder) {
            this.set('relativeToVsRootPath', relativePath)
          }
        }

        bucketFolder = this.raw.bucketFolder
          .replace(relativeToVsRootPathRe, this.get('relativeToVsRootPath'))
          .replace(activeMdFilenameRe, this.get('activeMdFilename'))
          .replace(yearRe, this.get('year'))
          .replace(monthRe, this.get('month'))
          .replace(dateRe, this.get('date'))

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
