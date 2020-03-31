const { sleep, waitResponse } = require('@ygkit/request')
const {
  CreateServerlessDBInstance,
  DescribeServerlessDBInstances,
  OpenServerlessDBExtranetAccess,
  CloseServerlessDBExtranetAccess,
  DeleteServerlessDBInstance
} = require('./apis')

// timeout 5 minutes
const TIMEOUT = 5 * 60 * 1000

/**
 *
 * @param {object} context serverless context
 * @param {object} apig capi instance
 * @param {*} dBInstanceName
 */
async function getDbInstanceDetail(context, apig, dBInstanceName) {
  // get instance detail
  try {
    const res = await DescribeServerlessDBInstances(apig, {
      Filter: [
        {
          Name: 'db-instance-name',
          Values: [dBInstanceName]
        }
      ]
    })
    if (res.DBInstanceSet) {
      const {
        DBInstanceSet: [dbDetail]
      } = res
      return dbDetail
    }
    return null
  } catch (e) {
    context.debug(e)
    return null
  }
}

/**
 * get db public access status
 * @param {array} netInfos network infos
 */
function getDbExtranetAccess(netInfos) {
  let result = false
  netInfos.forEach((item) => {
    if (item.NetType === 'public') {
      result = item.Status === '1'
    }
  })
  return result
}

/**
 INSTANCE_STATUS_APPLYING:    "applying",    申请中
 INSTANCE_STATUS_INIT:        "init",        待初始化
 INSTANCE_STATUS_INITING:     "initing",     初始化中
 INSTANCE_STATUS_OK:          "running",     运行中
 INSTANCE_STATUS_LIMITED:     "limited run", 受限运行
 INSTANCE_STATUS_ISOLATED:    "isolated",    已隔离
 INSTANCE_STATUS_RECYCLING:   "recycling",   回收中
 INSTANCE_STATUS_RECYCLED:    "recycled",    已回收
 INSTANCE_STATUS_JOB_RUNNING: "job running", 任务执行中
 INSTANCE_STATUS_OFFLINE:     "offline",     下线
 INSTANCE_STATUS_MIGRATE:     "migrating",   迁移中
 INSTANCE_STATUS_EXPANDING:   "expanding",   扩容中
 INSTANCE_STATUS_READONLY:    "readonly",    只读
 INSTANCE_STATUS_RESTARTING:  "restarting",  重启中
 */

/**
 * toggle db instance extranet access
 * @param {object} context serverless component context
 * @param {object} apig capi client
 * @param {string} dBInstanceName db instance name
 * @param {boolean} extranetAccess whether open extranet accesss
 */
async function toggleDbInstanceAccess(context, apig, dBInstanceName, extranetAccess) {
  if (extranetAccess) {
    context.debug(`Start open db extranet access...`)
    await OpenServerlessDBExtranetAccess(apig, {
      DBInstanceName: dBInstanceName
    })
    const detail = await waitResponse({
      callback: async () => getDbInstanceDetail(context, apig, dBInstanceName),
      targetResponse: 'running',
      targetProp: 'DBInstanceStatus',
      timeout: TIMEOUT
    })
    context.debug(`Open db extranet access success`)
    return detail
  }
  context.debug(`Start close db extranet access...`)
  await CloseServerlessDBExtranetAccess(apig, {
    DBInstanceName: dBInstanceName
  })
  const detail = await waitResponse({
    callback: async () => getDbInstanceDetail(context, apig, dBInstanceName),
    targetResponse: 'running',
    targetProp: 'DBInstanceStatus',
    timeout: TIMEOUT
  })
  context.debug(`Close db extranet access success`)
  return detail
}

/**
 * create db instance
 * @param {object} context serverless component context
 * @param {object} apig capi client
 * @param {object} postgresInputs create db instance inputs
 */
async function createDbInstance(context, apig, postgresInputs) {
  context.debug(`Start create DB instance ${postgresInputs.DBInstanceName}...`)
  const { DBInstanceId } = await CreateServerlessDBInstance(apig, postgresInputs)
  context.debug(`Creating DB instance ID: ${DBInstanceId}`)

  const detail = await waitResponse({
    callback: async () => getDbInstanceDetail(context, apig, postgresInputs.DBInstanceName),
    targetResponse: 'running',
    targetProp: 'DBInstanceStatus',
    timeout: TIMEOUT
  })
  context.debug(`Created DB instance name ${postgresInputs.DBInstanceName} successfully`)
  return detail
}

/**
 * delete db instance
 * @param {object} context serverless component context
 * @param {object} apig capi client
 * @param {string} db instance name
 */
async function deleteDbInstance(context, apig, dBInstanceName) {
  context.debug(`Start removing postgres instance ${dBInstanceName}`)
  await DeleteServerlessDBInstance(apig, {
    DBInstanceName: dBInstanceName
  })
  const detail = await waitResponse({
    callback: async () => getDbInstanceDetail(context, apig, dBInstanceName),
    targetResponse: undefined,
    targetProp: 'DBInstanceStatus',
    timeout: TIMEOUT
  })
  context.debug(`Removed postgres instance ${dBInstanceName}.`)
  return detail
}

/**
 * format postgresql connect string
 * @param {object} netInfo network info
 * @param {object} accountInfo account info
 * @param {string} dbName db name
 */
function formatPgUrl(netInfo, accountInfo, dbName) {
  return {
    connectionString: `postgresql://${accountInfo.DBUser}:${encodeURIComponent(
      accountInfo.DBPassword
    )}@${netInfo.Address || netInfo.Ip}:${netInfo.Port}/${dbName}`,
    host: netInfo.Address || netInfo.Ip,
    port: netInfo.Port,
    user: accountInfo.DBUser,
    password: accountInfo.DBPassword,
    dbname: dbName
  }
}

module.exports = {
  TIMEOUT,
  createDbInstance,
  getDbInstanceDetail,
  getDbExtranetAccess,
  deleteDbInstance,
  toggleDbInstanceAccess,
  formatPgUrl,
  sleep
}
