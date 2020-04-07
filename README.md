# 腾讯云 PostgreSQL DB 组件

简体中文 | [English](https://github.com/serverless-components/tencent-postgresql/blob/v2/README.en.md)

## 简介

通过 PostgreSQL DB 组件，可以快速方便的创建，配置和管理腾讯云的 PostgreSQL 产品。

## 快速开始

1. [安装](#1-安装)
2. [配置](#2-配置)
3. [部署](#3-部署)
4. [移除](#4-移除)
5. [账号配置（可选）](#5-账号配置（可选）)

### 1. 安装

通过 npm 全局安装 [serverless cli](https://github.com/serverless/serverless)

```shell
$ npm install -g serverless
```

### 2. 配置

在项目根目录创建 `serverless.yml` 文件，在其中进行如下配置

```shell
$ touch serverless.yml
```

```yml
# serverless.yml
component: postgresql
name: serverlessDB
org: test
app: serverlessDB
stage: dev

inputs:
  region: ap-guangzhou
  zone: ap-guangzhou-2
  dBInstanceName: serverlessDB
  vpcConfig:
    vpcId: vpc-id3zoj6r
    subnetId: subnet-kwc49rti
  extranetAccess: false
```

- [更多配置](https://github.com/serverless-components/tencent-postgresql/tree/v2/docs/configure.md)

### 3. 部署

如您的账号未 [登录](https://cloud.tencent.com/login) 或 [注册](https://cloud.tencent.com/register) 腾讯云，您可以直接通过 `微信` 扫描命令行中的二维码进行授权登陆和注册。

通过 `sls` 命令进行部署，并可以添加 `--debug` 参数查看部署过程中的信息

```bash
$ sls deploy
```

> 注意: `sls` 是 `serverless` 命令的简写。

### 4. 移除

通过以下命令移除部署的 DB 实例

```bash
$ sls remove
```

### 5. 账号配置（可选）

当前默认支持 CLI 扫描二维码登录，如您希望配置持久的环境变量/秘钥信息，也可以本地创建 `.env` 文件

```bash
$ touch .env # 腾讯云的配置信息
```

在 `.env` 文件中配置腾讯云的 SecretId 和 SecretKey 信息并保存

如果没有腾讯云账号，可以在此 [注册新账号](https://cloud.tencent.com/register)。

如果已有腾讯云账号，可以在 [API 密钥管理](https://console.cloud.tencent.com/cam/capi) 中获取 `SecretId` 和`SecretKey`.

```text
# .env
TENCENT_SECRET_ID=123
TENCENT_SECRET_KEY=123
```

### 更多组件

可以在 [Serverless Components](https://github.com/serverless/components) repo 中查询更多组件的信息。
