const { Component } = require('@serverless/core')
const { Capi } = require('@tencent-sdk/capi')
const { getTempKey } = require('./login')
const { CreateServerlessDBInstance, DeleteServerlessDBInstance } = require('./apis')
const {
  TIMEOUT,
  getDbInstanceDetail,
  formatPgUrl,
  toggleDbInstanceAccess,
  waitForStatus
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
  async initCredential() {
    const { context } = this
    const temp = context.instance.state.status
    context.instance.state.status = true
    let { tencent } = context.credentials
    if (!tencent) {
      tencent = await getTempKey(temp)
      context.credentials.tencent = tencent
    }
  }

  async default(inputs = {}) {
    const { context } = this
    await this.initCredential()
    context.status('Deploying')

    const {
      region,
      zone,
      projectId,
      dBInstanceName,
      dBVersion,
      dBCharset,
      vpcConfig,
      extranetAccess
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

    if (dbDetail && dbDetail.dBInstanceName) {
      // exist, update
      context.debug(`DB instance ${dBInstanceName} existed, updating...`)
      await toggleDbInstanceAccess(context, apig, dBInstanceName, extranetAccess)
    } else {
      // not exist, create
      const postgresInputs = {
        Zone: zone,
        ProjectId: projectId,
        DBInstanceName: dBInstanceName,
        DBVersion: dBVersion,
        DBCharset: dBCharset,
        VpcId: vpcConfig.vpcId
      }

      if (vpcConfig.subnetId) {
        postgresInputs.SubnetId = vpcConfig.subnetId
      }
      context.debug(`Start create DB instance ${dBInstanceName}...`)
      const { DBInstanceId } = await CreateServerlessDBInstance(apig, postgresInputs)
      this.context.debug(`Creating DB instance ID: ${DBInstanceId}`)
      state.dBInstanceId = DBInstanceId

      dbDetail = await waitForStatus({
        callback: async () => getDbInstanceDetail(context, apig, dBInstanceName),
        targetStatus: 'running',
        statusProp: 'DBInstanceStatus',
        timeout: TIMEOUT
      })

      if (extranetAccess) {
        await toggleDbInstanceAccess(context, apig, dBInstanceName, extranetAccess)
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
    outputs.connects = {
      private: formatPgUrl(internetInfo, accountInfo, dbName)
    }
    if (extranetAccess && extranetInfo) {
      outputs.connects.public = formatPgUrl(extranetInfo, accountInfo, dbName)
    }

    this.state = state
    await this.save()

    return outputs
  }

  async remove(inputs = {}) {
    const { context } = this
    await this.initCredential()

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
    context.debug(`Start removing postgres instance ${dBInstanceName}`)
    await DeleteServerlessDBInstance(apig, {
      DBInstanceName: dBInstanceName
    })
    context.debug(`Removed postgres instance ${dBInstanceName}.`)
    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = TencentDB
