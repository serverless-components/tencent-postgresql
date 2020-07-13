const ensureNumber = require('type/number/ensure')
const ensureObject = require('type/object/ensure')
const ensureString = require('type/string/ensure')
const { TypeError } = require('tencent-component-toolkit/src/utils/error')
const CONFIGS = require('./config')

const prepareInputs = (inputs) => {
  try {
    inputs.dBInstanceName = ensureString(inputs.dBInstanceName, {
      errorMessage: 'dBInstanceName is required'
    })
    inputs.region = ensureString(inputs.region, { default: CONFIGS.region })
    inputs.zone = ensureString(inputs.zone, { default: CONFIGS.zone })
    inputs.projectId = ensureNumber(inputs.projectId, { default: CONFIGS.projectId })
    inputs.dBVersion = ensureString(inputs.dBVersion, { default: CONFIGS.dBVersion })
    inputs.dBCharset = ensureString(inputs.dBCharset, { default: CONFIGS.dBCharset })
    inputs.extranetAccess = inputs.extranetAccess === true ? true : CONFIGS.extranetAccess

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
  } catch (e) {
    throw new TypeError(`PARAMETER_${CONFIGS.compName.toUpperCase()}`, e.message, e.stack)
  }

  return inputs
}

module.exports = {
  prepareInputs
}
