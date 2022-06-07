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
    <div class="bk-form-control king-input-modifier-append-number-input control-append-group" :class="isError && 'king-input-modifier-style-error'">
        <div class="bk-input-number">
            <input type="text"
                class="bk-form-input"
                @keydown="inputKeydownHandler($event)"
                v-model="renderValue"
                @input="handleChange" />
            <span class="input-number-option" v-if="controls">
                <span class="number-option-item bk-icon icon-angle-up" @click="add"></span>
                <span class="number-option-item bk-icon icon-angle-down" @click="sub"></span>
            </span>
        </div>
        <div class="group-box group-append">
            <div class="common-input-slot-text" style="width: 24px;">px</div>
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
                type: [Number, String],
                required: true
            },
            controls: {
                type: Boolean,
                default: false
            },
            // 是否转化数据类型为数值
            format: {
                type: Boolean,
                default: false
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
                    9 // tab
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
                let val = this.renderValue
                if (!validateNaturalNumber(val)) {
                    this.isError = true
                    return
                }
                this.isError = false

                if (this.format) {
                    val = Number(val)
                }
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
                if (parseFloat(this.renderValue) <= 0) {
                    return
                }
                this.renderValue = accSub(this.renderValue, 1)
                this.handleChange()
            }
        }
    }
</script>

<style lang="postcss">
    .king-input-modifier-append-number-input {
        width: 64px;
        .bk-form-input {
            padding: 0 6px;
        }
    }
</style>
