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
  public configuration: OSS.Options
  public expired: boolean
  constructor() {
    this.configuration = getOssConfiguration()
    this.client = new OSS(this.configuration)
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

  async list(
    query: OSS.ListObjectsQuery,
    options?: OSS.RequestOptions
  ): Promise<OSS.ListObjectResult> {
    const defaultConfig = {
      'max-keys': 100,
      delimiter: '/'
    }
    query = Object.assign(defaultConfig, query)
    return this.client.list(query, options)
  }
}
