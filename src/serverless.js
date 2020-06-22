const { Component } = require('@serverless/core')
const { Postgresql } = require('tencent-component-toolkit')
const { TypeError } = require('tencent-component-toolkit/src/utils/error')
const { prepareInputs } = require('./utils')

class PgComponent extends Component {
  getCredentials() {
    const { tmpSecrets } = this.credentials.tencent

    if (!tmpSecrets || !tmpSecrets.TmpSecretId) {
      throw new TypeError(
        'CREDENTIAL',
        'Cannot get secretId/Key, your account could be sub-account and does not have the access to use SLS_QcsRole, please make sure the role exists first, then visit https://cloud.tencent.com/document/product/1154/43006, follow the instructions to bind the role to your account.'
      )
    }

    return {
      SecretId: tmpSecrets.TmpSecretId,
      SecretKey: tmpSecrets.TmpSecretKey,
      Token: tmpSecrets.Token
    }
  }

  async deploy(inputs) {
    console.log(`Deploying PostgreSQL Database...`)

    const credentials = this.getCredentials()

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

    const credentials = this.getCredentials()

    const pgBaas = new Postgresql(credentials, state.region)

    await pgBaas.remove({
      dBInstanceId: state.dBInstanceId,
      dBInstanceName: state.dBInstanceName
    })

    this.state = {}
  }
}

module.exports = PgComponent
