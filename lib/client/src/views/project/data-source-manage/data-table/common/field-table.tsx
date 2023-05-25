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
    defineComponent,
    watch,
    reactive,
    toRef,
    ref
} from '@vue/composition-api'
import { VNode } from 'vue'
import fieldTable from '@/components/field-table/field-table'
import { getDefaultJson, normalizeJson } from 'shared/data-source/helper'
import { ORM_KEYS, BASE_COLUMNS, FIELDS_TYPES } from 'shared/data-source/constant'

export interface IFieldSelectOption {
    id: string
    name: string
}

interface ITableFieldRule {
    validator: Function,
    message: string
}

export interface ITableField {
    name: string
    type: string
    prop: string
    optionsList?: IFieldSelectOption[]
    width?: string
    isRequire?: boolean
    inputType?: string
    isReadonly?: boolean | Function,
    componentProps?: Function | any,
    rules?: ITableFieldRule[],
    tips?: string
}

export interface ITableStatus {
    data: object[]
}

/**
 * orm 数据转为表格数据
 * @param item orm 数据
 * @returns 表格数据
 */
function normalizeTableItem (item) {
    const normalizedItem = normalizeJson(item)
    // 默认列不可修改
    if (BASE_COLUMNS().some(item => item.columnId === normalizedItem.columnId)) {
        normalizedItem.isReadonly = true
    }
    return normalizedItem
}

/**
 * 表格数据转为orm 数据
 * @param item 表格数据
 * @returns orm 数据
 */
function normalizeOrmItem (item) {
    return ORM_KEYS.reduce((acc, cur) => {
        if (Reflect.has(item, cur)) {
            acc[cur] = item[cur]
        }
        return acc
    }, {})
}

export default defineComponent({
    components: {
        fieldTable
    },

    props: {
        data: {
            type: Array,
            default: () => ([])
        }
    },

    setup (props: ITableStatus, { emit }) {
        const tableFields: ITableField[] = [
            {
                name: window.i18n.t('table_字段名称'),
                type: 'input',
                prop: 'name',
                width: '210px',
                isRequire: true,
                rules: [
                    {
                        validator (val, row) {
                            return /^[a-zA-Z][a-zA-Z-_]*[a-zA-Z]$/.test(val)
                        },
                        message: window.i18n.t('开头和结尾需是大小写字母，中间可以是大小写字母、连字符和下划线。长度最少为2个字符')
                    },
                    {
                        validator (val, row) {
                            return !tableList.find((table) => table.name === val && row.columnId !== table.columnId)
                        },
                        message: window.i18n.t('字段名称不能重复')
                    },
                    {
                        validator (val, row) {
                            return !/^bk/.test(val)
                        },
                        message: window.i18n.t('字段名称不能以 bk 开头')
                    }
                ]
            },
            {
                name: window.i18n.t('table_字段类型'),
                type: 'select',
                prop: 'type',
                width: '140px',
                isRequire: true,
                optionsList: FIELDS_TYPES
            },
            {
                name: window.i18n.t('长度'),
                type: 'input',
                componentProps: {
                    type: 'number'
                },
                prop: 'length',
                width: '115px',
                isReadonly (item, props) {
                    return !['varchar', 'decimal'].includes(props?.row?.type)
                },
                rules: [
                    {
                        validator (val = 0, row) {
                            return row.type !== 'varchar' || (+val <= 15000 && +val > 0)
                        },
                        message: window.i18n.t('varchar 类型的长度需大于 0 小于 15000')
                    },
                    {
                        validator (val = 0, row) {
                            return row.type !== 'decimal' || (+val <= 65 && +val > 0)
                        },
                        message: window.i18n.t('decimal 类型的长度需大于 0 小于 65')
                    }
                ]
            },
            {
                name: window.i18n.t('table_小数点'),
                type: 'input',
                prop: 'scale',
                width: '115px',
                componentProps: {
                    type: 'number'
                },
                isReadonly (item, props) {
                    return !['decimal'].includes(props?.row?.type)
                },
                rules: [
                    {
                        validator (val = 0, row) {
                            return row.type !== 'decimal' || (+val > 0 && +val < +row.length)
                        },
                        message: window.i18n.t('小数点字段需要大于 0 且小于长度字段')
                    }
                ]
            },
            {
                name: window.i18n.t('索引'),
                type: 'checkbox',
                prop: 'index',
                width: '100px',
                isReadonly (item, props) {
                    return ['text', 'json'].includes(props?.row?.type)
                }
            },
            {
                name: window.i18n.t('唯一约束'),
                type: 'checkbox',
                prop: 'unique',
                width: '100px',
                isReadonly (item, props) {
                    return ['text', 'json'].includes(props?.row?.type)
                }
            },
            {
                name: window.i18n.t('可空'),
                type: 'checkbox',
                prop: 'nullable',
                width: '100px'
            },
            {
                name: window.i18n.t('默认值'),
                type: 'input',
                prop: 'default',
                isReadonly (item, props) {
                    return ['text', 'datetime', 'date', 'json'].includes(props?.row?.type)
                },
                componentProps (item, props) {
                    if (['int', 'datetime', 'decimal'].includes(props?.row?.type)) {
                        return {
                            type: 'number',
                            precision: +props?.row?.scale
                        }
                    } else {
                        return {
                            type: 'text'
                        }
                    }
                }
            },
            {
                name: window.i18n.t('备注'),
                type: 'input',
                prop: 'comment'
            }
        ]
        const tableList = reactive([])
        const tableRef = ref(null)

        watch(
            toRef(props, 'data'),
            (val) => {
                tableList.splice(
                    0,
                    tableList.length,
                    ...val.map(normalizeTableItem)
                )
            },
            {
                immediate: true
            }
        )

        const addField = (row, index) => {
            const defaultRow = getDefaultJson()
            tableList.splice(index + 1, 0, defaultRow)
            emit('change')
        }

        const deleteField = (row, index) => {
            tableList.splice(index, 1)
            emit('change')
        }

        const changeData = (value, row, column, index) => {
            // 设置值
            const currentRow = tableList[index]
            Object.assign(currentRow, { [column.prop]: value })

            // 标准化
            const normalizedItem = normalizeTableItem(currentRow)
            Object.assign(currentRow, normalizedItem)

            // 触发 change 事件
            emit('change')
        }

        const validate = () => {
            return new Promise((resolve, reject) => {
                tableRef.value?.verification().then(() => {
                    resolve(tableList.map(normalizeOrmItem))
                }).catch(reject)
            })
        }

        return {
            tableList,
            tableFields,
            tableRef,
            addField,
            deleteField,
            changeData,
            validate
        }
    },

    render (): VNode {
        return (
            <field-table
                ref="tableRef"
                data={this.tableList}
                column={this.tableFields}
                onAdd={this.addField}
                onDelete={this.deleteField}
                onChange={this.changeData}
            ></field-table>
        )
    }
})
