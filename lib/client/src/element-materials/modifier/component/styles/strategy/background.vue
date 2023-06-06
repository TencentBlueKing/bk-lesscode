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
    <style-layout :title="$t('背景')">
        <style-item :name="$t('颜色')" v-if="handleHasKey('backgroundColor')">
            <bk-color-picker
                :value="renderValueMap.backgroundColor"
                @change="handleValueChange('backgroundColor', $event)"
                style="width: 100%;" />
        </style-item>
        <style-item :name="$t('form_背景图')" v-if="handleHasKey('backgroundImage')">
            <bk-switcher
                :value="backgroundImageShow"
                theme="primary"
                size="small"
                @change="handleImageShowChange" />
        </style-item>
        <template v-if="backgroundImageShow">
            <style-item name="url">
                <src-input
                    :value="renderValueMap.backgroundImage"
                    @change="handleValueChange('backgroundImage', $event)"
                    style="width: 100%" />
            </style-item>
            <style-item :name="$t('大小')">
                <size-input
                    :value="backgroundSize.width"
                    :item="{ icon: 'bk-drag-kuandu', name: $t('宽度') }"
                    @change="handleBackgroundSizeChange('width', $event)"
                    style="width: 100%;margin-top: 0">
                    <size-unit
                        :value="backgroundSize.widthUnit"
                        @change="handleBackgroundSizeChange('widthUnit', $event)" />
                </size-input>
            </style-item>
            <style-item name="">
                <size-input
                    :value="backgroundSize.height"
                    :item="{ icon: 'bk-drag-gaodu', name: $t('高度') }"
                    @change="handleBackgroundSizeChange('height', $event)"
                    style="width: 100%;margin-top: 0">
                    <size-unit
                        :value="backgroundSize.heightUnit"
                        @change="handleBackgroundSizeChange('heightUnit', $event)" />
                </size-input>
            </style-item>

            <style-item :name="$t('位置')">
                <size-input
                    :value="backgroundPosition.x"
                    :item="{ icon: 'bk-drag-icon bk-drag-zuobianju', name: $t('左边距') }"
                    @change="handleBackgroundPositionChange('x', $event)"
                    style="width: 100%;margin-top: 0">
                    <size-unit
                        :value="backgroundPosition.xUnit"
                        @change="handleBackgroundPositionChange('xUnit', $event)" />
                </size-input>
            </style-item>
            <style-item name="">
                <size-input
                    :value="backgroundPosition.y"
                    :item="{ icon: 'bk-drag-icon bk-drag-dingbianju', name: $t('上边距') }"
                    @change="handleBackgroundPositionChange('y', $event)"
                    style="width: 100%;margin-top: 0">
                    <size-unit
                        :value="backgroundPosition.yUnit"
                        @change="handleBackgroundPositionChange('yUnit', $event)" />
                </size-input>
            </style-item>
            
            <style-item name="repeat">
                <bk-select
                    :value="imageConfig.backgroundRepeat"
                    font-size="medium"
                    @change="handleConfigChange('backgroundRepeat', $event)"
                    style="width: 100%;">
                    <bk-option id="repeat" name="repeat" />
                    <bk-option id="repeat-x" name="repeat-x" />
                    <bk-option id="repeat-y" name="repeat-y" />
                    <bk-option id="no-repeat" name="no-repeat" />
                </bk-select>
            </style-item>
            <style-item name="attachment">
                <bk-select
                    :value="imageConfig.backgroundAttachment"
                    font-size="medium"
                    @change="handleConfigChange('backgroundAttachment', $event)"
                    style="width: 100%;">
                    <bk-option id="scroll" name="scroll" />
                    <bk-option id="fixed" name="fixed" />
                </bk-select>
            </style-item>
        </template>
    </style-layout>
</template>

<script>
    import StyleLayout from '../layout/index'
    import StyleItem from '../layout/item'
    import SizeInput from '@/components/modifier/icon-size-input'
    import SizeUnit from '@/components/modifier/size-unit'
    import SrcInput from '@/components/src-input/index.vue'
    import { splitValueAndUnit } from '@/common/util'
    import { getCssProperties } from '../common/util'
    import defaultUnitMixin from '@/common/defaultUnit.mixin'

    export default {
        components: {
            StyleLayout,
            StyleItem,
            SizeUnit,
            SizeInput,
            SrcInput
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
                valueMap: {
                    backgroundColor: this.value.backgroundColor,
                    backgroundImage: this.value.backgroundImage
                },
                // background-image相关属性
                backgroundImageShow: false,
                backgroundSize: { width: '', height: '', widthUnit: this.defaultUnit, heightUnit: this.defaultUnit },
                backgroundPosition: { x: '', y: '', xUnit: this.defaultUnit, yUnit: this.defaultUnit },
                imageConfig: {
                    backgroundRepeat: this.value.backgroundRepeat || 'repeat',
                    backgroundAttachment: this.value.backgroundAttachment || 'scroll'
                },
                renderValueMap: {}
            }
        },
        created () {
            this.backgroundSize.widthUnit = this.defaultUnit
            this.backgroundSize.heightUnit = this.defaultUnit
            this.backgroundPosition.xUnit = this.defaultUnit
            this.backgroundPosition.yUnit = this.defaultUnit
        },
        mounted () {
            this.handleMapInit()
        },
        methods: {
            handleMapInit () {
                this.renderValueMap = getCssProperties(this.valueMap, this.include, this.exclude)

                // 初始化background-image相关属性
                console.log(this.value, 'value')
                if (this.renderValueMap.hasOwnProperty('backgroundImage')) {
                    if (this.renderValueMap.backgroundImage) {
                        this.backgroundImageShow = true
                        this.renderValueMap.backgroundImage = this.renderValueMap.backgroundImage.replace(/url\(|\)/g, '')
                    }
                    if (this.value.backgroundSize) {
                        const size = this.value.backgroundSize.split(' ')
                        this.backgroundSize.width = splitValueAndUnit('value', size[0])
                        this.backgroundSize.height = splitValueAndUnit('value', size[1])
                        this.backgroundSize.widthUnit = splitValueAndUnit('unit', size[0]) || this.defaultUnit
                        this.backgroundSize.heightUnit = splitValueAndUnit('unit', size[1]) || this.defaultUnit
                    }
                    if (this.value.backgroundPosition) {
                        const pos = this.value.backgroundPosition.split(' ')
                        this.backgroundPosition.x = splitValueAndUnit('value', pos[0])
                        this.backgroundPosition.y = splitValueAndUnit('value', pos[1])
                        this.backgroundPosition.xUnit = splitValueAndUnit('unit', pos[0]) || this.defaultUnit
                        this.backgroundPosition.yUnit = splitValueAndUnit('unit', pos[1]) || this.defaultUnit
                    }
                }
            },
            handleValueChange (key, value) {
                this.renderValueMap[key] = value
                const newValue = key === 'backgroundImage' && value ? `url(${value})` : value
                this.change(key, newValue)
            },
            handleConfigChange (key, value) {
                this.imageConfig[key] = value
                this.change(key, value)
            },
            handleBackgroundSizeChange (key, val) {
                this.backgroundSize[key] = val
                this.handleInputChange('backgroundSize')
            },
            handleBackgroundPositionChange (key, val) {
                this.backgroundPosition[key] = val
                this.handleInputChange('backgroundPosition')
            },
            handleInputChange (key) {
                let newValue
                if (key === 'backgroundSize' && this.backgroundSize.width && this.backgroundSize.height) {
                    newValue = `${this.backgroundSize.width}${this.backgroundSize.widthUnit} ${this.backgroundSize.height}${this.backgroundSize.heightUnit}`
                } else if (key === 'backgroundPosition' && (this.backgroundPosition.x || this.backgroundPosition.y)) {
                    const x = this.backgroundPosition.x ? `${this.backgroundPosition.x}${this.backgroundPosition.xUnit}` : '0'
                    const y = this.backgroundPosition.y ? `${this.backgroundPosition.y}${this.backgroundPosition.yUnit}` : 0
                    newValue = `${x} ${y}`
                } else {
                    newValue = ''
                }
                this.change(key, newValue)
            },
            // 清除image配置
            handleImageShowChange (value) {
                this.backgroundImageShow = value
                if (!this.backgroundImageShow) {
                    this.handleValueChange('backgroundImage', '')
                    this.handleConfigChange('backgroundRepeat', '')
                    this.handleConfigChange('backgroundAttachment', '')
                    this.backgroundSize = { width: '', height: '', unit: this.defaultUnit }
                    this.backgroundPosition = { x: '', y: '', unit: this.defaultUnit }
                    this.handleInputChange('backgroundSize', '')
                    this.handleInputChange('backgroundPosition', '')
                    return
                }
                this.handleValueChange('backgroundColor', '')
            },
            handleHasKey (key) {
                return this.renderValueMap.hasOwnProperty(key)
            }
        }
    }
</script>
