import vscode from 'vscode'
import OSS from 'ali-oss'
import Logger from '@/utils/log'
import { getElanConfiguration, ElanConfiguration } from '@/utils/index'
import { ext } from '@/extensionVariables'

interface DeleteResponse {
  res: OSS.NormalSuccessResponse
}

export default class Uploader {
  private static cacheUploader: Uploader | null = null
  private client: OSS
  public configuration: ElanConfiguration
  public expired: boolean
  constructor() {
    this.configuration = getElanConfiguration()
    this.client = new OSS({
      bucket: this.configuration.bucket,
      region: this.configuration.region,
      accessKeyId: this.configuration.accessKeyId,
      accessKeySecret: this.configuration.accessKeySecret,
      secure: this.configuration.secure,
      cname: !!this.configuration.customDomain,
      endpoint: this.configuration.customDomain || undefined
    })
    this.expired = false

    // instance is expired if configuration update
    ext.context.subscriptions.push(
      vscode.workspace.onDidChangeConfiguration(() => {
        this.expired = true
      })
    )
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
      'max-keys': this.configuration.maxKeys,
      delimiter: '/'
    }
    query = Object.assign(defaultConfig, query)
    return this.client.list(query, options)
  }

  async copy(
    name: string,
    sourceName: string,
    sourceBucket?: string,
    options?: OSS.CopyObjectOptions
  ): Promise<OSS.CopyAndPutMetaResult> {
    return this.client.copy(name, sourceName, sourceBucket, options)
  }
}
