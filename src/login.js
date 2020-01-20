const fs = require('fs')
const path = require('path')
const { TencentLogin } = require('@tencent-sdk/login')

const ENV_TEMP_PATH = path.join(process.cwd(), '.env_temp')

async function doLogin() {
  const tencentLogin = new TencentLogin()
  const tencentCredentials = await tencentLogin.login()
  if (tencentCredentials) {
    tencentCredentials.timestamp = Date.now() / 1000
    try {
      const tencent = {
        SecretId: tencentCredentials.secret_id,
        SecretKey: tencentCredentials.secret_key,
        AppId: tencentCredentials.appid,
        Token: tencentCredentials.token,
        Expired: tencentCredentials.expired,
        Signature: tencentCredentials.signature,
        Uuid: tencentCredentials.uuid,
        Timestamp: tencentCredentials.timestamp
      }
      fs.writeFileSync(ENV_TEMP_PATH, JSON.stringify(tencent))
      return tencent
    } catch (e) {
      throw 'Error getting temporary key: ' + e
    }
  }
}

async function getTempKey(temp) {
  if (temp) {
    try {
      const tencentCredentialsRead = JSON.parse(fs.readFileSync(ENV_TEMP_PATH, 'utf8'))
      if (
        Date.now() / 1000 - tencentCredentialsRead.timestamp <= 6000 &&
        tencentCredentialsRead.AppId
      ) {
        return tencentCredentialsRead
      }
    } catch (e) {
      return getTempKey(false)
    }
  }

  try {
    const data = fs.readFileSync('./.env_temp', 'utf8')
    const tencent = {}
    const tencentCredentialsRead = JSON.parse(data)
    if (!tencentCredentialsRead.Token) {
      return doLogin()
    }
    if (
      Date.now() / 1000 - tencentCredentialsRead.Timestamp <= 6000 &&
      tencentCredentialsRead.AppId
    ) {
      return tencentCredentialsRead
    }
    const tencentLogin = new TencentLogin()
    const tencentCredentialsFlush = await tencentLogin.refresh(
      tencentCredentialsRead.Uuid,
      tencentCredentialsRead.Expired,
      tencentCredentialsRead.Signature,
      tencentCredentialsRead.AppId
    )
    if (tencentCredentialsFlush) {
      tencent.SecretId = tencentCredentialsFlush.secret_id
      tencent.SecretKey = tencentCredentialsFlush.secret_key
      tencent.AppId = tencentCredentialsFlush.appid
      tencent.Token = tencentCredentialsFlush.token
      tencent.Expired = tencentCredentialsFlush.expired
      tencent.Signature = tencentCredentialsFlush.signature
      tencent.Uuid = tencentCredentialsFlush.uuid
      tencent.Timestamp = Date.now() / 1000
      fs.writeFileSync('./.env_temp', JSON.stringify(tencent))
      return tencent
    }
    return doLogin()
  } catch (e) {
    return doLogin()
  }
}

module.exports = {
  getTempKey
}
