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
    <div class="size-item" :class="{ 'king-input-modifier-style-error': isError, 'size-item-focus': isFocus }"
        v-bk-tooltips="{ content: item.tips || item.name, disabled: !(item.tips || item.name) || !(item.font || item.icon), trigger: 'click' }">
        <div v-if="item.font || item.icon" class="input-prefix" :style="{ width: item.prefixWidth || '32px' }" @click.stop>
            <span v-if="item.font">{{item.font}}</span>
            <i v-if="item.icon" :class="`bk-drag-icon ${item.icon}`"></i>
        </div>
        <template v-if="item.type === 'select'">
            <bk-select v-model="renderValue" v-bind="item.payload" style="width: 94px" ext-cls="style-icon-select"
                @change="handleSelectChange"
                @toggle="toggleSelect"
            >
                <template v-for="option in item.options">
                    <bk-option :id="option.id" :key="option.id" :name="option.name" />
                </template>
            </bk-select>
        </template>
        <template v-else>
            <bk-input type="number"
                class="style-size-input"
                :placeholder="item.name"
                :show-controls="false"
                v-model="renderValue"
                @focus="() => isFocus = true"
                @blur="() => isFocus = false"
                
                @input="handleChange" />
            <div class="input-suffix" v-if="!item.noUnit" @click.stop>
                <slot>
                    <size-unit
                        read-only
                        :value="defaultUnit"
                    />
                </slot>
            </div>
        </template>
    </div>
</template>

<script>
    import SizeUnit from './size-unit'
    import { validateNaturalNumber } from '@/common/util'
    import defaultUnitMixin from '@/common/defaultUnit.mixin'

    export default {
        components: {
            SizeUnit
        },
        mixins: [defaultUnitMixin],
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
                this.$emit('change', Number(val))
            },

            handleSelectChange (val) {
                this.$emit('change', val)
            },
            toggleSelect (isShow) {
                this.isFocus = isShow
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
        margin-top: 12px;
        .input-prefix {
            cursor: default;
            color: #979BA5;
            display: flex;
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
    .style-icon-select {
        flex: 1;
        border: none;
        border-left: 1px solid #EAEBF0 !important;
    }
    .style-size-input {
        flex: 1;
        .bk-form-input {
            border: none;
            border-left: 1px solid #EAEBF0;
            border-radius: 0px;
            padding: 0 4px;
            &:focus {
                border-left: 1px solid #EAEBF0 !important;
            }
        }
    }
    .input-suffix {
        width: 26px;
    }
</style>
