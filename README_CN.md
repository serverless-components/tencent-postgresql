# 腾讯云 API 网关组件

## 简介

该组件是 serverless-tencent 组件库中的基础组件之一。通过 Postgres 组件，可以快速方便的创建，配置和管理腾讯云的 PostgresSQL 产品。

## 快速开始

&nbsp;

通过 Postgres 组件，对一个 PostgresSQL 实例进行完整创建，配置和删除等操作。支持命令如下：

1. [安装](#1-安装)
2. [配置](#2-配置)
3. [部署](#3-部署)
4. [移除](#4-移除)

&nbsp;

### 1. 安装

通过 npm 安装 serverless

```shell
$ npm install -g serverless
```

### 2. 配置

本地创建 `serverless.yml` 文件，在其中进行如下配置

```shell
$ touch serverless.yml
```

```yml
# serverless.yml

MyPostgres:
  component: '@serverless/tencent-postgres'
  inputs:
    region: ap-guangzhou
    zone: ap-guangzhou-3
    projectId: 0
    dBInstanceName: serverlessDb
    dBVersion: 10.4
    dBCharset: latin1
    vpcConfig:
      vpcId: 123
      subnetId: 123
    extranetAccess: false
```

- [点击此处查看配置文档](https://github.com/serverless-tencent/tencent-postgres/blob/master/docs/configure_CN.md)

### 3. 部署

如您的账号未[登陆](https://cloud.tencent.com/login)或[注册](https://cloud.tencent.com/register)腾讯云，您可以直接通过`微信`扫描命令行中的二维码进行授权登陆和注册。

通过`sls`命令进行部署，并可以添加`--debug`参数查看部署过程中的信息

```console
$ sls --debug

  DEBUG ─ Resolving the template's static variables.
  DEBUG ─ Collecting components from the template.
  DEBUG ─ Downloading any NPM components found in the template.
  DEBUG ─ Analyzing the template's components dependencies.
  DEBUG ─ Creating the template's components graph.
  DEBUG ─ Syncing template state.
  DEBUG ─ Executing the template's components graph.
  DEBUG ─ The postgres domain fullstack.yugasun.com has existed. Updating...
  DEBUG ─ Waiting for postgres deploy success...
  DEBUG ─ postgres deploy success to host: fullstack.yugasun.com
  DEBUG ─ Setup https for fullstack.yugasun.com...

  Mypostgres:
    host:   fullstack.yugasun.com
    origin: rahbqkq-a81kuv2-1251556596.cos-website.ap-guangzhou.myqcloud.com
    hostId: 1714502
    https:  true

  100s › Mypostgres › done
```

### 4. 移除

通过以下命令移除部署的 API 网关

```console
$ sls remove --debug

  DEBUG ─ Flushing template state and removing all components.
  DEBUG ─ Start removing postgres for fullstack.yugasun.com
  DEBUG ─ Waiting for offline fullstack.yugasun.com...
  DEBUG ─ Removing postgres for fullstack.yugasun.com
  DEBUG ─ Removed postgres for fullstack.yugasun.com.

  73s › Mypostgres › done
```

### 账号配置（可选）

当前默认支持 CLI 扫描二维码登录，如您希望配置持久的环境变量/秘钥信息，也可以本地创建 `.env` 文件

```shell
$ touch .env # 腾讯云的配置信息
```

在 `.env` 文件中配置腾讯云的 SecretId 和 SecretKey 信息并保存

如果没有腾讯云账号，可以在此[注册新账号](https://cloud.tencent.com/register)。

如果已有腾讯云账号，可以在[API 密钥管理](https://console.cloud.tencent.com/cam/capi)中获取 `SecretId` 和`SecretKey`.

```text
# .env
TENCENT_SECRET_ID=123
TENCENT_SECRET_KEY=123
```

### 还支持哪些组件？

可以在 [Serverless Components](https://github.com/serverless/components) repo 中查询更多组件的信息。
