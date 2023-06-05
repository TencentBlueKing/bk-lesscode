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
    <div class="modifier-border-detail-container">
        <div class="style-container details-box">
            <!-- <div class="detail-name">样式</div>
            <div class="detail-content">
                <bk-select :value="borderStyle" style="width: 100%;" @change="changeBorderStyle">
                    <bk-option v-for="option in borderStyleList" :key="option" :id="option" :name="option">
                        <template v-if="option === 'none'">none</template>
                        <div v-else class="modifier-border-style-option">
                            <span :style="{ 'border-top-style': option }"></span>
                        </div>
                    </bk-option>
                </bk-select>
            </div> -->
            <div class="size-item" style="width: 180px;">
                <div class="input-prefix" style="width: 44px;">
                    <span>{{ $t('样式') }}</span>
                </div>
                <bk-select :value="borderStyle" style="width: 100%;" class="style-icon-select" @change="changeBorderStyle">
                    <div slot="trigger">
                        <template v-if="borderStyle === 'none'">none</template>
                        <div v-else class="modifier-border-style-option" style="padding: 0 30px 0 10px">
                            <span :style="{ 'border-top-style': borderStyle }"></span>
                        </div>
                        <i class="bk-select-angle bk-icon icon-angle-down" />
                    </div>
                    <bk-option v-for="option in borderStyleList" :key="option" :id="option" :name="option">
                        <template v-if="option === 'none'">none</template>
                        <div v-else class="modifier-border-style-option">
                            <span :style="{ 'border-top-style': option }"></span>
                        </div>
                    </bk-option>
                </bk-select>
            </div>
        </div>
        <div class="width-container details-box">
            <icon-size-input style="width: 180px" :value="borderWidth" @change="$emit('borderWidthChange', $event)" :item="{ font: $t('宽度'), prefixWidth: '44px' }" />
        </div>
        <div class="color-container details-box">
            <bk-color-picker style="width: 100%;" :value="borderColor" @change="$emit('borderColorChange', $event)"></bk-color-picker>
        </div>
    </div>
</template>

<script>
    import IconSizeInput from './icon-size-input'

    export default {
        components: {
            IconSizeInput
        },
        props: {
            borderStyle: {
                type: String,
                require: true
            },
            borderWidth: {
                type: [String, Number],
                required: true
            },
            borderColor: {
                type: String,
                require: true
            }
        },
        data () {
            return {
                borderStyleList: ['none', 'solid', 'double', 'dotted', 'dashed', 'inset', 'outset', 'groove', 'ridge']
            }
        },
        methods: {
            changeBorderStyle (val) {
                this.$emit('borderStyleChange', val)
            }
        }
    }
</script>

<style lang="postcss">
    .modifier-border-detail-container {
        width: 181px;
        .details-box {
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 32px;
            &:not(:first-child) {
                margin-top: 12px;
            }
            .detail-name {
                width: 44px;
                line-height: 32px;
            }
            .detail-content {
                display: flex;
                justify-content: space-between;
                align-items: center;
                width: 128px;
            }
        }
        .size-item-focus {
            border-color: #3A84FF !important;
        }
        .size-item {
            display: flex;
            align-items: center;
            border: 1px solid #C4C6CC;
            border-radius: 2px;
            margin-top: 0px;
            .input-prefix {
                cursor: default;
                display: flex;
                justify-content: center;
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
    }
    .modifier-border-style-option {
        display: flex;
        justify-content: center;
        align-items: center;
        height: 32px;
        span {
            width: 100%;
            height: 4px;
            border-width: 4px;
            border-color: #c4c6cc;
        }
    }
</style>
