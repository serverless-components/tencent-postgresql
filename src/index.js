const { Component } = require('@serverless/core')
const { Capi } = require('@tencent-sdk/capi')
const tencentAuth = require('serverless-tencent-auth-tool')
const ensureNumber = require('type/number/ensure')
const ensureObject = require('type/object/ensure')
const ensureString = require('type/string/ensure')

const {
  createDbInstance,
  getDbInstanceDetail,
  getDbExtranetAccess,
  toggleDbInstanceAccess,
  deleteDbInstance,
  formatPgUrl
} = require('./utils')

const defaults = {
  region: 'ap-guangzhou',
  zone: 'ap-guangzhou-2',
  projectId: 0,
  dBVersion: '10.4',
  dBCharset: 'UTF8',
  extranetAccess: false
}

class TencentDB extends Component {
  async initCredential(inputs, action) {
    // login
    const auth = new tencentAuth()
    this.context.credentials.tencent = await auth.doAuth(this.context.credentials.tencent, {
      client: 'tencent-postgresql',
      remark: inputs.fromClientRemark,
      project: this.context.instance ? this.context.instance.id : undefined,
      action: action
    })
    if (this.context.credentials.tencent && this.context.credentials.tencent.token) {
      this.context.credentials.tencent.Token = this.context.credentials.tencent.token
    }
  }

  prepareInputs(inputs) {
    inputs.region = ensureString(inputs.region, { default: defaults.region })
    inputs.zone = ensureString(inputs.zone, { default: defaults.zone })
    inputs.projectId = ensureNumber(inputs.projectId, { default: defaults.projectId })
    inputs.dBInstanceName = ensureString(inputs.dBInstanceName, {
      default: defaults.dBInstanceName
    })
    inputs.dBVersion = ensureString(inputs.dBVersion, { default: defaults.dBVersion })
    inputs.dBCharset = ensureString(inputs.dBCharset, { default: defaults.dBCharset })
    inputs.extranetAccess = inputs.extranetAccess === true ? true : defaults.extranetAccess

    inputs.vpcConfig = ensureObject(inputs.vpcConfig, {
      isOptional: false,
      errorMessage: 'vpcConfig is required'
    })
    inputs.vpcConfig.vpcId = ensureString(inputs.vpcConfig.vpcId, {
      isOptional: false,
      errorMessage: 'vpcId is required'
    })
    inputs.vpcConfig.subnetId = ensureString(inputs.vpcConfig.subnetId, {
      isOptional: false,
      errorMessage: 'subnetId is required'
    })

    return inputs
  }

  async default(inputs = {}) {
    const { context } = this
    await this.initCredential(inputs, 'default')
    context.status('Deploying')

    inputs = this.prepareInputs(inputs)

    const {
      region,
      zone,
      projectId,
      dBInstanceName,
      dBVersion,
      dBCharset,
      extranetAccess,
      vpcConfig
    } = {
      ...defaults,
      ...inputs
    }

    const apig = new Capi({
      Region: region,
      AppId: context.credentials.tencent.AppId,
      SecretId: context.credentials.tencent.SecretId,
      SecretKey: context.credentials.tencent.SecretKey
    })

    const state = {
      region: region,
      zone: zone,
      vpcConfig: vpcConfig,
      dBInstanceName: dBInstanceName
    }

    const outputs = {
      region: region,
      zone: zone,
      dBInstanceName: dBInstanceName
    }

    let dbDetail = await getDbInstanceDetail(context, apig, dBInstanceName)

    if (dbDetail && dbDetail.DBInstanceName) {
      const publicAccess = getDbExtranetAccess(dbDetail.DBInstanceNetInfo)
      // exist and public access config different, update db instance
      if (publicAccess !== extranetAccess) {
        context.debug(`DB instance ${dBInstanceName} existed, updating...`)
        dbDetail = await toggleDbInstanceAccess(context, apig, dBInstanceName, extranetAccess)
      } else {
        context.debug(`DB instance ${dBInstanceName} existed.`)
      }
    } else {
      // not exist, create
      const postgresInputs = {
        Zone: zone,
        ProjectId: projectId,
        DBInstanceName: dBInstanceName,
        DBVersion: dBVersion,
        DBCharset: dBCharset
      }

      if (vpcConfig.vpcId) {
        postgresInputs.VpcId = vpcConfig.vpcId
      }

      if (vpcConfig.subnetId) {
        postgresInputs.SubnetId = vpcConfig.subnetId
      }
      dbDetail = await createDbInstance(this.context, apig, postgresInputs)
      state.dBInstanceId = dbDetail.DBInstanceId
      if (extranetAccess) {
        dbDetail = await toggleDbInstanceAccess(context, apig, dBInstanceName, extranetAccess)
      }
    }

    const {
      DBInstanceNetInfo,
      DBAccountSet: [accountInfo],
      DBDatabaseList: [dbName]
    } = dbDetail
    let internetInfo = null
    let extranetInfo = null
    DBInstanceNetInfo.forEach((item) => {
      if (item.NetType === 'private') {
        internetInfo = item
      }
      if (item.NetType === 'public') {
        extranetInfo = item
      }
    })
    if (vpcConfig.vpcId) {
      outputs.private = formatPgUrl(internetInfo, accountInfo, dbName)
    }
    if (extranetAccess && extranetInfo) {
      outputs.public = formatPgUrl(extranetInfo, accountInfo, dbName)
    }

    this.state = state
    await this.save()

    return outputs
  }

  async remove(inputs = {}) {
    const { context } = this
    await this.initCredential(inputs, 'remove')

    const { state } = this
    const { region } = state
    const dBInstanceName = inputs.dBInstanceName || state.dBInstanceName
    context.status('Removing')

    const apig = new Capi({
      Region: region,
      AppId: context.credentials.tencent.AppId,
      SecretId: context.credentials.tencent.SecretId,
      SecretKey: context.credentials.tencent.SecretKey
    })

    // need circle for deleting, after host status is 6, then we can delete it
    await deleteDbInstance(this.context, apig, dBInstanceName)

    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = TencentDB
