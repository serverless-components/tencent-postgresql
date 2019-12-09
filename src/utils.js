const {
  DescribeServerlessDBInstances,
  OpenServerlessDBExtranetAccess,
  CloseServerlessDBExtranetAccess
} = require('./apis')

// timeout 5 minutes
const TIMEOUT = 5 * 60 * 1000

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function getDbInstanceDetail(apig, dBInstanceName) {
  // get instance detail
  const {
    DBInstanceSet: [dbDetail]
  } = await DescribeServerlessDBInstances({
    ...apig,
    ...{
      Filters: [dBInstanceName]
    }
  })
  return dbDetail
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

async function waitForStatus({
  callback,
  statusProp = 'status',
  // wait status
  targetStatus,
  // timeout mini seconds
  timeout,
  // start mini seconds
  start = Date.now(),
  // promise resolve
  resolve = null,
  // promise reject
  reject = null
}) {
  const now = Date.now()
  return new Promise(async (res, rej) => {
    try {
      resolve = resolve || res
      reject = reject || rej
      // timeout
      if (now - start > timeout) {
        reject(new Error('Request Timeout.'))
      }
      const detail = await callback()
      // 4: deploying, 1: created
      if (detail[statusProp] === targetStatus) {
        resolve(detail)
      } else {
        await sleep(1000)
        return waitForStatus({
          callback,
          statusProp,
          targetStatus,
          timeout,
          start,
          resolve,
          reject
        })
      }
    } catch (e) {
      reject(e)
    }
  })
}

async function toggleDbInstanceAccess(apig, dBInstanceName, extranetAccess) {
  if (extranetAccess) {
    this.context.debug(`Start open db extranet access...`)
    await OpenServerlessDBExtranetAccess({
      ...apig,
      ...{
        DBInstanceName: dBInstanceName
      }
    })
    const detail = await waitForStatus({
      callback: async () => getDbInstanceDetail(apig, dBInstanceName),
      targetStatus: 'running',
      statusProp: 'DBInstanceStatus',
      timeout: TIMEOUT
    })
    this.context.debug(`Open db extranet access success`)
    return detail
  }
  this.context.debug(`Start close db extranet access...`)
  await CloseServerlessDBExtranetAccess({
    ...apig,
    ...{
      DBInstanceName: dBInstanceName
    }
  })
  const detail = await waitForStatus({
    callback: async () => getDbInstanceDetail(apig, dBInstanceName),
    targetStatus: 'running',
    statusProp: 'DBInstanceStatus',
    timeout: TIMEOUT
  })
  this.context.debug(`Close db extranet access success`)
  return detail
}

function formatPgUrl(netInfo, accountInfo) {
  return `postgresql://${accountInfo.DBUser}:${accountInfo.DBPassword}@${netInfo.Address ||
    netInfo.Ip}:${netInfo.Port}`
}

module.exports = {
  TIMEOUT,
  getDbInstanceDetail,
  waitForStatus,
  toggleDbInstanceAccess,
  formatPgUrl,
  sleep
}
