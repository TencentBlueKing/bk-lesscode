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
    <style-layout :title="$t('定位')">
        <style-item name="position">
            <bk-select
                :value="positionValue"
                font-size="medium"
                :placeholder="$t('请选择')"
                @change="handlePositionChange"
                style="width: 100%;">
                <bk-option id="absolute" name="absolute" v-bk-tooltips="getTooltipsConfig($t('绝对定位:HTML元素会被移出正常文档流，并不为元素预留空间，通过指定元素相对于最近的非 static 定位祖先元素的移，来确定元素位置。'))" />
                <bk-option id="fixed" name="fixed" v-bk-tooltips="getTooltipsConfig($t('固定位置:HTML 元素的位置相对于浏览器窗口是固定位置，即使窗口是滚动的它也不会移动。'))" />
                <bk-option id="static" name="static" v-bk-tooltips="getTooltipsConfig($t('静态定位:HTML元素的默认值，即没有定位，循正常的文档流对象。静态定位的元素不会受到 top,bottom,left,right设置影响。'))" />
                <bk-option id="relative" name="relative" v-bk-tooltips="getTooltipsConfig($t('相对定位: HTML元素相对于其原本位置进行定位，但不会脱离文档流， 可以结合 top、right、bottom 和 left 属性对元素位置进行调整。'))" />
            </bk-select>
        </style-item>
        <div v-if="positionValue && positionValue !== 'static' && positionValue !== 'unset'" style="margin-top: 12px;">
            <distance-container style="z-index: 10">
                <template v-for="item in posConfigRender">
                    <distance-item
                        v-if="item.key !== 'zIndex'"
                        :name="item.name"
                        :key="item.key"
                        :unit="item.unit"
                        :value="item.value"
                        :distance="item.distanceStyle"
                        @change="handleInputChange(item, $event)"
                    >
                        <size-unit :value="item.unit" @change="handleSelectChange(item, $event)" class="small-padding"></size-unit>
                    </distance-item>
                </template>
            </distance-container>
            <style-item name="zIndex">
                <bk-input
                    type="number"
                    :value="zIndexItem.value || ''"
                    :min="0"
                    @change="handleInputChange(item, $event)"
                />
            </style-item>
        </div>
    </style-layout>
</template>

<script>
    import StyleLayout from '../layout/index'
    import StyleItem from '../layout/item'
    import { splitValueAndUnit } from '@/common/util'
    import { getCssProperties, getTooltipsConfig } from '../common/util'
    import defaultUnitMixin from '@/common/defaultUnit.mixin'
    import distanceContainer from '@/components/modifier/distance-container'
    import distanceItem from '@/components/modifier/distance-item'
    import SizeUnit from '@/components/modifier/size-unit'
    import SizeInput from '@/components/modifier/size-input'

    const posConfig = [
        {
            name: 'top',
            key: 'top',
            distanceStyle: 'distance-top'
        },
        {
            name: 'left',
            key: 'left',
            distanceStyle: 'distance-left'
        },
        {
            name: 'right',
            key: 'right',
            distanceStyle: 'distance-right'
        },
        {
            name: 'bottom',
            key: 'bottom',
            distanceStyle: 'distance-bottom'
        },
        {
            name: 'z-index',
            key: 'zIndex'
        }
    ]
    
    export default {
        components: {
            StyleLayout,
            StyleItem,
            distanceContainer,
            distanceItem,
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
                positionValue: this.value.position || '',
                posConfigRender: []
            }
        },
        computed: {
            zIndexItem () {
                return this.posConfigRender.find(item => item.key === 'zIndex') || {}
            }
        },
        mounted () {
            this.handleInitValueList()
        },
        methods: {
            handleInitValueList () {
                let result = getCssProperties(posConfig, this.include, this.exclude)
                const that = this
                result = result.map((item) => {
                    if (item.key === 'zIndex') {
                        item['value'] = that.value[item.key] || ''
                    } else {
                        item['value'] = splitValueAndUnit('value', that.value[item.key])
                        item['unit'] = splitValueAndUnit('unit', that.value[item.key]) || this.defaultUnit
                    }
                    return item
                })
                this.posConfigRender = result
            },
            handleInputChange (item, val) {
                item.value = val
                const unit = item.key !== 'zIndex' ? item.unit : ''
                const newValue = val === '' ? '' : val + unit
                this.change(item.key, newValue)
            },
            handleSelectChange (item, unit) {
                if (item.value !== '') {
                    item.unit = unit
                    item.value = Math.min(item.value, unit === '%' ? 100 : item.value)
                    this.change(item.key, item.value + unit)
                }
            },
            handlePositionChange (val) {
                this.posConfigRender.forEach(item => {
                    this.handleSelectChange(item, 'px')
                    this.handleInputChange(item, '')
                })
                this.positionValue = val
                this.change('position', val)
            },
            getTooltipsConfig
        }
    }
</script>
