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
    <style-layout :title="$t('文字')">
        <style-item :name="$t('字体')" v-if="handleHasKey('fontFamily')">
            <bk-select
                :value="renderValueMap.fontFamily"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('fontFamily', $event)"
                style="width: 100%;">
                <bk-option id="inherit" :name="$t('默认')" />
                <bk-option id="PingFang SC, sans-serif" :name="$t('苹方')" />
                <bk-option id="Microsoft Yahei, san-serif" :name="$t('微软雅黑')" />
                <bk-option id="Songti SC, sans-serif" :name="$t('宋体')" />
                <bk-option id="Arial, sans-serif" name="Arial" />
                <bk-option id="Helvetica, sans-serif" name="Helvetica" />
            </bk-select>
        </style-item>
        <style-item :name="$t('form_字号字重')" v-if="handleHasKey('fontSize') || handleHasKey('fontWeight')">
            <font-size-input :value="renderValueMap.fontSize" @change="handleFontWithUnitChange('fontSize', $event)" />
            <bk-select
                :value="renderValueMap.fontWeight"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('fontWeight', $event)"
                style="width: 96px;">
                <bk-option id="inherit" :name="$t('默认')" />
                <bk-option id="normal" name="normal" />
                <bk-option id="lighter" name="lighter" />
                <bk-option id="bolder" name="bolder" />
                <bk-option id="400" name="400" />
                <bk-option id="500" name="500" />
                <bk-option id="600" name="600" />
                <bk-option id="700" name="700" />
                <bk-option id="800" name="800" />
                <bk-option id="900" name="900" />
            </bk-select>
        </style-item>
        <style-item :name="$t('颜色')" v-if="handleHasKey('color')">
            <bk-color-picker
                :value="renderValueMap.color"
                style="width: 100%;"
                @change="handleFontChange('color', $event)" />
        </style-item>
        <style-item :name="$t('form_字体样式')" v-if="handleHasKey('fontStyle')">
            <bk-select
                :value="renderValueMap.fontStyle"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('fontStyle', $event)"
                style="width: 100%;">
                <bk-option id="normal" name="normal" v-bk-tooltips="getTooltipsConfig($t('普通'))" />
                <bk-option id="italic" name="italic" v-bk-tooltips="getTooltipsConfig($t('斜体'))" />
                <bk-option id="oblique" name="oblique" v-bk-tooltips="getTooltipsConfig($t('倾斜体'))" />
                <bk-option id="inherit" name="inherit" v-bk-tooltips="getTooltipsConfig($t('继承父元素'))" />
            </bk-select>
        </style-item>
        <style-item :name="$t('form_行高')" v-if="handleHasKey('lineHeight')">
            <size-input :value="renderValueMap.lineHeight" @change="handleInputChange('lineHeight', $event)">
                <append-select :value="unitMap.lineHeight" @change="handleSelectChange('lineHeight', $event)" />
            </size-input>
        </style-item>
        <style-item :name="$t('form_字符间距')" v-if="handleHasKey('letterSpacing')">
            <font-size-input
                :value="renderValueMap.letterSpacing"
                :placeholder="$t('请输入')"
                @change="handleFontWithUnitChange('letterSpacing', $event)"
                style="width: 100%" />
        </style-item>
        <style-item :name="$t('form_单词间距')" v-if="handleHasKey('wordSpacing')">
            <font-size-input
                :value="renderValueMap.wordSpacing"
                :placeholder="$t('请输入')"
                @change="handleFontWithUnitChange('wordSpacing', $event)"
                style="width: 100%" />
        </style-item>
        <style-item name="Text-align" :tips="$t('文本的水平对齐方式')" v-if="handleHasKey('textAlign')">
            <bk-select
                :value="renderValueMap.textAlign"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('textAlign', $event)"
                style="width: 100%;">
                <bk-option id="left" name="left" />
                <bk-option id="center" name="center" />
                <bk-option id="right" name="right" />
            </bk-select>
        </style-item>
        <style-item name="Text-decoration" :tips="$t('文本的修饰线')" v-if="handleHasKey('textDecoration')">
            <bk-select
                :value="renderValueMap.textDecoration"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('textDecoration', $event)"
                style="width: 100%;">
                <bk-option id="none" name="none" v-bk-tooltips="getTooltipsConfig($t('无修饰线'))" />
                <bk-option id="underline" name="underline" v-bk-tooltips="getTooltipsConfig($t('下划线'))" />
                <bk-option id="overline" name="overline" v-bk-tooltips="getTooltipsConfig($t('上划线'))" />
                <bk-option id="line-through" name="line-through" v-bk-tooltips="getTooltipsConfig($t('中划线'))" />
            </bk-select>
        </style-item>
        <style-item :name="$t('缩进')" v-if="handleHasKey('textIndent')">
            <size-input :value="renderValueMap.textIndent" @change="handleInputChange('textIndent', $event)">
                <append-select :value="unitMap.textIndent" @change="handleSelectChange('textIndent', $event)" />
            </size-input>
        </style-item>
        <style-item name="Text-overflow" :tips="$t('如何展示溢出文本')" v-if="handleHasKey('textOverflow')">
            <bk-select
                :value="renderValueMap.textOverflow"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('textOverflow', $event)"
                style="width: 100%;">
                <bk-option id="clip" name="clip" v-bk-tooltips="getTooltipsConfig($t('截断溢出文本'))" />
                <bk-option id="ellipsis" name="ellipsis" v-bk-tooltips="getTooltipsConfig($t('使用一个省略号来表示溢出文本'))" />
            </bk-select>
        </style-item>
        <style-item name="Word-break" :tips="$t('控制单词如何被拆分换行')" v-if="handleHasKey('wordBreak')">
            <bk-select
                :value="renderValueMap.wordBreak"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('wordBreak', $event)"
                style="width: 100%;">
                <bk-option id="normal" name="normal" v-bk-tooltips="getTooltipsConfig($t('默认的换行规则'))" />
                <bk-option id="break-all" name="break-all" v-bk-tooltips="getTooltipsConfig($t('对于 non-CJK (CJK 指中文/日文/韩文) 文本，可在任意字符间断行'))" />
                <bk-option id="keep-all" name="keep-all" v-bk-tooltips="getTooltipsConfig($t('CJK (CJK 指中文/日文/韩文) 文本不断行。Non-CJK 文本表现同 normal'))" />
            </bk-select>
        </style-item>
        <style-item name="Word-wrap" :tips="$t('控制长度超过一行的单词是否被拆分换行')" v-if="handleHasKey('wordWrap')">
            <bk-select
                :value="renderValueMap.wordWrap"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('wordWrap', $event)"
                style="width: 100%;">
                <bk-option id="normal" name="normal" v-bk-tooltips="getTooltipsConfig($t('不换行'))" />
                <bk-option id="break-word" name="break-word" v-bk-tooltips="getTooltipsConfig($t('长单词内部换行'))" />
            </bk-select>
        </style-item>
        <style-item name="White-space" :tips="$t('控制空白字符的显示')" v-if="handleHasKey('whiteSpace')">
            <bk-select
                :value="renderValueMap.whiteSpace"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('whiteSpace', $event)"
                style="width: 100%;">
                <bk-option id="normal" name="normal" v-bk-tooltips="getTooltipsConfig($t('连续的空白符会被合并，换行符会被当作空白符来处理'))" />
                <bk-option id="pre" name="pre" v-bk-tooltips="getTooltipsConfig($t('连续的空白符会被保留。在遇到换行符或者 br 元素时才会换行'))" />
                <bk-option id="nowrap" name="nowrap" v-bk-tooltips="getTooltipsConfig($t('和 normal 一样，连续的空白符会被合并。文本内的换行无效'))" />
                <bk-option id="pre-wrap" name="pre-wrap" v-bk-tooltips="getTooltipsConfig($t('连续的空白符会被保留。在遇到换行符或者 br 元素时会换行，且可以自动换行'))" />
                <bk-option id="pre-line" name="pre-line" v-bk-tooltips="getTooltipsConfig($t('连续的空白符会被合并。在遇到换行符或者 br 元素时会换行，且可以自动换行'))" />
                <bk-option id="inherit" name="inherit" v-bk-tooltips="getTooltipsConfig($t('继承父元素该属性'))" />
            </bk-select>
        </style-item>
        <style-item :name="$t('form_垂直对齐')" v-if="handleHasKey('verticalAlign')">
            <bk-select
                :value="renderValueMap.verticalAlign"
                font-size="medium"
                :clearable="false"
                @change="handleFontChange('verticalAlign', $event)"
                style="width: 100%;">
                <bk-option id="baseline" name="baseline" />
                <bk-option id="sub" name="sub" />
                <bk-option id="super" name="super" />
                <bk-option id="top" name="top" />
                <bk-option id="text-top" name="text-top" />
                <bk-option id="middle" name="middle" />
                <bk-option id="bottom" name="bottom" />
                <bk-option id="text-bottom" name="text-bottom" />
            </bk-select>
        </style-item>
    </style-layout>
</template>

<script>
    import StyleLayout from '../layout/index'
    import StyleItem from '../layout/item'
    import FontSizeInput from '@/components/modifier/font-size-input'
    import AppendSelect from '@/components/modifier/append-select'
    import SizeInput from '@/components/modifier/size-input'
    import { splitValueAndUnit } from '@/common/util'
    import { getCssProperties, getTooltipsConfig } from '../common/util'
    import defaultUnitMixin from '@/common/defaultUnit.mixin'

    export default {
        components: {
            StyleLayout,
            StyleItem,
            FontSizeInput,
            AppendSelect,
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
                valueMap: {
                    fontFamily: this.value.fontFamily || 'inherit',
                    fontSize: splitValueAndUnit('value', this.value.fontSize),
                    fontWeight: this.value.fontWeight || 'inherit',
                    color: this.value.color || '',
                    fontStyle: this.value.fontStyle || 'normal',
                    lineHeight: splitValueAndUnit('value', this.value.lineHeight),
                    letterSpacing: splitValueAndUnit('value', this.value.letterSpacing),
                    wordSpacing: splitValueAndUnit('value', this.value.wordSpacing),
                    textAlign: this.value.textAlign || 'left',
                    textDecoration: this.value.textDecoration || 'none',
                    textIndent: splitValueAndUnit('value', this.value.textIndent),
                    textOverflow: this.value.textOverflow || 'clip',
                    wordBreak: this.value.wordBreak || 'normal',
                    wordWrap: this.value.wordWrap || 'normal',
                    whiteSpace: this.value.whiteSpace || 'normal',
                    verticalAlign: this.value.verticalAlign || 'baseline'
                },
                unitMap: {
                    lineHeight: '',
                    textIndent: ''
                },
                renderValueMap: {}
            }
        },
        mounted () {
            this.handleInitValueMap()
            this.initData()
        },
        methods: {
            initData () {
                this.$set(this, 'unitMap', {
                    lineHeight: splitValueAndUnit('unit', this.value.lineHeight) || this.defaultUnit,
                    textIndent: splitValueAndUnit('unit', this.value.textIndent) || this.defaultUnit
                })
            },
            handleInitValueMap () {
                const result = getCssProperties(this.valueMap, this.include, this.exclude)
                if (result.hasOwnProperty('fontSize') || result.hasOwnProperty('fontWeight')) {
                    result['fontSize'] = this.valueMap['fontSize']
                    result['fontWeight'] = this.valueMap['fontWeight']
                }
                this.renderValueMap = result
            },
            handleFontChange (key, val) {
                this.renderValueMap[key] = val
                this.change(key, val)
            },
            handleFontWithUnitChange (key, val) {
                this.renderValueMap[key] = val
                const newVal = val === '' ? '' : val + this.defaultUnit
                this.change(key, newVal)
            },
            handleInputChange (key, val) {
                const newValue = val === '' ? '' : val + this.unitMap[key]
                this.change(key, newValue)
            },
            handleSelectChange (key, unit) {
                if (this.renderValueMap[key] !== '') {
                    this.change(key, this.renderValueMap[key] + unit)
                }
            },
            handleHasKey (key) {
                return this.renderValueMap.hasOwnProperty(key)
            },
            getTooltipsConfig
        }
    }
</script>
