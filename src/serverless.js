const { Component } = require('@serverless/core')
const { Postgresql } = require('tencent-component-toolkit')
const { prepareInputs } = require('./utils')

class PgComponent extends Component {
  async deploy(inputs) {
    console.log(`Deploying PostgreSQL Database...`)

    // 获取腾讯云密钥信息
    const { tmpSecrets } = this.credentials.tencent
    const credentials = {
      SecretId: tmpSecrets.TmpSecretId,
      SecretKey: tmpSecrets.TmpSecretKey,
      Token: tmpSecrets.Token
    }

    // 对Inputs内容进行标准化
    const pgInputs = await prepareInputs(inputs)
    const pgBaas = new Postgresql(credentials, pgInputs.region)
    // 部署函数 + API网关
    const outputs = await pgBaas.deploy(pgInputs)

    // optimize outputs for one region
    this.state.region = pgInputs.region
    this.state.zone = pgInputs.zone
    this.state.dBInstanceId = outputs.dBInstanceId
    this.state.dBInstanceName = outputs.dBInstanceName

    return outputs
  }

  async remove() {
    console.log(`Removing PostgreSQL Database...`)

    const { state } = this
    const { tmpSecrets } = this.credentials.tencent
    const credentials = {
      SecretId: tmpSecrets.TmpSecretId,
      SecretKey: tmpSecrets.TmpSecretKey,
      Token: tmpSecrets.Token
    }
    const pgBaas = new Postgresql(credentials, state.region)

    await pgBaas.remove({
      dBInstanceId: state.dBInstanceId,
      dBInstanceName: state.dBInstanceName
    })

    this.state = {}
  }
}

module.exports = PgComponent
