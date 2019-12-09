function HttpError(code, message) {
  this.code = code || 0
  this.message = message || ''
}

HttpError.prototype = Error.prototype

const mocks = {
  CreateServerlessDBInstance: {
    RequestId: '78f2ce4c-6948-44b2-9106-6823d4f46cab',
    DBInstanceId: 'postgres-ec289zvy'
  },
  DescribeServerlessDBInstances: {
    TotalCount: 1,
    DBInstanceSet: [
      {
        DBInstanceId: 'postgres-ec289zvy',
        DBInstanceName: 'postgres-ec289zvy',
        DBInstanceStatus: 'running',
        Region: 'ap-beijing',
        Zone: 'ap-beijing-2',
        ProjectId: 0,
        VpcId: 'vpc-mbygarhc',
        SubnetId: 'subnet-1ijirb3v',
        DBCharset: 'UTF8',
        DBVersion: '10.4',
        CreateTime: '2019-12-03 20:10:06',
        DBInstanceNetInfo: [
          {
            Address: '',
            Ip: '10.0.2.15',
            Port: 5432,
            Status: 'opened',
            NetType: 'private'
          },
          {
            Address: 'postgres-hat35yo6.sql.tencentcdb.com',
            Ip: '123.206.48.253',
            Port: 51806,
            Status: '1',
            NetType: 'public'
          }
        ],
        DBAccountSet: [
          {
            DBUser: 'testfor',
            DBPassword: 'testfor2019',
            DBConnLimit: 1000
          }
        ],
        DBDatabaseList: ['postgres', 'serverless']
      }
    ],
    RequestId: '95033519-93e4-4ba5-aeef-3bd7119e82eb'
  },
  DeleteServerlessDBInstance: {},
  OpenServerlessDBExtranetAccess: {},
  CloseServerlessDBExtranetAccess: {}
}

let count = 0

function apiFactory(actions) {
  const apis = {}
  actions.forEach((action) => {
    apis[action] = ({ apig, ...inputs }) => {
      return new Promise((resolve, reject) => {
        if (action === 'DescribeServerlessDBInstances') {
          const res = mocks[action]
          if (count === 5) {
            res.DBInstanceSet[0].DBInstanceStatus = 'running'
            resolve(res)
          } else {
            res.DBInstanceSet[0].DBInstanceStatus = 'creating'
            count++
            resolve(res)
          }
        } else {
          resolve(mocks[action])
        }
        return
        apig.request(
          {
            Action: action,
            RequestClient: 'ServerlessComponent',
            Token: apig.defaults.Token || null,
            ...inputs
          },
          function(err, data) {
            if (err) {
              return reject(err)
            } else if (data.code !== 0) {
              return reject(new HttpError(data.code, data.message))
            }
            resolve(data)
          }
        )
      })
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
