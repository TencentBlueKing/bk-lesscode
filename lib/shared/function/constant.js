/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { sharedI18n } from '../util'
/**
 * 函数方法枚举
 */
export const FUNCTION_METHOD = {
    GET: 'get',
    POST: 'post',
    PUT: 'put',
    DELETE: 'delete',
    HEAD: 'head',
    OPTIONS: 'options',
    TRACE: 'trace',
    CONNECT: 'connect',
    PATCH: 'patch'
}

/**
 * 函数类型枚举
 */
export const FUNCTION_TYPE = {
    EMPTY: 0,
    REMOTE: 1,
    SERVERLESS: 2
}

/**
 * 函数提示
 */
export const FUNCTION_TIPS = () => ({
    [FUNCTION_TYPE.EMPTY]: '/**\r\n'
        + '* 1. ' + sharedI18n().t('空白函数：函数内容完全由用户编写，用于页面组件属性配置和事件绑定\r\n')
        + '* 2. ' + sharedI18n().t('函数用于页面组件属性时：函数必须有返回值，该返回值将会赋值给组件属性\r\n')
        + '* 3. ' + sharedI18n().t('函数用于组件或页面事件时：函数将在事件触发时执行\r\n')
        + '* 4. ' + sharedI18n().t('可以使用 “lesscode.变量标识” 唤起自动补全功能，必须通过编辑器自动补全功能选择对应变量，来获取或者修改变量值\r\n')
        + '* 5. ' + sharedI18n().t('可以使用 “lesscode.函数名称” 唤起自动补全功能，必须通过编辑器自动补全功能选择对应函数，来调用应用中的其它函数\r\n')
        + '* 6. ' + sharedI18n().t('函数用于组件属性时，函数体代码示例如下：\r\n')
        + '* return Promise.all([\r\n'
        + '*     this.$http.get(' + sharedI18n().t('接口地址') + '),\r\n'
        + '*     this.$http.post(' + sharedI18n().t('接口地址') + ', { value: 2 })\r\n'
        + '* ]).then(([getDataRes, postDataRes]) => {\r\n'
        + '*     return [...getDataRes.data, ...postDataRes.data]\r\n'
        + '* })\r\n'
        + '*/\r\n',
    [FUNCTION_TYPE.REMOTE]: '/**\r\n'
        + '* 1. ' + sharedI18n().t('远程函数：系统将会根据参数组成 Ajax 请求，由用户在这里编写 Ajax 回调函数，函数用于页面组件属性配置和事件绑定\r\n')
        + '* 2. ' + sharedI18n().t('函数用于页面组件属性时：函数必须有返回值，该返回值将会赋值给组件属性\r\n')
        + '* 3. ' + sharedI18n().t('函数用于组件或页面事件时：函数将在事件触发时发起 Ajax 请求，并执行该回调函数\r\n')
        + '* 4. ' + sharedI18n().t('可以使用 “lesscode.变量标识” 唤起自动补全功能，必须通过编辑器自动补全功能选择对应变量，来获取或者修改变量值\r\n')
        + '* 5. ' + sharedI18n().t('可以使用 “lesscode.函数名称” 唤起自动补全功能，必须通过编辑器自动补全功能选择对应函数，来调用应用中的其它函数\r\n')
        + '* 6. ' + sharedI18n().t('例如 Api 返回数据使用参数 res 接收，则代码示例如下：return res.data\r\n')
        + '*/\r\n'
})

/**
 * 函数参数类型
 */
export const USE_API_TYPE = {
    VALUE: 'VALUE',
    VARIABLE: 'VARIABLE'
}
