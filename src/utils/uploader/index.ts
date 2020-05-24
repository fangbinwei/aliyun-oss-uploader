import vscode from 'vscode'
import OSS from 'ali-oss'
import path from 'path'
import Logger from '../log'
import { TemplateStore } from './templateStore'

let uploader: Uploader | null = null

declare global {
  interface PromiseConstructor {
    allSettled(
      promises: Array<Promise<unknown>>
    ): Promise<
      Array<{
        status: 'fulfilled' | 'rejected'
        value?: unknown
        reason?: unknown
      }>
    >
  }
}

interface WrapError {
  raw: unknown
  imageName: string
}

interface UploadingProgress {
  progress: vscode.Progress<{ message?: string; increment?: number }>
  progressResolve: (value?: unknown) => void
  progressReject: (value?: unknown) => void
}

function getUploadingProgress(title = 'Uploading image'): UploadingProgress {
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

export async function uploadUris(uris: vscode.Uri[]): Promise<void> {
  const uploader = getUploader()
  const { progress, progressResolve } = getUploadingProgress(
    `Uploading ${uris.length} image(s)`
  )
  const clipboard: string[] = []

  let finished = 0
  const urisPut = uris.map((uri) => {
    const templateStore = new TemplateStore()
    const extName = path.extname(uri.fsPath)
    const name = path.basename(uri.fsPath, extName)

    templateStore.set('fileName', name)
    templateStore.set('extName', extName)
    const uploadName = templateStore.transform('uploadName')

    const u = uploader.put(uploadName, uri.fsPath)
    u.then((putObjectResult) => {
      progress.report({
        message: `(${++finished} / ${uris.length})`,
        increment: Math.ceil(100 / uris.length)
      })

      templateStore.set('url', putObjectResult.url)
      clipboard.push(templateStore.transform('outputFormat'))

      return putObjectResult
    }).catch((err) => {
      const wrapError = {
        raw: err,
        imageName: name
      }
      return wrapError
    })
    return u
  })

  const settled = await Promise.allSettled(urisPut)
  const rejects = settled.filter((r) => {
    return r.status === 'rejected'
  })

  if (!rejects.length) {
    progress.report({
      message: 'Finish.'
    })

    setTimeout(() => {
      progressResolve()
    }, 1000)
  } else {
    progress.report({
      message: `${uris.length - rejects.length} images uploaded.`
    })
    setTimeout(() => {
      progressResolve()
      Logger.showErrorMessage(
        `Failed to upload these images: ${rejects
          .map((r) => {
            return (r.reason as WrapError).imageName
          })
          .join(',')}`
      )
    }, 1000)
  }

  afterUpload(clipboard)
}

function afterUpload(clipboard: string[]): void {
  if (!clipboard.length) return
  const GFM = clipboard.join('\n\n')
  vscode.env.clipboard.writeText(GFM)
  const activeTextEditor = vscode.window.activeTextEditor
  if (!activeTextEditor) return

  activeTextEditor.edit((textEditorEdit) => {
    textEditorEdit.insert(activeTextEditor.selection.active, GFM)
  })
}

export function getUploader(): Uploader {
  return uploader || (uploader = new Uploader())
}

function initOSSOptions(): OSS.Options {
  const config = vscode.workspace.getConfiguration('elan')
  const aliyunConfig = config.get<OSS.Options>('aliyun', {
    accessKeyId: '',
    accessKeySecret: ''
  })
  return {
    accessKeyId: aliyunConfig.accessKeyId.trim(),
    accessKeySecret: aliyunConfig.accessKeySecret.trim(),
    bucket: aliyunConfig.bucket?.trim(),
    region: aliyunConfig.region?.trim()
  }
}

class Uploader {
  client: OSS
  constructor() {
    this.client = new OSS(initOSSOptions())
    vscode.workspace.onDidChangeConfiguration(() => {
      this.client = new OSS(initOSSOptions())
    })
  }
  async put(name: string, fsPath: string): Promise<OSS.PutObjectResult> {
    return this.client.put(name, fsPath)
  }
}
