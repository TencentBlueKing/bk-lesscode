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
    <div class="bk-form-control control-prepend-group control-append-group king-input-margin-style" :class="isError ? 'king-input-modifier-style-error' : ''">
        <div class="group-box group-prepend">
            <div class="common-input-slot-text" v-enStyle="'width:40px'">{{ name }}</div>
        </div>
        <div class="bk-input-number">
            <input type="text"
                maxlength="10"
                style="width: 100%"
                class="bk-form-input"
                @keydown="inputKeydownHandler($event)"
                v-model="renderValue"
                @input="handleInputChange" />
            <span class="input-number-option">
                <span class="number-option-item bk-icon icon-angle-up" @click="add"></span>
                <span class="number-option-item bk-icon icon-angle-down" @click="sub"></span>
            </span>
        </div>
        <div class="group-box group-append">
            <append-select :value="unit" :is-margin-style="true" @change="$emit('selectChange', $event)"></append-select>
        </div>
    </div>
</template>

<script>
    import AppendSelect from '@/components/modifier/append-select'
    import { validateNaturalNumber, validateRoundNumber, accAdd, accSub } from '@/common/util'

    export default {
        components: {
            AppendSelect
        },
        props: {
            name: {
                type: String,
                required: true
            },
            value: {
                type: [String, Number],
                required: true
            },
            unit: {
                type: String,
                required: true
            },
            disableNegative: {
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
                    189, // -
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
            handleInputChange () {
                const val = this.renderValue
                if (this.disableNegative) {
                    if (!validateNaturalNumber(val)) {
                        this.isError = true
                    } else {
                        this.isError = false
                        this.$emit('inputChange', val)
                    }
                } else {
                    if (!validateRoundNumber(val)) {
                        this.isError = true
                    } else {
                        this.isError = false
                        this.$emit('inputChange', val)
                    }
                }
            },

            /**
             * 数字文本框获 keydown 事件回调
             * input type=number 不支持 setSelectionRange
             *
             * @param {Object} e 事件对象
             */
            inputKeydownHandler (e) {
                const target = e.currentTarget
                const value = target.value
                const keyCode = e.keyCode
                // - 号
                if (e.keyCode === 189) {
                    if (value.trim()) {
                        // 只有开头位置能出现 - 号
                        if (document.getSelection().type !== 'Range') {
                            if (target.selectionEnd !== 0) {
                                e.stopPropagation()
                                e.preventDefault()
                                return false
                            }
                        }
                    }
                }

                // 键盘按下不允许的按钮
                if (this.validKeyCodeList.indexOf(keyCode) < 0
                    || (value.indexOf('-') >= 0 && keyCode === 189) // 已经有一个 - 了，本次又输入的是 -
                ) {
                    e.stopPropagation()
                    e.preventDefault()
                    return false
                }
            },

            add () {
                this.renderValue = accAdd(this.renderValue, 1)
                this.handleInputChange()
            },

            sub () {
                this.renderValue = accSub(this.renderValue, 1)
                this.handleInputChange()
            }
        }
    }
</script>

<style lang="postcss">
    .king-input-margin-style {
        width: 132px;
        margin-top: 10px;
        .bk-form-input {
            padding: 0 26px 0 6px;
        }
    }
</style>
