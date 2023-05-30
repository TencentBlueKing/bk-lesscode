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
import {
    VARIABLE_VALUE_TYPE,
    VARIABLE_TYPE
} from './constant'

/**
 * 判断是否展示内置属性变量
 * @param {*} type 属性类型
 * @param {*} name 属性名称
 * @param {*} nodeType 节点类型
 * @returns 是否展示 Boolean
 */
export const determineShowPropInnerVariable = (propType, propName, nodeType) => {
    // form 表单的 model 属性需要展示内置变量
    const isFormModel = nodeType === 'widget-form' && propName === 'model'
    // remote data-source 类型的需要展示内置变量
    const types = Array.isArray(propType) ? propType : [propType]
    const isRemoteType = types.some((type) => {
        return ['remote', 'data-source', 'table-data-source'].includes(type)
    })
    return isFormModel || isRemoteType
}

/**
 * 判断是否展示内置slot变量
 * @param {*} type slot类型
 * @returns 是否展示 Boolean
 */
export const determineShowSlotInnerVariable = (type) => {
    // remote data-source 类型的需要展示内置变量
    const isRemoteType = type?.some((type) => {
        return ['remote', 'data-source', 'select-data-source'].includes(type)
    })
    return isRemoteType
}

/**
 * 通过 variablecode 或者 变量的值，用于预览或者画布
 */
export const getVariableValue = (variable) => {
    const copyVariable = JSON.parse(JSON.stringify(variable || {}))
    const { defaultValue, defaultValueType, valueType } = copyVariable
    let value = defaultValueType === VARIABLE_VALUE_TYPE.SAME ? defaultValue?.all : defaultValue?.stag
    // 计算变量，赋为空值
    if (valueType === VARIABLE_TYPE.COMPUTED.VAL) {
        value = ''
    }
    // 对象类型，解析为object
    if (valueType === VARIABLE_TYPE.OBJECT.VAL && typeof value !== 'object') {
        value = JSON.parse(value)
    }
    return value
}
