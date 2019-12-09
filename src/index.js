const { Component } = require('@serverless/core')
const Capi = require('qcloudapi-sdk')
const TencentLogin = require('tencent-login')
const _ = require('lodash')
const fs = require('fs')
const { CreateServerlessDBInstance, DeleteServerlessDBInstance } = require('./apis')
const {
  TIMEOUT,
  getDbInstanceDetail,
  formatPgUrl,
  toggleDbInstanceAccess,
  waitForStatus,
  sleep
} = require('./utils')

const defaults = {
  region: 'ap-guangzhou',
  zone: 'ap-guangzhou-2',
  projectId: 0,
  dBVersion: '10.4',
  dBCharset: 'latin1',
  extranetAccess: false
}

class TencentDB extends Component {
  async doLogin() {
    const login = new TencentLogin()
    const tencent_credentials = await login.login()
    if (tencent_credentials) {
      tencent_credentials.timestamp = Date.now() / 1000
      try {
        const tencent = {
          SecretId: tencent_credentials.secret_id,
          SecretKey: tencent_credentials.secret_key,
          AppId: tencent_credentials.appid,
          token: tencent_credentials.token,
          expired: tencent_credentials.expired,
          signature: tencent_credentials.signature,
          uuid: tencent_credentials.uuid,
          timestamp: tencent_credentials.timestamp
        }
        await fs.writeFileSync('./.env_temp', JSON.stringify(tencent))
        return tencent
      } catch (e) {
        throw 'Error getting temporary key: ' + e
      }
    }
  }

  async getTempKey(temp) {
    const that = this

    if (temp) {
      while (true) {
        try {
          const tencent_credentials_read = JSON.parse(await fs.readFileSync('./.env_temp', 'utf8'))
          if (
            Date.now() / 1000 - tencent_credentials_read.timestamp <= 6000 &&
            tencent_credentials_read.AppId
          ) {
            return tencent_credentials_read
          }
          await sleep(1000)
        } catch (e) {
          await sleep(1000)
        }
      }
    }

    try {
      const data = await fs.readFileSync('./.env_temp', 'utf8')
      try {
        const tencent = {}
        const tencent_credentials_read = JSON.parse(data)
        if (
          Date.now() / 1000 - tencent_credentials_read.timestamp <= 6000 &&
          tencent_credentials_read.AppId
        ) {
          return tencent_credentials_read
        }
        const login = new TencentLogin()
        const tencent_credentials_flush = await login.flush(
          tencent_credentials_read.uuid,
          tencent_credentials_read.expired,
          tencent_credentials_read.signature,
          tencent_credentials_read.AppId
        )
        if (tencent_credentials_flush) {
          tencent.SecretId = tencent_credentials_flush.secret_id
          tencent.SecretKey = tencent_credentials_flush.secret_key
          tencent.AppId = tencent_credentials_flush.appid
          tencent.token = tencent_credentials_flush.token
          tencent.expired = tencent_credentials_flush.expired
          tencent.signature = tencent_credentials_flush.signature
          tencent.uuid = tencent_credentials_read.uuid
          tencent.timestamp = Date.now() / 1000
          await fs.writeFileSync('./.env_temp', JSON.stringify(tencent))
          return tencent
        }
        return await that.doLogin()
      } catch (e) {
        return await that.doLogin()
      }
    } catch (e) {
      return await that.doLogin()
    }
  }

  async initCredential() {
    // login
    const temp = this.context.instance.state.status
    this.context.instance.state.status = true
    let { tencent } = this.context.credentials
    if (!tencent) {
      tencent = await this.getTempKey(temp)
      this.context.credentials.tencent = tencent
    }
  }

  async default(inputs = {}) {
    await this.initCredential()
    this.context.status('Deploying')

    const {
      region,
      zone,
      projectId,
      dBInstanceName,
      dBVersion,
      dBCharset,
      vpcConfig,
      extranetAccess
    } = _.merge(defaults, inputs)

    const apig = new Capi({
      Region: region,
      AppId: this.context.credentials.tencent.AppId,
      SecretId: this.context.credentials.tencent.SecretId,
      SecretKey: this.context.credentials.tencent.SecretKey,
      Token: this.context.credentials.tencent.token,
      Version: '2017-03-12',
      serviceType: 'postgres',
      baseHost: 'api.qcloud.com'
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

    const dbDetail = await getDbInstanceDetail(apig, dBInstanceName)
    if (dbDetail && dbDetail.DBInstanceName) {
      // exist, update
      this.context.debug(`DB instance ${dBInstanceName} existed, updating...`)
      await toggleDbInstanceAccess.call(this, apig, dBInstanceName, extranetAccess)
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
      this.context.debug(`Start create DB instance ${dBInstanceName}...`)
      const { DBInstanceId } = await CreateServerlessDBInstance({
        ...apig,
        ...postgresInputs
      })
      state.dBInstanceId = DBInstanceId

      await waitForStatus({
        callback: async () => getDbInstanceDetail(apig, dBInstanceName),
        targetStatus: 'running',
        statusProp: 'DBInstanceStatus',
        timeout: TIMEOUT
      })

      if (extranetAccess) {
        await toggleDbInstanceAccess.call(this, apig, dBInstanceName, extranetAccess)
      }
    }

    const {
      DBInstanceNetInfo,
      DBAccountSet: [accountInfo]
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
      private: formatPgUrl(internetInfo, accountInfo)
    }
    if (extranetAccess && extranetInfo) {
      outputs.connects.public = formatPgUrl(extranetInfo, accountInfo)
    }

    this.state = state
    await this.save()

    return outputs
  }

  async remove(inputs = {}) {
    await this.initCredential()

    const { state } = this
    const { region } = state
    const dbInstanceName = inputs.dbInstanceName || state.dbInstanceName
    this.context.status('Removing')

    const apig = new Capi({
      Region: region,
      AppId: this.context.credentials.tencent.AppId,
      SecretId: this.context.credentials.tencent.SecretId,
      SecretKey: this.context.credentials.tencent.SecretKey,
      Token: this.context.credentials.tencent.token,
      Version: '2017-03-12',
      serviceType: 'postgres',
      baseHost: 'api.qcloud.com'
    })

    // need circle for deleting, after host status is 6, then we can delete it
    this.context.debug(`Start removing postgres instance ${dbInstanceName}`)
    await DeleteServerlessDBInstance({
      ...apig,
      ...{
        DbInstanceName: dbInstanceName
      }
    })
    this.context.debug(`Removed postgres instance ${dbInstanceName}.`)
    this.state = {}
    await this.save()
    return {}
  }
}

module.exports = TencentDB
