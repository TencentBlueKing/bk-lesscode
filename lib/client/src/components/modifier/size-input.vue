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
    <div class="bk-form-control control-append-group" :class="isError ? 'king-input-modifier-style-error' : ''">
        <div class="bk-input-number">
            <input type="text"
                style="width: 100%"
                class="bk-form-input"
                @keydown="inputKeydownHandler($event)"
                v-model="renderValue"
                @input="handleChange" />
            <span class="input-number-option" v-if="showControls">
                <span class="number-option-item bk-icon icon-angle-up" @click="add"></span>
                <span class="number-option-item bk-icon icon-angle-down" @click="sub"></span>
            </span>
        </div>
        <div class="group-box group-append">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import { validateNaturalNumber, accAdd, accSub } from '@/common/util'

    export default {
        model: {
            event: 'change'
        },
        props: {
            value: {
                type: [String, Number],
                required: true
            },
            min: {
                type: [String, Number],
                default: 1
            },
            isNatural: {
                type: Boolean,
                default: true
            },
            showControls: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                isError: false,
                // 数字输入框中允许输入的键盘按钮的 keyCode 集合
                validKeyCodeList: [
                    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // 0-9
                    8, // backspace
                    // 189, // -
                    // 190, // .
                    38, 40, 37, 39, // up down left right
                    46, // del
                    9, // tab
                    96, 97, 98, 99, 100, 101, 102, 103, 104, 105, // 小键盘0-9
                    109, 110 // 小键盘 - .
                ],
                renderValue: 0
            }
        },
        watch: {
            value: {
                handler (v) {
                    this.renderValue = v
                },
                immediate: true
            }
        },
        methods: {
            handleChange () {
                const val = this.renderValue
                if (this.isNatural && !validateNaturalNumber(val)) {
                    this.isError = true
                    return
                }
                this.isError = false

                this.$emit('change', val)
            },

            /**
             * 数字文本框获 keydown 事件回调
             * input type=number 不支持 setSelectionRange
             *
             * @param {Object} e 事件对象
             */
            inputKeydownHandler (e) {
                const keyCode = e.keyCode
                // 键盘按下不允许的按钮
                if (this.validKeyCodeList.indexOf(keyCode) < 0) {
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
                this.renderValue = accAdd(this.renderValue, 1)
                this.handleChange()
            },

            sub () {
                if (parseFloat(this.renderValue) <= parseFloat(this.min)) {
                    return
                }
                this.renderValue = accSub(this.renderValue, 1)
                this.handleChange()
            }
        }
    }
</script>

<style scoped>
    
</style>
