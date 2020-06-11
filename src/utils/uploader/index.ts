import vscode from 'vscode'
import OSS from 'ali-oss'
import Logger from '@/utils/log'
import { getOssConfiguration } from '@/utils/index'

interface DeleteResponse {
  res: OSS.NormalSuccessResponse
}

export default class Uploader {
  private static cacheUploader: Uploader | null = null
  private client: OSS
  public expired: boolean
  constructor() {
    this.client = new OSS(getOssConfiguration())
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
  async put(
    name: string,
    fsPath: string,
    options?: OSS.PutObjectOptions
  ): Promise<OSS.PutObjectResult> {
    return this.client.put(name, fsPath, options)
  }
  async delete(
    name: string,
    options?: OSS.RequestOptions
  ): Promise<DeleteResponse> {
    // FIXME: @types/ali-oss bug, I will create pr
    return this.client.delete(name, options) as any
  }
}
