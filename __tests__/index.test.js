const { generateId, getServerlessSdk } = require('./lib/utils')

const instanceYaml = {
  org: 'orgDemo',
  app: 'appDemo',
  component: 'postgresql@dev',
  name: `postgresql-integration-tests-${generateId()}`,
  stage: 'dev',
  inputs: {
    region: 'ap-guangzhou',
    zone: 'ap-guangzhou-2',
    dBInstanceName: "serverless-test",
    vpcConfig: {
      vpcId: 'vpc-b6531flb',
      subnetId: 'subnet-eexos4wi',
    },
  }
}

const credentials = {
  tencent: {
    SecretId: process.env.TENCENT_SECRET_ID,
    SecretKey: process.env.TENCENT_SECRET_KEY,
  }
}

const sdk = getServerlessSdk(instanceYaml.org)

describe('Postgresql', () => {
  it('deploy postgresql success', async () => {
    const instance = await sdk.deploy(instanceYaml, credentials)
    expect(instance).toBeDefined()
    expect(instance.instanceName).toEqual(instanceYaml.name)
    expect(instance.outputs).toEqual({
      region: instanceYaml.inputs.region,
      zone: instanceYaml.inputs.zone,
      vpcConfig: instanceYaml.inputs.vpcConfig,
      dBInstanceName: instanceYaml.inputs.dBInstanceName,
      dBInstanceId: expect.stringContaining('postgres-'),
      private: {
        connectionString: expect.stringContaining('postgresql://'),
        host: expect.any(String),
        port: 5432,
        user: expect.stringContaining('tencentdb_'),
        password: expect.any(String),
        dbname: expect.stringContaining('tencentdb_'),
      },
      vendorMessage: null,
    });
  })

  it('update postgresql success', async () => {
    instanceYaml.inputs.extranetAccess = true
    const instance = await sdk.deploy(instanceYaml, credentials)
    expect(instance).toBeDefined()
    expect(instance.instanceName).toEqual(instanceYaml.name)
    expect(instance.outputs).toEqual({
      region: instanceYaml.inputs.region,
      zone: instanceYaml.inputs.zone,
      vpcConfig: instanceYaml.inputs.vpcConfig,
      dBInstanceName: instanceYaml.inputs.dBInstanceName,
      dBInstanceId: expect.stringContaining('postgres-'),
      private: {
        connectionString: expect.stringContaining('postgresql://'),
        host: expect.any(String),
        port: 5432,
        user: expect.stringContaining('tencentdb_'),
        password: expect.any(String),
        dbname: expect.stringContaining('tencentdb_'),
      },
      public: {
        connectionString: expect.stringContaining('postgresql://'),
        host: expect.any(String),
        port: expect.any(Number),
        user: expect.stringContaining('tencentdb_'),
        password: expect.any(String),
        dbname: expect.stringContaining('tencentdb_'),
      },
      vendorMessage: null,
    });
  })

  it('remove postgresql success', async () => {
    await sdk.remove(instanceYaml, credentials)
    result = await sdk.getInstance(instanceYaml.org, instanceYaml.stage, instanceYaml.app, instanceYaml.name)

    expect(result.instance.instanceStatus).toEqual('inactive')
  })
})
