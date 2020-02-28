# Configure document

## Complete configuration

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
    dBCharset: UTF8
    vpcConfig:
      vpcId: 123
      subnetId: 123
    extranetAccess: false
```

## Configuration description

Main param description

| Param              | Required/Optional | Type    | Default | Description                                       |
| ------------------ | ----------------- | ------- | ------- | ------------------------------------------------- |
| region             | Required          | String  |         | DB Region                                         |
| zone               | Required          | String  |         | DB Zone of Region                                 |
| dBInstanceName     | Required          | String  |         | DB Instance Name, must unique for user            |
| dBVersion          | Optional          | string  | `10.4`  | PostgreSQL Version. Now support: 9.3.5,9.5.4,10.4 |
| dBCharset          | Optional          | String  | `UTF8`  | DB charset                                        |
| projectId          | Optional          | Integer | `0`     | Project ID                                        |
| vpcConfig.vpcId    | Required          | String  |         | VPC ID                                            |
| vpcConfig.subnetId | Optional          | String  |         | Subnet ID                                         |
| extranetAccess     | Optional          | Boolean | `false` | Whether open public access                        |
