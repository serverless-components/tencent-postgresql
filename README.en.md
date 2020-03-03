# Tencent Cloud PostgreSQL Component

[简体中文](https://github.com/serverless-components/tencent-postgresql/blob/master/README.md) | English

## Introduction

Using PostgreSQL Component, you can create/update/delete PostgreSQL Instance for Serverless Application conveniently.

## Content

1. [Install](#1-install)
2. [Create](#2-create)
3. [Configure](#3-configure)
4. [Deploy](#4-deploy)
5. [Remove](#5-Remove)

### 1. Install

Install the Serverless Framework globally:

```bash
$ npm install -g serverless
```

### 2. Create

In project root, create the following simple boilerplate:

```bash
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
MyPostgreSQL:
  component: '@serverless/tencent-postgresql'
  inputs:
    region: ap-guangzhou
    zone: ap-guangzhou-3
    dBInstanceName: serverlessDb
    dBVersion: 10.4
    dBCharset: UTF8
    vpcConfig:
      vpcId: 123
      subnetId: 123
    extranetAccess: false
```

- [More Options](https://github.com/serverless-components/tencent-postgresql/blob/master/docs/configure.md)

### 4. Deploy

```bash
$ sls --debug
```

> Notice: `sls` is short for `serverless` command.

&nbsp;

### 5. Remove

```bash
$ sls remove --debug
```

### More Components

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.
