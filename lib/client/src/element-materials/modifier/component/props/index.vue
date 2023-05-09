<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <div v-if="hasMaterialConfig">
        <template v-for="(item, key) in propsConfig">
            <render-prop
                v-if="item.type !== 'hidden'"
                :component-type="componentType"
                :component-id="componentId"
                :describe="item"
                :last-value="lastProps[key]"
                :name="key"
                :key="key"
                :syncSlot="syncSlot"
                @on-change="handleChange" />
        </template>
    </div>
</template>
<script>
    import _ from 'lodash'
    import { bus } from '@/common/bus'
    import LC from '@/element-materials/core'
    import RenderProp from './components/render-prop'
    import useDatasource from '@/hooks/use-datasource'

    export default {
        name: 'modifier-prop',
        components: {
            RenderProp
        },
        data () {
            return {
                propsConfig: {},
                lastProps: {}
            }
        },
        computed: {
            hasMaterialConfig () {
                let count = 0
                Object.keys(this.propsConfig).forEach(propName => {
                    if (this.propsConfig[propName].type !== 'hidden') {
                        count++
                    }
                })
                return count > 0
            }
        },
        created () {
            this.material = {}
            bus.$on('update-chart-options', this.updateChartOptions)
            this.$once('hook:beforeDestroy', () => {
                bus.$off('update-chart-options', this.updateChartOptions)
            })
            this.componentNode = LC.getActiveNode()
            if (this.componentNode) {
                const {
                    type,
                    componentId,
                    material,
                    renderProps
                } = this.componentNode
                this.componentType = type
                this.componentId = componentId
                this.propsConfig = Object.freeze(material.props)
                this.lastProps = Object.freeze(_.cloneDeep(renderProps))
                this.material = material
            }
            const updateCallback = _.debounce((event) => {
                if (event.target.componentId !== this.componentNode.componentId) {
                    return
                }
                this.lastProps = Object.freeze(_.cloneDeep(this.componentNode.renderProps))
            }, 100)

            LC.addEventListener('update', updateCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('update', updateCallback)
            })
        },
        methods: {
            // 针对chart类型，将动态返回的remoteOptions与options合并
            updateChartOptions (res) {
                try {
                    if (this.componentNode.renderProps['options']
                        && this.componentNode.renderProps['options'].renderValue
                        && typeof this.componentNode.renderProps['options'].renderValue === 'object') {
                        const options = Object.assign({}, this.componentNode.renderProps['options'].renderValue, res)
                        this.componentNode.renderProps['options'] = {
                            ...this.componentNode.renderProps['options'],
                            val: options
                        }
                        this.componentNode.renderProps['options'].renderValue = options

                        this.$bkMessage({
                            theme: 'success',
                            message: `图表配置已更新，${Object.keys(res).join('、')}选项已被远程数据覆盖`
                        })

                        // this.batchUpdate({
                        //     renderProps: this.componentNode.renderProps
                        // })
                    }
                } catch (error) {
                    this.$bkMessage({
                        theme: 'error',
                        message: error
                    })
                }
            },
            syncOtherProp (propName) {
                if (['bk-charts', 'chart'].includes(this.componentNode.type)
                    && ['options', 'remoteOptions'].includes(propName)) {
                    // bk-charts, chart 组件的 remoteOptions 需要和 options 同步
                    // remoteOptions 覆盖 options 的配置
                    const propOfOptionsData = this.lastProps['options']
                    const propOfRemoteOptionsData = this.lastProps['remoteOptions']

                    console.log(this.lastProps['options'], this.lastProps['remoteOptions'], 'last')

                    const realOptionValue = Object.assign(
                        {},
                        _.cloneDeep(propOfOptionsData.renderValue),
                        _.cloneDeep(propOfRemoteOptionsData.renderValue)
                    )

                    console.log(realOptionValue, 'real')

                    if (propOfOptionsData.format === 'value') {
                        // format 为 value 替换所有配置
                        this.componentNode.setProp('options', LC.utils.genPropFormatValue({
                            ...propOfOptionsData,
                            format: 'value',
                            code: realOptionValue,
                            renderValue: realOptionValue
                        }))
                    } else if (propOfOptionsData.format === 'variable') {
                        // format 为 variable 类型只替换 renderValue
                        this.componentNode.setProp('options', LC.utils.genPropFormatValue({
                            ...propOfOptionsData,
                            format: 'variable',
                            renderValue: realOptionValue
                        }))
                    }
                }
            },
            /**
             * 通过 table 的 data 推导出 table 列的配置
             */
            async syncSlot (key) {
                const {
                    format,
                    payload,
                    renderValue = [],
                    valueType
                } = this.componentNode.renderProps[key]

                // 需要同步 prop 配置到 slot 的场景
                // 同时满足下面的条件
                // - prop format 配置为值类型
                if (format !== 'value') {
                    return
                }
                // 同步 table 的 columns
                if (key === 'data'
                    && [
                        'bk-table',
                        'el-table',
                        'folding-table',
                        'search-table',
                        'widget-bk-table',
                        'widget-el-table'
                    ].includes(this.componentType)) {
                    // 默认同步 第一个 slot
                    const slotName = Object.keys(this.material.slots)[0]
                    const slotConfig = this.material.slots[slotName]
                    // 通过值类型计算的 columns
                    const firstValue = renderValue[0] || {}
                    let columns = Object.keys(firstValue)
                    // 通过接口获取 columns
                    if (valueType === 'table-data-source') {
                        const { getTable } = useDatasource()
                        const table = await getTable(this.$route.params.projectId, payload.sourceData?.tableName, payload.sourceData?.dataSourceType)
                        columns = table?.columns?.map(column => column.name) || []
                    }
                    // 获取自定义column配置，这个配置比较复杂不覆盖
                    const renderSlot = this.componentNode.renderSlots[slotName]
                    const slotRenderValue = renderSlot.renderValue || []
                    const customColumns = slotRenderValue.filter(column => column.type === 'customCol')
                    // 返回 columns 的时候根据返回值渲染，否则渲染配置的值
                    const newColumns = columns.length > 0
                        ? columns.map(columnName => ({
                            label: columnName,
                            prop: columnName,
                            sortable: false,
                            type: ''
                        }))
                        : slotConfig.val
                    const slotValue = [
                        ...newColumns,
                        ...customColumns
                    ]
                    this.componentNode.setRenderSlots({
                        format: 'value',
                        component: Array.isArray(slotConfig.name) ? slotConfig.name[0] : slotConfig.name,
                        code: slotValue,
                        valueType: 'table-list',
                        renderValue: slotValue
                    }, slotName)
                }
            },
            /**
             * @desc 更新 prop 配置
             * @param { String } propName
             * @param { Object } propData
             *
             * 更新列配置并同步 slot
             */
            handleChange: _.throttle(function (propName, propData) {
                this.lastProps = Object.freeze({
                    ...this.lastProps,
                    [propName]: propData
                })

                /** 兼容bkcharts的精细化配置升级，去除了remoteOptions，当修改了options，将remoteOptions置空 */
                const updateBkChartsRemoteOptions = (this.componentNode.type === 'bk-charts' && propName === 'options') ? {
                    remoteOptions: LC.utils.genPropFormatValue({
                        format: 'value',
                        code: {},
                        renderValue: {},
                        payload: {}
                    })
                } : {}

                this.componentNode.setRenderProps({
                    ...this.lastProps,
                    [propName]: propData,
                    ...updateBkChartsRemoteOptions
                })
                // this.syncOtherProp(propName)
            }, 60)
        }
    }
</script>
