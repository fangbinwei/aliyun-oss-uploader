# Aliyun OSS Uploader

<p align="center">
  <br />
  <img src="https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/logo_368a1b87.png" alt="Élan Logo. Logo designed by https://www.launchaco.com/"/ width="400">
</p>

> Élan is a vscode extension focus on uploading image to Alibaba Cloud (Aliyun) OSS.

[English README](https://github.com/fangbinwei/aliyun-oss-uploader/blob/master/README_en_US.md)

## Support
If you find it useful, please [star me on Github](https://github.com/fangbinwei/aliyun-oss-uploader).

## Usage

1. 首先需要在阿里云上创建一个[OSS实例](https://www.aliyun.com/product/oss/?lang=en), 创建一个新的bucket, 获取`accessKeyId` and `accessKeySecret`, 具体可以参考[这里](#create-bucket)

2. 设置插件的配置

- 初次使用可以在侧边栏点击插件的图标, 里面有个按钮可以帮助设置配置.
- 在命令面板(`ctrl+shift+p`/`command+shift+p`/`F1`)输入`elan set configuration`, 和上面点击按钮设置配置的效果一样.
- 当然也可以直接在vscode的配置页面找到本插件, 进行配置

![set configuration](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/setConfiguration.png)


### 上传图片

* bucket树上传指定图片/剪贴板中的图片
* 使用命令来上传指定图片/剪贴板中的图片
  - 在命令版中输入'elan' 可以看到对应命令

* 在vscode的文件explorer中右键图片, 选择上传(`Elan: upload image`)

### 删除已上传的图片
* bucket树中右键要删除的图片, 进行删除

* 在markdown中, 鼠标hover到图片的语法上, 点击`Delete image`

> 暂时只支持markdown的图片语法

### 预览bucket中的图片
图片上传到OSS的bucket中后, 可以在bucket树中, 点击要预览的图片进行预览.

![image preview](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/image-preview.png)

### Usage Demo (Bucket TreeView)

#### 上传系统中的图片/剪贴板中的图片
在bucket树中, 右键‘文件夹’或者bucket, 然后填写上传路径, 选择上传的图片, 进行上传. 上传完后, 你的剪贴板中会有markdown图片语法的输出, 你可以直接粘贴进行使用. 如果你已经打开了一个markdown文件, 会自动粘贴到你的文件中.

![bucketTreeView_upload](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/bucketTreeView_upload_9d027122.png)

#### 复制/移动/重命名/删除 bucket中的图片
在bucket树中, 右键要操作的图片, 选择复制, 然后填写目标路径, 进行复制. 选择移动/重命名, 则要求填写的目标名称(包括路径和文件名).

![bucketTreeView_delete_copy_move](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/bucketTreeView_delete_copy_move_240549f5.png)

### 复制bucket中对象的链接
点击文件右侧的链接🔗图标, 即可复制

![bucketTreeView_copy_link](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/bucketTreeView_copy_link_6e710ef5.png)

### Usage Demo (Other)

#### 使用命令上传剪贴板中的图片
打开命令面板, 输入`elan upload from clipboard`

![updateFromClipboard](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/updateFromClipboard_bf2399e2.gif)

#### 通过vscode的dialog选择图片上传
打开命令面板, 输入`elan upload from explorer`

![updateFromExplorer](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/updateFromExplorer_9f6ee648.gif)


#### 在vscode的文件explorer选择文件上传
在文件explorer中, 右键要上传的图片, 选择`elan: upload image`

![updateFromExplorerContext](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/updateFromExplorerContext_37c3aac0.gif)

#### 通过hover删除图片

![hoverDeleteCut](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/hoverDeleteCut_f9af47b7.png)

![hoverDelete](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/hoverDelete_03dc5db7.gif)

> 本README中所用的图片都是用本插件上传的

## 配置信息
### `elan.aliyun.accessKeyId`
### `elan.aliyun.accessKeySecret`
### `elan.aliyun.bucket`
### `elan.aliyun.region`
  例如 `oss-cn-shanghai`, [具体可以查看这里](https://github.com/ali-sdk/ali-oss#data-regions).

### `elan.uploadName`
所上传的OSS对象, 在OSS中的命名

默认格式: `${fileName}_${contentHash:8}${ext}`

- `${fileName}`: 所上传的文件名
- `${ext}`: 所上传文件的扩展后缀, 例如`.png`.
- `${contentHash}`: 文件内容的hash值. 和webpack的`contentHash`类似, 也可以指定选择使用的位数.
- `${activeMdFilename}`: 如果当前打开了markdown文件, 这个就指所打开md文件的文件名.

`contentHash`的计算方式, `${<hashType>:hash:<digestType>:<length>}`, 默认`hashType`是`md5`, `digestType`为`hex`

```js
crypto.createHash('md5')
  .update(imageBuffer)
  .digest('hex')
  .substr(0, maxLength)

```

### `elan.outputFormat`
成功上传后, 剪贴板中会有一段输出的字符串, 这个配置决定了输出字符串的格式. 如果你当前打开了一个markdown文件, 这段字符串会自动插入到你的markdown文件中.

- `${fileName}`: 文件名
- `${uploadName}`: 在oss中所保存的文件名, 是在`elan.uploadName`中配置的.
- `${url}`: 文件的url.
- `${activeMdFilename}`: 如果上传的时候, 打开了md文件, 这个就是md文件名.

### `elan.bucketFolder`
> 如果你觉得这个配置有点复杂, 又想将文件上传到指定的文件夹, 建议在bucket树中上传

默认情况, 你的文件上传到bucket后, 它都是在bucket的‘根目录’, 文件命名是由`elan.uploadName`决定的. 但是有时候希望能用‘文件夹’来组织所上传的文件, 这个配置就有用了. 

> 如果在bucket树中上传, 则不需要这个配置, 因为bucket树中上传的时候可以直接指定文件路径

举个例子, 上传`example.png`. 如果设置`elan.bucketFold` 为 `github/aliyun-oss-uploader`, 那我们的图片就会被上传到"文件夹" `github/aliyun-oss-uploader/`中. 我们这里提到的文件夹和传统的文件夹不一样, [OSS只是模拟了文件夹](https://help.aliyun.com/document_detail/31827.html), 其实我们上传的`example.png`在OSS中保存的是`github/aliyun-oss-uploader/example.png`, OSS只是用`/`分割符来模拟文件夹.

![oss browser](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/2020-05-31-19-02-13_55660788.png)

- `${relativeToVsRootPath}`: 这个配置比较抽象, 假如我们上传的时候, vscode编辑器有打开一个文件, 那这个配置就指代所打开文件所在的路径
- `${activeMdFilename}`: 如果打开了一个markdown文件, 这个配置就指md文件的文件名.

举个例子, 设置 `elan.bucketFolder` 为 `blog/${relativeToVsRootPath}/`, vscode的explorer如下

```bash
.
├── FrontEnd
│   └── Engineering
│       └── webpack
│            ├── example.js
│            └── example.md
```

如果你打开了 `example.md`, 那`elan.bucketFolder` 结果为 `blog/FrontEnd/Engineering/webpack/`.

如果设置 `elan.bucketFold` 为 `blog/${relativeToVsRootPath}/${activeMdFilename}/`,`elan.bucketFolder`结果为 `blog/FrontEnd/Engineering/webpack/example/`.

如果没有打开文件, `${relativeToVsRootPath}` 会被解析成空字符 `''`, `${activeMdFilename}` 同理.

|    opened file    | `blog/${relativeToVsRootPath}/` | `blog/${relativeToVsRootPath}/${activeMdFilename}/` |
| ---------- | --- | --- |
| example.md |  blog/FrontEnd/Engineering/webpack/ | blog/FrontEnd/Engineering/webpack/example/ |
| example.js       |  blog/FrontEnd/Engineering/webpack/ | blog/FrontEnd/Engineering/webpack/ |
| no opened file       |  blog/ | blog/ |


## Create Bucket

![create-bucket](https://fangbinwei-blog-image.oss-cn-shanghai.aliyuncs.com/github/aliyun-oss-uploader/create-bucket_5f7df897.png)

## 调试项目

如果你想调试这个项目, 可以按 `F5`, 然后就可以调试webpack输出的dist目录

> 因为`@types/ali-oss` 有点过时, 你会看到一些ts的报错

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
* [x] sidebar extension (e.g. show recent uploaded image)/ (should consider icon theme)
* [x] preview image of bucket by webview (WIP)
* [ ] recently uploaded show in bucket treeView
* [ ] bucket treeView pagination/ batch operation (WIP)
* [ ] confirmation before deleting image
* [ ] inquire before upload to check folder
* [ ] decoupling logic by tapable
* [ ] upload embed svg as *.svg from clipboard
* [ ] image compress (by imagemin/ aliyun OSS can realize it by adding '?x-oss-process=' after url)
* [ ] x-oss-process & vscode.CodeActionProvider
* [ ] unit test
* [ ] editor/title button to upload image
* [ ] drag image and drop to markdown. [Limit](https://github.com/microsoft/vscode/issues/5240)
* [ ] add keyboard shortcut for explorer/context command. [Limit](https://github.com/microsoft/vscode/issues/3553)