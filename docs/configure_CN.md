## 配置文档

### 完整配置

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

### 配置说明

主要参数说明

| 参数名             | 必选 | 类型    | 默认值   | 描述                                                         |
| ------------------ | ---- | ------- | -------- | ------------------------------------------------------------ |
| region             | 是   | String  |          | 来自公共参数                                                 |
| zone               | 是   | String  |          | 来自公共参数                                                 |
| dBInstanceName     | 是   | String  |          | db 资源名称，同一个账号下该值必须唯一                        |
| dBVersion          | 是   | string  | `10.4`   | PostgreSQL 内核版本，目前只支持：9.3.5、9.5.4、10.4 三种版本 |
| dBCharset          | 否   | String  | `latin1` | 数据库字符集                                                 |
| projectId          | 否   | Integer | `0`      | 项目 ID                                                      |
| vpcConfig.vpcId    | 是   | String  |          | 私有网络 ID                                                  |
| vpcConfig.subnetId | 否   | String  |          | 私有网络 ID                                                  |
| extranetAccess     | 否   | Boolean | `false`  | 是否开启外网访问，true - 是，false - 否                      |
