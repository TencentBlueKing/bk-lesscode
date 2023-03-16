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
    <div class="size-item" :class="{ 'king-input-modifier-style-error': isError, 'size-item-focus': isFocus }">
        <div class="input-prefix">
            <span v-if="item.font">{{item.font}}</span>
            <i v-else :class="`bk-drag-icon ${item.icon}`"></i>
        </div>
        <div>
            <bk-input type="number"
                style="width: 62px"
                class="style-size-input"
                :placeholder="item.name"
                v-model="renderValue"
                @focus="() => isFocus = true"
                @blur="() => isFocus = false"
                
                @input="handleChange" />
        </div>
        <div class="input-suffix">
            <slot></slot>
        </div>
    </div>
</template>

<script>
    import { validateNaturalNumber } from '@/common/util'
    import { mapGetters } from 'vuex'

    export default {
        model: {
            event: 'change'
        },
        props: {
            item: {
                type: Object,
                default: () => ({})
            },
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
            }
        },
        data () {
            return {
                isFocus: false,
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
        computed: {
            ...mapGetters('page', ['platform']),
            extCls () {
                return this.isMarginStyle ? 'king-select-append-input king-select-margin-style' : 'king-select-append-input'
            },
            unitList () {
                return this.platform === 'PC'
                    ? ['px', '%']
                    : ['rpx', '%', 'px']
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

            handleChangeUnit () {
                this.$emit('')
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
            }
        }
    }
</script>

<style lang="postcss">
    .size-item-focus {
        border-color: #3A84FF !important;
    }
    .size-item {
        display: flex;
        align-items: center;
        border: 1px solid #C4C6CC;
        border-radius: 2px;
        width: 126px;
        margin-top: 8px;
        .input-prefix {
            display: flex;
            width: 32px;
            justify-content: center;
            i {
                font-size: 20px;
            }
            span {
                font-size: 12px;
            }
        }
        .unit {
            display: flex;
            width: 32px;
            justify-content: center;
            i {
                font-size: 20px;
            }
            span {
                font-size: 12px;
            }
        }
    }
    .style-size-input {
        .bk-form-input {
            border: none;
            border-left: 1px solid #EAEBF0;
            border-radius: 0px;
            padding: 0 4px;
            &:focus {
                border-left: 1px solid #EAEBF0 !important;
            }
        }
        .input-number-option {
            display: none;
        }
    }
</style>
