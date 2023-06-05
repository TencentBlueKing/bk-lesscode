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
    <style-layout :title="$t('透明度')">
        <style-item name="opacity">
            <div class="opacity-container" style="width: 100%;">
                <bk-slider ext-cls="border-radius-slider" :step="0.1" :max-value="1" v-model="opacityValue" @change="handleOpacityChange"></bk-slider>
                <div class="bk-input-number" style="width: 68px">
                    <input type="text"
                        class="bk-form-input"
                        :value="opacityValue"
                        @keydown="inputKeydownHandler($event)"
                        @input="handleInput" />
                    <span class="input-number-option">
                        <span class="number-option-item bk-icon icon-angle-up" @click="add"></span>
                        <span class="number-option-item bk-icon icon-angle-down" @click="sub"></span>
                    </span>
                </div>
            </div>
        </style-item>
    </style-layout>
</template>

<script>
    import { accAdd, accSub } from '@/common/util'

    import StyleLayout from '../layout/index'
    import StyleItem from '../layout/item'

    export default {
        components: {
            StyleLayout,
            StyleItem
        },
        props: {
            value: {
                type: Object,
                required: true
            },
            change: {
                type: Function,
                required: true
            }
        },
        data () {
            return {
                opacityValue: this.value.opacity || 1,
                // 数字输入框中允许输入的键盘按钮的 keyCode 集合
                validKeyCodeList: [
                    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // 0-9
                    8, // backspace
                    // 189, // -
                    190, // .
                    38, 40, 37, 39, // up down left right
                    46, // del
                    9, // tab
                    96, 97, 98, 99, 100, 101, 102, 103, 104, 105, // 小键盘0-9
                    109, 110 // 小键盘 - .
                ]
            }
        },
        methods: {
            handleInput (e) {
                const val = e.target.value || 1
                this.opacityValue = Number(val)
                this.handleOpacityChange()
            },
            handleOpacityChange () {
                const val = Number(this.opacityValue)
                this.change('opacity', val)
            },

            /**
             * 数字文本框获 keydown 事件回调
             * input type=number 不支持 setSelectionRange
             *
             * @param {Object} e 事件对象
             */
            inputKeydownHandler (e) {
                const keyCode = e.keyCode
                const target = e.currentTarget
                const value = target.value
                // 键盘按下不允许的按钮
                if (this.validKeyCodeList.indexOf(keyCode) < 0
                    || (value.indexOf('.') >= 0 && keyCode === 190) // 已经有一个小数点了，本次又输入的是小数点
                ) {
                    e.stopPropagation()
                    e.preventDefault()
                    return false
                }

                if (keyCode === 38) {
                    e.preventDefault()
                    this.add()
                } else if (keyCode === 40) {
                    e.preventDefault()
                    this.sub()
                }
            },

            add () {
                if (parseFloat(this.opacityValue) >= 1) {
                    return
                }
                this.opacityValue = Number(accAdd(this.opacityValue, 0.1))
                this.handleOpacityChange()
            },

            sub () {
                if (parseFloat(this.opacityValue) <= 0) {
                    return
                }
                this.opacityValue = Number(accSub(this.opacityValue, 0.1))
                this.handleOpacityChange()
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .opacity-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: 234px;
        height: 32px;
        .border-radius-slider {
            width: 92px;
            margin-right: 12px;
        }
    }
</style>
