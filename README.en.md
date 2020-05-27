# Tencent Cloud PostgreSQL Component

[简体中文](https://github.com/serverless-components/tencent-postgresql/blob/v2/README.md) | English

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
    vpcId: vpc-123
    subnetId: subnet-123
  extranetAccess: false
```

- [More Options](https://github.com/serverless-components/tencent-postgresql/blob/v2/docs/configure.md)

### 4. Deploy

```bash
$ sls deploy
```

> Notice: `sls` is short for `serverless` command.

&nbsp;

### 5. Remove

```bash
$ sls remove
```

### More Components

Checkout the [Serverless Components](https://github.com/serverless/components) repo for more information.

## License

MIT License

Copyright (c) 2020 Tencent Cloud, Inc.
