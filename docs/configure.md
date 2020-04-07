# Configure document

## Complete configuration

```yml
# serverless.yml
component: postgresql # (required) name of the component. In that case, it's express.
name: serverlessDB # (required) name of your express component instance.
org: test # (optional) serverless dashboard org. default is the first org you created during signup.
app: serverlessDB # (optional) serverless dashboard app. default is the same as the name property.
stage: dev # (optional) serverless dashboard stage. default is dev.

inputs:
  region: ap-guangzhou
  zone: ap-guangzhou-2
  dBInstanceName: serverlessDB
  projectId: 0
  dBVersion: 10.4
  dBCharset: UTF8
  vpcConfig:
    vpcId: vpc-123
    subnetId: subnet-123
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
