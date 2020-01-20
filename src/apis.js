function HttpError(code, message) {
  this.code = code || 0
  this.message = message || ''
}

HttpError.prototype = Error.prototype

function apiFactory(actions) {
  const apis = {}
  actions.forEach((action) => {
    apis[action] = async (apig, inputs) => {
      const data = {
        Version: '2017-03-12',
        Action: action,
        RequestClient: 'ServerlessComponent',
        ...inputs
      }
      if (apig.options.Token) {
        data.Token = apig.options.Token
      }
      try {
        const { Response } = await apig.request(
          data,
          // this is preset options for apigateway
          {
            debug: false,
            ServiceType: 'postgres',
            // baseHost: 'tencentcloudapi.com'
            host: 'postgres.tencentcloudapi.com'
          },
          false
        )
        if (Response && Response.Error && Response.Error.Code) {
          throw new HttpError(Response.Error.Code, Response.Error.Message)
        }
        return Response
      } catch (e) {
        throw new HttpError(500, e.message)
      }
    }
  })

  return apis
}

const ACTIONS = [
  'CreateServerlessDBInstance',
  'DescribeServerlessDBInstances',
  'DeleteServerlessDBInstance',
  'OpenServerlessDBExtranetAccess',
  'CloseServerlessDBExtranetAccess',
  'UpdateCdnConfig'
]
const APIS = apiFactory(ACTIONS)

module.exports = APIS
