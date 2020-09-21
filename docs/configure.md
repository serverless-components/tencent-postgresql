# 配置文档

## 完整配置

```yml
# serverless.yml
component: postgresql # (必填) 组件名称，此处为 postgresql
name: serverlessDB # (必填) 实例名称
org: test # (可选) 用于记录组织信息，默认值为您的腾讯云账户 appid
app: serverlessDB # (可选) 该应用名称
stage: dev # (可选) 用于区分环境信息，默认值为 dev

inputs:
  region: ap-guangzhou # 可选 ap-guangzhou, ap-shanghai, ap-beijing
  zone: ap-guangzhou-2 # 可选 ap-guangzhou-2, ap-shanghai-2, ap-beijing-3
  dBInstanceName: serverlessDB
  projectId: 0
  dBVersion: 10.4
  dBCharset: UTF8
  vpcConfig:
    vpcId: vpc-123
    subnetId: subnet-123
  extranetAccess: false
```

## 配置说明

主要参数说明

| 参数               | 必填/可选 | 类型    | 默认值  | 描述                                            |
| ------------------ | --------- | ------- | ------- | ----------------------------------------------- |
| region             | 必填      | String  |         | 数据库的所属地区                                |
| zone               | 必填      | String  |         | 数据库所在地区的区域                            |
| dBInstanceName     | 必填      | String  |         | 数据库实例名称，对一用户必须唯一                |
| dBVersion          | 可选      | string  | `10.4`  | PostgreSQL 版本号，目前支持: 9.3.5, 9.5.4, 10.4 |
| dBCharset          | 可选      | String  | `UTF8`  | 数据库的字符集编码                              |
| projectId          | 可选      | Integer | `0`     | 项目的 ID                                       |
| vpcConfig.vpcId    | 必填      | String  |         | VPC 的 ID                                       |
| vpcConfig.subnetId | 可选      | String  |         | Subnet 的 ID                                    |
| extranetAccess     | 可选      | Boolean | `false` | 是否开启 serverlessDB 实例外网访问              |
