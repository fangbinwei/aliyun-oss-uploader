import vscode from 'vscode'
import OSS from 'ali-oss'
import path from 'path'
import Logger from '../log'
import { TemplateStore } from './templateStore'

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

interface WrapError extends Error {
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
  const uploader = Uploader.get()
  // init OSS instance failed
  if (!uploader) return

  const { progress, progressResolve } = getUploadingProgress(
    `Uploading ${uris.length} image(s)`
  )
  const clipboard: string[] = []

  let finished = 0
  const urisPut = uris.map((uri) => {
    const templateStore = new TemplateStore()
    const ext = path.extname(uri.fsPath)
    const name = path.basename(uri.fsPath, ext)

    templateStore.set('fileName', name)
    templateStore.set('ext', ext)
    const uploadName = templateStore.transform('uploadName')
    const bucketFolder = templateStore.transform('bucketFolder')

    const putName = `${bucketFolder ? bucketFolder + '/' : ''}${uploadName}`
    const u = uploader.put(putName, uri.fsPath)
    u.then((putObjectResult) => {
      progress.report({
        message: `(${++finished} / ${uris.length})`,
        increment: Math.ceil(100 / uris.length)
      })

      templateStore.set('url', putObjectResult.url)
      clipboard.push(templateStore.transform('outputFormat'))

      return putObjectResult
    })
    u.catch((err) => {
      const defaultName = name + ext
      err.imageName =
        uploadName + (uploadName !== defaultName ? `(${defaultName})` : '')
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
      Logger.showErrorMessage(`Failed to upload ${rejects.length} image(s).`)

      // show first error message
      Logger.showErrorMessage(
        (rejects[0].reason as WrapError).message +
          '. See output channel for more details.'
      )

      for (const r of rejects) {
        Logger.log(
          `Failed: ${(r.reason as WrapError).imageName}.` +
            ` Reason: ${(r.reason as WrapError).message}.`
        )
      }
    }, 1000)
  }

  afterUpload(clipboard)
}

function afterUpload(clipboard: string[]): void {
  if (!clipboard.length) return
  const GFM = clipboard.join('\n\n') + '\n\n'
  vscode.env.clipboard.writeText(GFM)
  const activeTextEditor = vscode.window.activeTextEditor
  if (!activeTextEditor || activeTextEditor.document.languageId !== 'markdown')
    return

  activeTextEditor.edit((textEditorEdit) => {
    textEditorEdit.insert(activeTextEditor.selection.active, GFM)
  })
}

function initOSSOptions(): OSS.Options {
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

export class Uploader {
  private static cacheUploader: Uploader | null = null
  private client: OSS
  public expired: boolean
  constructor() {
    this.client = new OSS(initOSSOptions())
    this.expired = false

    // instance is expired if configuration update
    vscode.workspace.onDidChangeConfiguration(() => {
      this.expired = true
    })
  }
  // singleton
  static get(): Uploader | null {
    let u
    try {
      u =
        Uploader.cacheUploader && !Uploader.cacheUploader.expired
          ? Uploader.cacheUploader
          : (Uploader.cacheUploader = new Uploader())
    } catch (err) {
      // TODO: e.g.: require options.endpoint or options.region, how to corresponding to our vscode configuration?
      Logger.showErrorMessage(err.message)
      u = null
    }
    return u
  }
  async put(name: string, fsPath: string): Promise<OSS.PutObjectResult> {
    return this.client.put(name, fsPath)
  }
}
