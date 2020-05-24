import vscode from 'vscode'
interface RawConfig {
  outputFormat: string
  uploadName: string
}

function getRe(match: string): RegExp {
  return new RegExp(`\\$\\{${match}\\}`)
}

const fileNameRe = getRe('fileName')
const uploadNameRe = getRe('uploadName')
const urlRe = getRe('url')
const extNameRe = getRe('extName')

interface Template {
  fileName: string
  uploadName: string
  url: string
  extName: string
}

class TemplateStore {
  private fileName = ''
  private uploadName = ''
  private url = ''
  private extName = ''
  public raw = this.rawConfig()
  private rawConfig(): RawConfig {
    const config = vscode.workspace.getConfiguration('elan')

    return {
      outputFormat: config.get<string>('outputFormat') || '',
      uploadName: config.get<string>('uploadName') || ''
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
          .replace(extNameRe, this.extName)

        this.set('uploadName', uploadName)
        return uploadName
      }
      case 'outputFormat': {
        const outputFormat = this.raw.outputFormat
          .replace(fileNameRe, this.fileName)
          .replace(uploadNameRe, this.uploadName)
          .replace(urlRe, this.url)

        return outputFormat
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
