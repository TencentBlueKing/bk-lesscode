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
    <style-layout :title="$t('尺寸')">
        <div class="size-container">
            <template v-for="item in sizeConfigRender">
                <size-input
                    :key="item.key"
                    :value="item.value"
                    :item="item"
                    @change="handleInputChange(item, $event)">
                    <size-unit
                        v-if="item.key !== 'display'"
                        :value="item.unit"
                        @change="handleSelectChange(item, $event)" />
                </size-input>
            </template>
        </div>
    </style-layout>
</template>

<script>
    import StyleLayout from '../layout/index'
    import SizeInput from '@/components/modifier/icon-size-input'
    import SizeUnit from '@/components/modifier/size-unit'
    import { splitValueAndUnit } from '@/common/util'
    import { getCssProperties } from '../common/util'
    import defaultUnitMixin from '@/common/defaultUnit.mixin'

    const sizeConfig = [
        {
            name: window.i18n.t('宽度'),
            key: 'width',
            icon: 'bk-drag-kuandu'
        },
        {
            name: window.i18n.t('高度'),
            key: 'height',
            icon: 'bk-drag-gaodu'
        },
        {
            name: window.i18n.t('style_最小宽度'),
            key: 'minWidth',
            icon: 'bk-drag-zuixiaokuandu'
        },
        {
            name: window.i18n.t('style_最小高度'),
            key: 'minHeight',
            icon: 'bk-drag-zuixiaogaodu'
        },
        {
            name: window.i18n.t('style_最大宽度'),
            key: 'maxWidth',
            icon: 'bk-drag-zuidakuandu'
        },
        {
            name: window.i18n.t('style_最大高度'),
            key: 'maxHeight',
            icon: 'bk-drag-zuidagaodu'
        },
        {
            tips: 'display',
            name: 'display',
            key: 'display',
            icon: 'bk-drag-display-3',
            type: 'select',
            options: [
                { id: 'block', name: 'block' },
                { id: 'inline', name: 'inline' },
                { id: 'inline-block', name: 'inline-block' },
                { id: 'unset', name: 'unset' }
            ]
        }
    ]
    
    export default {
        components: {
            StyleLayout,
            SizeUnit,
            SizeInput
        },
        mixins: [defaultUnitMixin],
        props: {
            value: {
                type: Object,
                required: true
            },
            include: {
                type: Array
            },
            exclude: {
                type: Array
            },
            change: {
                type: Function,
                required: true
            }
        },
        data () {
            return {
                sizeConfigRender: []
            }
        },
        watch: {
            value: {
                handler (value) {
                    if (this.isInnerChange) {
                        this.isInnerChange = false
                        return
                    }
                    let result = getCssProperties(sizeConfig, this.include, this.exclude)
                    result = result.map((item) => {
                        if (item.key === 'display') {
                            item['value'] = value.display || ''
                        } else {
                            item['value'] = splitValueAndUnit('value', value[item.key])
                            item['unit'] = splitValueAndUnit('unit', value[item.key]) || this.defaultUnit
                        }
                        return item
                    })
                    this.sizeConfigRender = result
                },
                immediate: true
            }
        },
        created () {
            this.isInnerChange = false
        },
        methods: {
            triggerChange (key, value) {
                this.isInnerChange = true
                this.change(key, value)
            },
            handleInputChange (item, val) {
                let newValue = ''
                if (item.key !== 'display') {
                    newValue = newValue = val === '' ? '' : val + item.unit
                } else {
                    newValue = val
                }
                item.value = val
                
                this.triggerChange(item.key, newValue)
            },
            handleSelectChange (item, unit) {
                item.unit = unit
                if (item.value !== '') {
                    item.value = Math.min(item.value, unit === '%' ? 100 : item.value)
                    this.triggerChange(item.key, item.value + unit)
                }
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .size-container {
        display: flex;
        justify-content: space-between;
        flex-wrap: wrap;
    }
</style>
