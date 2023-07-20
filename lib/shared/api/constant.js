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

/**
 * api 方法枚举
 */
export const API_METHOD = {
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
 * 不携带请求体的方法
 */
export const METHODS_WITHOUT_DATA = ['delete', 'get', 'head', 'options']

/**
 * api 参数类型
 */
export const API_PARAM_TYPES = {
    STRING: {
        VAL: 'string',
        DEFAULT: '',
        TYPE: '[object String]'
    },
    OBJECT: {
        VAL: 'object',
        DEFAULT: null,
        TYPE: '[object Object]'
    },
    ARRAY: {
        VAL: 'array',
        DEFAULT: null,
        TYPE: '[object Array]'
    },
    BOOLEAN: {
        VAL: 'boolean',
        DEFAULT: false,
        TYPE: '[object Boolean]'
    },
    NUMBER: {
        VAL: 'number',
        DEFAULT: 0,
        TYPE: '[object Number]'
    }
}

/**
 * api 值类型
 */
export const API_PARAM_VALUE_TYPES = {
    VALUE: 'value',
    VARIABLE: 'variable'
}

/**
 * api 校验类型
 */
export const API_VALIDATE_TYPES = {
    REQUIRE: 'require',
    MIN_LENGTH: 'min-length',
    MAX_LENGTH: 'max-length',
    REGEXP: 'regexp',
    FUNCTION: 'function'
}
