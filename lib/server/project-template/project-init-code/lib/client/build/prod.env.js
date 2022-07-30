/**
 * @file 正式环境 env
 * @author
 */

// 环境变量里的值需要 JSON.stringify 化，原因如下：
// 这里的变量是给 new webpack.DefinePlugin 插件使用的，这个插件有如下两个特点：
// 1、如果传入的变量是字符串，那么它将被用作代码片段。
// 2、如果传入的变量不是字符串，那么它将被字符串化(包括函数)。
// 例如：
// 在代码中使用如下代码
// if (a === VARI)
// 如果这里定义的是 VART: JSON.stringify('abcde') 那么这段代码会替换为 if (a === 'abcde')
// 如果这里定义的是 VART: 'abcde' 那么这段代码会替换为 if (a === abcde) 会报错

const NODE_ENV = JSON.stringify('production')
// 社区版/开源版，部署的应用url带子路径
const SUB_PATH = process.env.BKPAAS_ENGINE_REGION === 'default' ? (process.env.BKPAAS_SUB_PATH || '/') : '/'
const appCodeId = `${process.env.BK_PROJECT_CODE}${process.env.BK_PROJECT_ID}`
const BK_APP_APIGW_PREFIX = `${process.env.BK_API_URL_TMPL.replace('{api_name}', `lesscode-${appCodeId}`)}/${process.env.BKPAAS_ENVIRONMENT}`

module.exports = {
    NODE_ENV: NODE_ENV,
    USER_INFO_URL: JSON.stringify('/user/getUser'),
    LOGIN_SERVICE_URL: JSON.stringify(process.env.BK_LOGIN_URL),
    AJAX_URL_PREFIX: JSON.stringify(`${SUB_PATH}api`),
    BK_USER_MANAGE_HOST: JSON.stringify(process.env.BK_USER_MANAGE_URL),
    BK_ITSM_URL: JSON.stringify(process.env.BK_ITSM_URL),
    BK_APP_APIGW_PREFIX: JSON.stringify(BK_APP_APIGW_PREFIX)
}
