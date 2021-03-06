# 腾讯云 PostgreSQL DB 组件

## 简介

腾讯云 PostgreSQL DB 组件通过使用 [Serverless Framework](https://github.com/serverless/components)，基于云上 Serverless 服务，实现“0”配置，便捷开发，可以快速方便的创建，部署和管理腾讯云的 PostgreSQL 产品。

特性介绍：

- [x] **按需付费** - 按照请求的使用量进行收费，没有请求时无需付费。
- [x] **"0"配置** - 默认配置将由 Serverless 完成。
- [x] **极速部署** - 仅需几秒，创建或更新您的数据库。
- [x] **便捷协作** - 通过云端数据库的状态信息和部署日志，方便的进行多人协作开发。

<br/>

## 快速开始

1. [安装](#1-安装)
2. [创建](#2-创建)
3. [配置](#3-配置)
4. [账号配置](#4-账号配置)
5. [部署](#5-部署)
6. [查看状态](#6-查看状态)
7. [移除](#7-移除)

### 1. 安装

通过 npm 全局安装 最新版本的 Serverless Framework

```shell
$ npm install -g serverless
```

### 2. 创建

创建并进入一个全新目录：

```
$ mkdir tencent-postgresql && cd tencent-postgresql
```

### 3. 配置

在新目录下创建 `serverless.yml` 文件，在其中进行如下配置

```shell
$ touch serverless.yml
```

```yml
# serverless.yml
component: postgresql #(必填) 引用 component 的名称，当前用到的是 postgresql 组件
name: serverlessDB # (必填) 该 postgresql 组件创建的实例名称
org: test # (可选) 用于记录组织信息，默认值为您的腾讯云账户 appid
app: serverlessDB # (可选) 该 sql 应用名称
stage: dev # (可选) 用于区分环境信息，默认值是 dev

inputs:
  region: ap-guangzhou # 可选 ap-guangzhou, ap-shanghai, ap-beijing
  zone: ap-guangzhou-2 # 可选 ap-guangzhou-2, ap-shanghai-2, ap-beijing-3
  dBInstanceName: serverlessDB
  vpcConfig:
    vpcId: vpc-id3zoj6r
    subnetId: subnet-kwc49rti
  extranetAccess: false
```

PostgreSQL 组件支持 0 配置部署，也就是可以直接通过配置文件中的默认值进行部署。但你依然可以修改更多可选配置来进一步开发该项目。

- [更多配置](https://github.com/serverless-tencent/tencent-postgresql/tree/master/docs/configure.md)

> 注：当前 PGSQL for Serverless 仅支持 `北京三区，广州二区，上海二区` 三个地域的创建和部署，因此在填写 yaml 中的地域可用区时需要注意填写为正确的地域和对应的 VPC 子网信息。

### 4. 账号配置

PostgreSQL 组件当前暂不支持 CLI 扫描二维码登录，因此您需要本地创建 `.env` 文件来配置持久的环境变量/秘钥信息，

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

### 5. 部署

通过 `sls` 命令进行部署，并可以添加 `--debug` 参数查看部署过程中的信息

```bash
$ sls deploy
```

> 注意: `sls` 是 `serverless` 命令的简写。
> 如您的账号未 [登录](https://cloud.tencent.com/login) 或 [注册](https://cloud.tencent.com/register) 腾讯云，您需要在本地创建.env 文件储存账户信息，详情请看[账号配置](#4-账号配置)。

### 6. 查看状态

在`serverless.yml`文件所在的目录下，通过如下命令查看部署状态：

```
$ sls info
```

### 7. 移除

通过以下命令移除部署的 DB 实例，移除后该组件会对应删除云上部署时所创建的所有相关资源。

```bash
$ sls remove
```

和部署类似，支持通过 `sls remove --debug` 命令查看移除过程中的实时日志信息，`sls`是 `serverless` 命令的缩写。

### 更多组件

可以在 [Serverless Components](https://github.com/serverless/components) repo 中查询更多组件的信息。

## License

MIT License

Copyright (c) 2020 Tencent Cloud, Inc.
