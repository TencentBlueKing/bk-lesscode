const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const dotenvExpand = require('dotenv-expand');

/**
 * 业务错误，用于非500错误信息，由接口自行处理错误
 * @param {*} message // 错误的信息，非必填，默认 “服务器出现业务错误”
 * @param {*} code // 错误码，非必填，默认 499
 * @param {*} data // 错误数据，非必填
 */
function BusinessError(message = '服务器错误', code = -1, status = 200, stack = (new Error()).stack, data) {
  this.name = 'BusinessError';
  this.status = status;
  this.message = message;
  this.code = code;
  this.data = data;
  this.stack = stack;
}
BusinessError.prototype = Object.create(Error.prototype);
BusinessError.prototype.constructor = BusinessError;

global.BusinessError = BusinessError;
// apigateway相关接口校验字段，开源/社区版为bk_token， 内部版为bk_ticket
global.AUTH_NAME = process.env.BKPAAS_ENGINE_REGION === 'ieod' ? 'bk_ticket' : 'bk_token';
global.ITSM_APP_CODE = process.env.BKPAAS_ENGINE_REGION === 'ieod' ? 'bkc-itsm' : 'bk-itsm';
global.BKPAAS_ENGINE_REGION = process.env.BKPAAS_ENGINE_REGION === 'ieod' ? 'ieod' : 'default';
// 是否对接权限中心
global.IAM_ENABLE = process.env.NODE_ENV !== 'development';

const loadEnv = (filePath) => {
  if (fs.existsSync(filePath)) {
    dotenvExpand.expand(dotenv.config({
      path: filePath,
    }));
  }
};
// 加载 .bk.local.env 文件，优先级最高
loadEnv(path.resolve(__dirname, '../../.bk.local.env'));
// 加载 .bk.{mode}.env 文件，优先级其次
loadEnv(path.resolve(__dirname, `../../.bk.${process.env.NODE_ENV}.env`));
// 加载 .bk.env 文件，优先级最低
loadEnv(path.resolve(__dirname, '../../.bk.env'));
