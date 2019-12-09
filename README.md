# tencent-cdn

Easily provision Tencent CDN using [Serverless Components](https://github.com/serverless/components).

&nbsp;

- [请点击这里查看中文版部署文档](./README_CN.md)

&nbsp;

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)
5. [Remove](#5-Remove)

### 1. Install

Install the Serverless Framework:

```shell
$ npm install -g serverless
```

### 2. Create

Just create the following simple boilerplate:

```shell
$ touch serverless.yml
$ touch .env           # your Tencent api keys
```

Add the access keys of a [Tencent CAM Role](https://console.cloud.tencent.com/cam/capi) with `AdministratorAccess` in the `.env` file, using this format:

```
# .env
TENCENT_SECRET_ID=XXX
TENCENT_SECRET_KEY=XXX
```

- If you don't have a Tencent Cloud account, you could [sign up](https://intl.cloud.tencent.com/register) first.

### 3. Configure

```yml
# serverless.yml

MyCDN:
  component: '@serverless/tencent-cdn'
  inputs:
    host: abc.com
    hostType: cos
    origin: ww.test.com:8080
    backupOrigin: ww.test.com:8080
    serviceType: web
    fullUrl: on
    fwdHost: ww.test.com:8080
    https:
      cert: 123
      privateKey: 123
      http2: off
      httpsType: 2
      forceSwitch: -2
```

- [Click here to view the configuration document](https://github.com/serverless-tencent/tencent-cdn/blob/master/docs/configure.md)

### 4. Deploy

```console
$ sls --debug

  DEBUG ─ Resolving the template's static variables.
  DEBUG ─ Collecting components from the template.
  DEBUG ─ Downloading any NPM components found in the template.
  DEBUG ─ Analyzing the template's components dependencies.
  DEBUG ─ Creating the template's components graph.
  DEBUG ─ Syncing template state.
  DEBUG ─ Executing the template's components graph.
  DEBUG ─ The CDN domain fullstack.yugasun.com has existed. Updating...
  DEBUG ─ Waiting for CDN deploy success...
  DEBUG ─ CDN deploy success to host: fullstack.yugasun.com
  DEBUG ─ Setup https for fullstack.yugasun.com...

  MyCDN:
    host:   fullstack.yugasun.com
    origin: rahbqkq-a81kuv2-1251556596.cos-website.ap-guangzhou.myqcloud.com
    hostId: 1714502
    https:  true

  100s › MyCDN › done
```

&nbsp;

### 5. Remove

```console
$ sls remove --debug

  DEBUG ─ Flushing template state and removing all components.
  DEBUG ─ Start removing CDN for fullstack.yugasun.com
  DEBUG ─ Waiting for offline fullstack.yugasun.com...
  DEBUG ─ Removing CDN for fullstack.yugasun.com
  DEBUG ─ Removed CDN for fullstack.yugasun.com.

  73s › MyCDN › done
```

### New to Components?

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
