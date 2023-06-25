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
    <style-layout :title="$t('字体')">
        <section style="display: flex; justify-content: space-between;flex-wrap: wrap;">
            <icon-size-input
                v-if="handleHasKey('fontFamily')"
                :value="renderValueMap.fontFamily"
                :item="iconSizeData.fontFamily"
                @change="handleFontChange('fontFamily', $event)">
            </icon-size-input>

            <template v-if="handleHasKey('fontSize') || handleHasKey('fontWeight')">
                <icon-size-input
                    :value="renderValueMap.fontSize"
                    :item="iconSizeData.fontSize"
                    @change="handleFontWithUnitChange('fontSize', $event)">
                </icon-size-input>
                <icon-size-input
                    :value="renderValueMap.fontWeight"
                    :item="iconSizeData.fontWeight"
                    @change="handleFontChange('fontWeight', $event)">
                </icon-size-input>
            </template>

            <bk-color-picker
                :value="renderValueMap.color"
                style="width: 126px;margin-top: 12px;"
                @change="handleFontChange('color', $event)" />

            <icon-size-input
                v-if="handleHasKey('lineHeight')"
                :value="renderValueMap.lineHeight"
                :item="iconSizeData.lineHeight"
                @change="handleInputChange('lineHeight', $event)">
                <size-unit
                    :value="unitMap.lineHeight"
                    @change="handleSelectChange('lineHeight', $event)" />
            </icon-size-input>

            <icon-size-input
                v-if="handleHasKey('letterSpacing')"
                :value="renderValueMap.letterSpacing"
                :item="iconSizeData.letterSpacing"
                @change="handleFontWithUnitChange('letterSpacing', $event)">
            </icon-size-input>

            <icon-size-input
                v-if="handleHasKey('textIndent')"
                :value="renderValueMap.textIndent"
                :item="iconSizeData.textIndent"
                @change="handleInputChange('textIndent', $event)">
                <size-unit
                    :value="unitMap.textIndent"
                    @change="handleSelectChange('textIndent', $event)" />
            </icon-size-input>

            <icon-size-input
                v-if="handleHasKey('wordSpacing')"
                :value="renderValueMap.wordSpacing"
                :item="iconSizeData.wordSpacing"
                @change="handleFontWithUnitChange('wordSpacing', $event)">
            </icon-size-input>
        </section>
        
        <style-item :name="$t('form_字体样式')" v-if="handleHasKey('fontStyle')" type="vertical">
            <select-tab style="width: 100%;" :tab-list="fontStyleList" :active-item="renderValueMap.fontStyle" :item-change="(val) => handleFontChange('fontStyle', val)" />
        </style-item>
        <style-item :name="$t('form_文本修饰')" tips="text-decoration" v-if="handleHasKey('textDecoration')" type="vertical">
            <select-tab style="width: 100%;" :tab-list="textDecorationList" :active-item="renderValueMap.textDecoration" :item-change="(val) => handleFontChange('textDecoration', val)" />
        </style-item>
        <style-item :name="$t('对齐方式')" tips="text-align" v-if="handleHasKey('textAlign')" type="vertical">
            <select-tab style="width: 100%;" :tab-list="fontAlignList" :active-item="renderValueMap.textAlign" :item-change="(val) => handleFontChange('textAlign', val)" />
        </style-item>

        <style-item name="text-overflow" :tips="$t('如何展示溢出文本')" v-if="handleHasKey('textOverflow')">
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
        <style-item name="word-break" :tips="$t('控制单词如何被拆分换行')" v-if="handleHasKey('wordBreak')">
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
        <style-item name="word-wrap" :tips="$t('控制长度超过一行的单词是否被拆分换行')" v-if="handleHasKey('wordWrap')">
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
        <style-item name="white-space" :tips="$t('控制空白字符的显示')" v-if="handleHasKey('whiteSpace')">
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
    import SelectTab from '@/components/ui/select-tab'
    import { splitValueAndUnit } from '@/common/util'
    import { getCssProperties, getTooltipsConfig } from '../common/util'
    import defaultUnitMixin from '@/common/defaultUnit.mixin'

    import IconSizeInput from '@/components/modifier/icon-size-input'
    import SizeUnit from '@/components/modifier/size-unit'

    export default {
        components: {
            StyleLayout,
            StyleItem,
            SelectTab,
            IconSizeInput,
            SizeUnit
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
                    // font
                    lineHeight: '',
                    textIndent: ''
                },
                renderValueMap: {},
                iconSizeData: {
                    fontFamily: {
                        type: 'select',
                        icon: 'bk-drag-ziti',
                        tips: window.i18n.t('style_字体'),
                        payload: {},
                        options: [
                            { id: 'inherit', name: window.i18n.t('默认') },
                            { id: 'Microsoft Yahei, san-serif', name: window.i18n.t('微软雅黑') },
                            { id: 'PingFang SC, sans-serif', name: window.i18n.t('苹方') },
                            { id: 'Heiti SC, san-serif', name: window.i18n.t('黑体') },
                            { id: 'Hiragino Sans GB san-serif', name: window.i18n.t('冬青黑体') },
                            { id: 'Noto Sans, san-serif', name: window.i18n.t('思源黑体') },
                            { id: 'Songti SC, sans-serif', name: window.i18n.t('宋体') },
                            { id: 'KaiTi, san-serif', name: window.i18n.t('楷体') },
                            { id: 'WenQuanYi Micro Hei, san-serif', name: window.i18n.t('文泉驿微米黑') },
                            { id: 'Arial, sans-serif', name: 'Arial' },
                            { id: 'Monospace, sans-serif', name: 'Monospace' },
                            { id: 'Apple Color Emoji san-serif', name: 'Apple Color Emoji' },
                            { id: 'Consolas san-serif', name: 'Consolas' },
                            { id: 'Helvetica, sans-serif', name: 'Helvetica' },
                            { id: 'Helvetica Neue san-serif', name: 'Helvetica Neue' },
                            { id: 'Noto Color Emoji san-serif', name: 'Noto Color Emoji' },
                            { id: 'Menlo san-serif', name: 'Menlo' },
                            { id: 'Roboto san-serif', name: 'Roboto' },
                            { id: 'Segoe UI san-serif', name: 'Segoe UI' },
                            { id: 'San Francisco san-serif', name: 'San Francisco' },
                            { id: 'Segoe UI Emoji san-serif', name: 'Segoe UI Emoji' },
                            { id: 'Tahoma san-serif', name: 'Tahoma' },
                            { id: 'Fira code san-serif', name: 'Fira code' }
                        ]
                    },
                    fontSize: {
                        icon: 'bk-drag-zitidaxiao',
                        tips: window.i18n.t('字号')
                    },
                    fontWeight: {
                        type: 'select',
                        icon: 'bk-drag-zizhong',
                        tips: window.i18n.t('字重'),
                        payload: {},
                        options: [
                            { id: 'inherit', name: window.i18n.t('默认') },
                            { id: 'normal', name: 'normal' },
                            { id: 'lighter', name: 'lighter' },
                            { id: 'bolder', name: 'bolder' },
                            { id: '400', name: '400' },
                            { id: '500', name: '500' },
                            { id: '600', name: '600' },
                            { id: '700', name: '700' },
                            { id: '800', name: '800' },
                            { id: '900', name: '900' }
                        ]
                    },
                    lineHeight: {
                        icon: 'bk-drag-xinggao',
                        tips: window.i18n.t('行高')
                    },
                    letterSpacing: {
                        icon: 'bk-drag-zijianju',
                        tips: window.i18n.t('字间距')
                    },
                    wordSpacing: {
                        icon: 'bk-drag-dancijianju',
                        tips: window.i18n.t('词间距')
                    },
                    textIndent: {
                        icon: 'bk-drag-suojin',
                        tips: window.i18n.t('style_缩进')
                    }
                },
                fontStyleList: [
                    {
                        id: 'normal',
                        icon: 'bk-drag-icon bk-drag-morenziti',
                        tips: window.i18n.t('默认（非斜体）')
                    },
                    {
                        id: 'italic',
                        icon: 'bk-drag-icon bk-drag-xieti',
                        tips: window.i18n.t('style_斜体')
                    }
                ],
                textDecorationList: [
                    {
                        id: 'none',
                        icon: 'bk-drag-icon bk-drag-zitiyangshi',
                        tips: window.i18n.t('无修饰线')
                    },
                    {
                        id: 'underline',
                        icon: 'bk-drag-icon bk-drag-xiahuaxian',
                        tips: window.i18n.t('下划线')
                    },
                    {
                        id: 'overline',
                        icon: 'bk-drag-icon bk-drag-shanghuaxian',
                        tips: window.i18n.t('上划线')
                    },
                    {
                        id: 'line-through',
                        icon: 'bk-drag-icon bk-drag-zhonghuaxian',
                        tips: window.i18n.t('中划线')
                    }
                ],
                fontAlignList: [
                    {
                        id: 'left',
                        icon: 'bk-drag-icon bk-drag-zuoduiqi-2',
                        tips: window.i18n.t('style_左对齐')
                    },
                    {
                        id: 'center',
                        icon: 'bk-drag-icon bk-drag-juzhongduiqi',
                        tips: window.i18n.t('style_居中对齐')
                    },
                    {
                        id: 'right',
                        icon: 'bk-drag-icon bk-drag-youduiqi-2',
                        tips: window.i18n.t('style_右对齐')
                    }
                ]
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
                this.unitMap[key] = unit
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
