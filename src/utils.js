const ensureNumber = require('type/number/ensure')
const ensureObject = require('type/object/ensure')
const ensureString = require('type/string/ensure')

const DEFAULTS = {
  region: 'ap-guangzhou',
  zone: 'ap-guangzhou-2',
  projectId: 0,
  dBVersion: '10.4',
  dBCharset: 'UTF8',
  extranetAccess: false
}

const prepareInputs = (inputs) => {
  inputs.dBInstanceName = ensureString(inputs.dBInstanceName)
  inputs.region = ensureString(inputs.region, { default: DEFAULTS.region })
  inputs.zone = ensureString(inputs.zone, { default: DEFAULTS.zone })
  inputs.projectId = ensureNumber(inputs.projectId, { default: DEFAULTS.projectId })
  inputs.dBVersion = ensureString(inputs.dBVersion, { default: DEFAULTS.dBVersion })
  inputs.dBCharset = ensureString(inputs.dBCharset, { default: DEFAULTS.dBCharset })
  inputs.extranetAccess = inputs.extranetAccess === true ? true : DEFAULTS.extranetAccess

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

module.exports = {
  prepareInputs
}
