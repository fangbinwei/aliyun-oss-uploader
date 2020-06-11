# Aliyun OSS Uploader

<p align="center">
  <br />
  <img src="https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/logo_368a1b87.png" alt="Élan Logo. Logo designed by https://www.launchaco.com/"/ width="400">
</p>

> Élan is a vscode extension focus on uploading image to Alibaba Cloud (Aliyun) OSS.

## Support
If you find it useful, please [star me on Github](https://github.com/fangbinwei/aliyun-oss-uploader).

## Usage

1. You should create the [OSS instance](https://www.aliyun.com/product/oss/?lang=en) and get the `accessKeyId` and `accessKeySecret`. Then you should create bucket instance and get the `bucket` name. [see chapter 'Create bucket'](#create-bucket)

2. Setting the configuration of the extension

### Upload Image(s)

* Open the command panel (`ctrl+shift+p`/`command+shift+p`/`F1`) and type 'elan'.
  - upload image from clipboard
  - upload image from explorer

* Right click the image of file explorer, click the menu item `Elan: upload image`

### Delete Image

* Hover the image syntax in markdown, click `Delete image` to delete the image in OSS.

![hoverDeleteCut](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/hoverDeleteCut_f9af47b7.png)

### Usage Demo

#### Upload from clipboard

![updateFromClipboard](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/updateFromClipboard_bf2399e2.gif)

#### Upload by explorer dialog

![updateFromExplorer](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/updateFromExplorer_9f6ee648.gif)


#### Upload by explorer context

![updateFromExplorerContext](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/updateFromExplorerContext_37c3aac0.gif)

> demo gif upload by this vscode extension.

#### Delete image

![hoverDelete](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/hoverDelete_d27177e2.gif)

## Configuration
### `elan.aliyun.accessKeyId`
### `elan.aliyun.accessKeySecret`
### `elan.aliyun.bucket`
### `elan.aliyun.region`
  e.g. `oss-cn-shanghai`, [check details](https://github.com/ali-sdk/ali-oss#data-regions).

### `elan.uploadName`
Object name store on OSS

Default: `${fileName}_${contentHash:8}${ext}`

- `${fileName}`: Filename of uploaded file.
- `${ext}`: Filename extension of uploaded file.
- `${contentHash}`: The hash of image. By default, it's the hex digest of md5 hash. You can specify the length of the hash, e.g. `${contentHash:8}`.
- `${activeMdFilename}`: Filename of active markdown in text editor.

Support `${<hashType>:hash:<digestType>:<length>}`, default:
```js
crypto.createHash('md5')
  .update(imageBuffer)
  .digest('hex')
  .substr(0, maxLength)`

```

### `elan.outputFormat`
After uploading image, this output will be pasted to your clipboard. If you have opened a *.md, this will be pasted to your markdown automatically .

- `${fileName}`: Filename of uploaded file.
- `${uploadName}`: see `elan.uploadName`.
- `${url}`: After a file is uploaded successfully, the OSS sends a callback request to this URL.
- `${activeMdFilename}`: Filename of active markdown in text editor.

### `elan.bucketFolder`
By default, you can find your image object by `elan.uploadName`, e.g. `example.png`. If we set `elan.bucketFold` to `github/aliyun-oss-uploader`, our images will be upload to "folder" ([not a real folder](https://help.aliyun.com/document_detail/31827.html)). You can find uploaded image in "folder" `github/aliyun-oss-uploader/`.

![oss browser](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/2020-05-31-19-02-13_55660788.png)

- `${relativeToVsRootPath}`: The path of the directory where the currently active file is located relative to the workspace root directory
- `${activeMdFilename}`: Filename of active markdown in text editor.

For example, you set `elan.bucketFold` to `blog/${relativeToVsRootPath}/`, and workspace is like below

```bash
.
├── FrontEnd
│   └── Engineering
│       └── webpack
│            ├── example.js
│            └── example.md
```

If you open the `example.md` by text editor, the "folder" will be `blog/FrontEnd/Engineering/webpack/`.

Or you set `elan.bucketFold` to `blog/${relativeToVsRootPath}/${activeMdFilename}/`, the "folder" will be `blog/FrontEnd/Engineering/webpack/example/`.

If no file is opened, `${relativeToVsRootPath}` will be parsed to `''`, . If no active markdown, `${activeMdFilename}` will be parsed to `''`.

|    opened file    | `blog/${relativeToVsRootPath}/` | `blog/${relativeToVsRootPath}/${activeMdFilename}/` |
| ---------- | --- | --- |
| example.md |  blog/FrontEnd/Engineering/webpack/ | blog/FrontEnd/Engineering/webpack/example/ |
| example.js       |  blog/FrontEnd/Engineering/webpack/ | blog/FrontEnd/Engineering/webpack/ |
| no opened file       |  blog/ | blog/ |


## Create Bucket

![create-bucket](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/create-bucket_5f7df897.png)

## Debugger Project

If you want to debugger the project, please run `yarn webpack-dev` first, and press `F5` to Run Extension. Then we can debugger the output of webpack dist.

> I'm trying to find a better way ...

## TODO

* [x] aliyun oss
* [x] upload image by explorer dialog
* [x] upload image from clipboard
* [x] specify 'folder' of bucket
* [x] upload image from explorer context (sidebar)
* [x] content hash
* [x] extension icon
* [x] bundle by webpack/rollup
* [x] enhance 'bucketFolder'
* [x] delete image when hover GFM(github flavored markdown)
* [ ] confirmation before deleting image
* [ ] inquire before upload to check folder
* [ ] decoupling logic by tapable
* [ ] upload embed svg as *.svg from clipboard
* [ ] image compress (by imagemin/ aliyun OSS can realize it by adding '?x-oss-process=' after url)
* [ ] x-oss-process & vscode.CodeActionProvider
* [ ] unit test
* [ ] editor/title button to upload image
* [ ] sidebar extension (e.g. show recent uploaded image)
* [ ] drag image and drop to markdown. [Limit](https://github.com/microsoft/vscode/issues/5240)
* [ ] add keyboard shortcut for explorer/context command. [Limit](https://github.com/microsoft/vscode/issues/3553)