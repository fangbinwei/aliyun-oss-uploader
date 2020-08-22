# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [1.6.0](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.5.1...v1.6.0) (2020-08-22)


### Features

* **bucketExplorer:** support pagination ([134da5e](https://github.com/fangbinwei/aliyun-oss-uploader/commit/134da5e2cae74bf0462d98272e6e4f53a506658f))
* **templateSubstitute:** support 'year','month','date', 'pathname' ([f2bb312](https://github.com/fangbinwei/aliyun-oss-uploader/commit/f2bb3121728db1765687f5e8efc529cbc14012b7)), closes [#4](https://github.com/fangbinwei/aliyun-oss-uploader/issues/4)


### Bug Fixes

* **templateSubstitute:** fix `relativeToVsRootPath` bug ([28a8504](https://github.com/fangbinwei/aliyun-oss-uploader/commit/28a850435eb01fed0a83f097fea6766378958e94))

### [1.5.1](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.5.0...v1.5.1) (2020-07-26)


### Bug Fixes

* **hover:** fix hoverDelete when customDomain has been set ([77241df](https://github.com/fangbinwei/aliyun-oss-uploader/commit/77241df245d8af659ce6a330b07cdb0a893c63f6))

## [1.5.0](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.4.1...v1.5.0) (2020-07-26)


### Features

* can upload files other than pic ([03a1d47](https://github.com/fangbinwei/aliyun-oss-uploader/commit/03a1d472c6f5f65b01ed66effe59be5a28051565))
* **uploader:** support custom domain ([e367373](https://github.com/fangbinwei/aliyun-oss-uploader/commit/e36737381b02f64ec0d868fc8a2180e0665268f9)), closes [#2](https://github.com/fangbinwei/aliyun-oss-uploader/issues/2)


### Bug Fixes

* **configuration:** ignore focus out ([34ea93e](https://github.com/fangbinwei/aliyun-oss-uploader/commit/34ea93e97a584fd60c6fe1da4c57691821155a5f))

### [1.4.1](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.4.0...v1.4.1) (2020-06-27)


### Bug Fixes

* **bucketExplorer:** fix bucket list bug ([44bebbd](https://github.com/fangbinwei/aliyun-oss-uploader/commit/44bebbd23092afe5cf73c76348ead2c6f84f160c))

## [1.4.0](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.2.0...v1.4.0) (2020-06-27)


### Features

* **bucketExplorer:** add config 'elan.bucketView.onlyShowImages' ([a618ab9](https://github.com/fangbinwei/aliyun-oss-uploader/commit/a618ab9b076ebeb67929993c35deeb15384a1da4))
* **bucketExplorer:** add treeView of bucket ([b5021e4](https://github.com/fangbinwei/aliyun-oss-uploader/commit/b5021e4fad7dc9d409f3754af7b54ab9ff30ad16))
* **bucketExplorer:** can delete single from bucketExplorer ([bbea6d5](https://github.com/fangbinwei/aliyun-oss-uploader/commit/bbea6d510701a8334d7b7c0a21f3bfc1edc424d6))
* **bucketExplorer:** can upload from bucket explorer ([9c033f8](https://github.com/fangbinwei/aliyun-oss-uploader/commit/9c033f81025175fce097fcf3fec840d8329af868))
* **bucketExplorer:** copy link ([8a0bf04](https://github.com/fangbinwei/aliyun-oss-uploader/commit/8a0bf044346fcc721a95a4756444d5c8f6dec6fe))
* **bucketExplorer:** copy object ([acea402](https://github.com/fangbinwei/aliyun-oss-uploader/commit/acea40242a7571584981b1155e794a9ab69bdeef))
* **bucketExplorer:** move/rename object ([e30d95b](https://github.com/fangbinwei/aliyun-oss-uploader/commit/e30d95bf4456e4ec2ca06cd4c1bf78e8547d7884))
* **bucketExplorer:** support uploading from clipboard ([8edae28](https://github.com/fangbinwei/aliyun-oss-uploader/commit/8edae282c7cd72822bb88ebe7323406957007a58))
* **uploader:** add config 'elan.aliyun.maxKeys' ([3a0aac9](https://github.com/fangbinwei/aliyun-oss-uploader/commit/3a0aac9788f9afa557866819c94cc64e7b6d5cfa))
* **webview:** preview the image of bucket explorer ([81c0606](https://github.com/fangbinwei/aliyun-oss-uploader/commit/81c060669f9422c7f94bac576c3b68305df81628))
* help user to set configuration ([3451fbe](https://github.com/fangbinwei/aliyun-oss-uploader/commit/3451fbe155aaa3a0a93e9c2ef3f7944a735bff05))


### Bug Fixes

* **bucketExplorer:** add resourceUri for 'File' ([5411d54](https://github.com/fangbinwei/aliyun-oss-uploader/commit/5411d5432b1546e00433e561af4b575f2f561abf))
* **bucketExplorer:** copyFromContext selection ([319c620](https://github.com/fangbinwei/aliyun-oss-uploader/commit/319c620a4089503d1742feceeebd7b57791010f7))
* **bucketExplorer:** ext case-insensitive ([5f6916b](https://github.com/fangbinwei/aliyun-oss-uploader/commit/5f6916bb964fafba73f5b56d15ad008ae72d08aa))
* **hover:** fix hover delete can't get correct uri ([b2f2d65](https://github.com/fangbinwei/aliyun-oss-uploader/commit/b2f2d65d01108dddb24b022e48801e730da28030))
* fix disposable ([76d67e9](https://github.com/fangbinwei/aliyun-oss-uploader/commit/76d67e93a0b023963ecc446935c08abc7ad70295))

## [1.3.0](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.2.0...v1.3.0) (2020-06-21)


### Features

* **bucketExplorer:** add config 'elan.bucketView.onlyShowImages' ([a618ab9](https://github.com/fangbinwei/aliyun-oss-uploader/commit/a618ab9b076ebeb67929993c35deeb15384a1da4))
* **bucketExplorer:** can delete single from bucketExplorer ([bbea6d5](https://github.com/fangbinwei/aliyun-oss-uploader/commit/bbea6d510701a8334d7b7c0a21f3bfc1edc424d6))
* **bucketExplorer:** can upload from bucket explorer ([9c033f8](https://github.com/fangbinwei/aliyun-oss-uploader/commit/9c033f81025175fce097fcf3fec840d8329af868))
* **uploader:** add config 'elan.aliyun.maxKeys' ([3a0aac9](https://github.com/fangbinwei/aliyun-oss-uploader/commit/3a0aac9788f9afa557866819c94cc64e7b6d5cfa))
* help user to set configuration ([3451fbe](https://github.com/fangbinwei/aliyun-oss-uploader/commit/3451fbe155aaa3a0a93e9c2ef3f7944a735bff05))
* **bucketExplorer:** add treeView of bucket ([b5021e4](https://github.com/fangbinwei/aliyun-oss-uploader/commit/b5021e4fad7dc9d409f3754af7b54ab9ff30ad16))
* **bucketExplorer:** copy link ([8a0bf04](https://github.com/fangbinwei/aliyun-oss-uploader/commit/8a0bf044346fcc721a95a4756444d5c8f6dec6fe))
* **bucketExplorer:** copy object ([acea402](https://github.com/fangbinwei/aliyun-oss-uploader/commit/acea40242a7571584981b1155e794a9ab69bdeef))
* **bucketExplorer:** move/rename object ([e30d95b](https://github.com/fangbinwei/aliyun-oss-uploader/commit/e30d95bf4456e4ec2ca06cd4c1bf78e8547d7884))
* **bucketExplorer:** support uploading from clipboard ([8edae28](https://github.com/fangbinwei/aliyun-oss-uploader/commit/8edae282c7cd72822bb88ebe7323406957007a58))


### Bug Fixes

* **bucketExplorer:** copyFromContext selection ([319c620](https://github.com/fangbinwei/aliyun-oss-uploader/commit/319c620a4089503d1742feceeebd7b57791010f7))
* **hover:** fix hover delete can't get correct uri ([b2f2d65](https://github.com/fangbinwei/aliyun-oss-uploader/commit/b2f2d65d01108dddb24b022e48801e730da28030))
* fix disposable ([76d67e9](https://github.com/fangbinwei/aliyun-oss-uploader/commit/76d67e93a0b023963ecc446935c08abc7ad70295))

## [1.2.0](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.1.0...v1.2.0) (2020-06-11)


### Features

* **uploader:** delete image when hovering link in markdown ([27e3022](https://github.com/fangbinwei/aliyun-oss-uploader/commit/27e302217d99fbdf8bdf0427d83cd174d0ab0370))

## [1.1.0](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.0.2...v1.1.0) (2020-06-08)


### Features

* **templateSubstitute:** add '${activeMdFilename}' ([6aecef5](https://github.com/fangbinwei/aliyun-oss-uploader/commit/6aecef57e647c336bff914b86fb388d4ebc32b36))

### [1.0.2](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.0.1...v1.0.2) (2020-06-01)


### Bug Fixes

* **templateSubstitute:** fix 'bucketFolder' replace error ([89cdddb](https://github.com/fangbinwei/aliyun-oss-uploader/commit/89cdddb7c6c411f5a7bf3175266978299d6ba0a6))

### [1.0.1](https://github.com/fangbinwei/aliyun-oss-uploader/compare/v1.0.0...v1.0.1) (2020-05-31)


### Bug Fixes

* delete defalut value explanation ([b410aa6](https://github.com/fangbinwei/aliyun-oss-uploader/commit/b410aa672e0beaa6c275bc2bc0b904fd1240803d))

## 1.0.0 (2020-05-31)


### Features

* **templateSubstitute:** support contentHash ([1bb0c46](https://github.com/fangbinwei/aliyun-oss-uploader/commit/1bb0c46174954f9c5cf52b8eafd238a34b6e549a))
* github flavor markdown ([f7b95ec](https://github.com/fangbinwei/aliyun-oss-uploader/commit/f7b95ecf487965d6bfade2d677e6abd402a6e649))
* init ([25d7ef0](https://github.com/fangbinwei/aliyun-oss-uploader/commit/25d7ef0a312406bfeabad255d398e0992dc725e0))
* specify 'folder' of bucket ([f0bcb16](https://github.com/fangbinwei/aliyun-oss-uploader/commit/f0bcb164d2c0e16ae74483718edfc513268bec84))
* upload from clipboard ([963706d](https://github.com/fangbinwei/aliyun-oss-uploader/commit/963706d53db9dc6374f1948dc9cb6704dc35da0c))
* upload image from explorer context ([0cd8e4d](https://github.com/fangbinwei/aliyun-oss-uploader/commit/0cd8e4d98e5b887447906970f2c9443c11819b7f))


### Bug Fixes

* **explorer/context:** ext case-insensitive ([560c4fd](https://github.com/fangbinwei/aliyun-oss-uploader/commit/560c4fd683308ec59a9bb003b172b29054b716ed))
* **templateSubstitute:** handle boundary conditions of `bucketFolder` slash ([747c905](https://github.com/fangbinwei/aliyun-oss-uploader/commit/747c905bc48da160376278434f867b8bfd8fc332))
* **uploader:** fix error handler ([74c08ff](https://github.com/fangbinwei/aliyun-oss-uploader/commit/74c08ff7c23c6e14ac08cb95142b6035bd0ba013))
