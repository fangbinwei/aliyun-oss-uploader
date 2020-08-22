import vscode from 'vscode'
import path from 'path'
import { TemplateStore } from './templateStore'
import Logger from '@/utils/log'
import { getActiveMd, getProgress } from '@/utils/index'
import Uploader from './index'
import { URL } from 'url'

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

export async function uploadUris(
  uris: vscode.Uri[],
  bucketFolder?: string
): Promise<void> {
  const uploader = Uploader.get()
  // init OSS instance failed
  if (!uploader) return

  const { progress, progressResolve } = getProgress(
    `Uploading ${uris.length} object(s)`
  )
  const clipboard: string[] = []

  let finished = 0
  const urisPut = uris.map((uri) => {
    const templateStore = new TemplateStore()
    const ext = path.extname(uri.fsPath)
    const name = path.basename(uri.fsPath, ext)
    const activeMd = getActiveMd()
    if (activeMd) {
      const fileName = activeMd.document.fileName
      const ext = path.extname(fileName)
      const name = path.basename(fileName, ext)
      templateStore.set('activeMdFilename', name)
    }

    templateStore.set('fileName', name)
    templateStore.set('ext', ext)
    templateStore.set('imageUri', uri)

    const uploadName = templateStore.transform('uploadName')
    const bucketFolderFromConfiguration = templateStore.transform(
      'bucketFolder'
    )

    if (bucketFolder == null) bucketFolder = bucketFolderFromConfiguration
    const putName = `${bucketFolder || ''}${uploadName}`
    const u = uploader.put(putName, uri.fsPath)
    u.then((putObjectResult) => {
      progress.report({
        message: `(${++finished} / ${uris.length})`,
        increment: Math.ceil(100 / uris.length)
      })

      templateStore.set('url', putObjectResult.url)
      templateStore.set('pathname', new URL(putObjectResult.url).pathname)
      clipboard.push(templateStore.transform('outputFormat'))

      return putObjectResult
    }).catch((err) => {
      Logger.log(err.stack)
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
      message: `${uris.length - rejects.length} objects uploaded.`
    })
    setTimeout(() => {
      progressResolve()
      Logger.showErrorMessage(`Failed to upload ${rejects.length} object(s).`)

      // show first error message
      Logger.showErrorMessage(
        (rejects[0].reason as WrapError).message +
          '. See output channel for more details.'
      )

      for (const r of rejects) {
        Logger.log(
          `Failed: ${(r.reason as WrapError).imageName}.` +
            ` Reason: ${(r.reason as WrapError).message}`
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

  const activeTextMd = getActiveMd()
  activeTextMd?.edit((textEditorEdit) => {
    textEditorEdit.insert(activeTextMd.selection.active, GFM)
  })
}
