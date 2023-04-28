const IS_EDV = process.env.NODE_ENV === 'production'

module.exports = IS_EDV
    // 本地开发
    ? {
        // 权限中心 SaaS HOST
        IAM_SAAS_HOST: '${iamSaasHost}',
        // 权限中心接口 HOST
        IAM_HOST: '${iamHost}',
        // 注册到 v3 正式环境的 app id
        IAM_APP_ID: '${iamAppId}',
        // 注册到 v3 正式环境的 app secret
        IAM_APP_SECRET: '${iamAppSecret}',
        // 注册到权限中心的 system id，即当前 app 在权限中心的 system id
        IAM_SYSTEM_ID: '${iamSystemId}'
    }
    // 生产环境
    : {
        // 权限中心 SaaS HOST
        IAM_SAAS_HOST: '${iamSaasHost}',
        // 权限中心接口 HOST
        IAM_HOST: '${iamHost}',
        // 注册到 v3 正式环境的 app id
        IAM_APP_ID: '${iamAppId}',
        // 注册到 v3 正式环境的 app secret
        IAM_APP_SECRET: '${iamAppSecret}',
        // 注册到权限中心的 system id，即当前 app 在权限中心的 system id
        IAM_SYSTEM_ID: '${iamSystemId}'
    }
