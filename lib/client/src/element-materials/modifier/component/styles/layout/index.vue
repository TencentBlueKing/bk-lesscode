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
    <div class="modifier-style" :class="{ 'no-padding': isFolded }">
        <div class="style-group-box">
            <div class="ui-group-name">
                <section @click="handleToggle" style="display: flex;align-items: center;">
                    <i
                        class="bk-drag-icon bk-drag-arrow-down toggle-arrow"
                        :class="{
                            floded: isFolded
                        }" />
                    <span
                        class="label"
                        :class="{ 'tips-content': tips }"
                        v-bk-tooltips="{
                            width: 300,
                            interactive: false,
                            allowHtml: true,
                            disabled: !tips,
                            content: tips
                        }">
                        {{ title }}
                    </span>
                </section>
                <div class="operate-icon">
                    <slot name="header" />
                </div>
            </div>
            <div class="style-action">
                <template v-if="!isFolded">
                    <slot />
                </template>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            title: {
                type: String,
                default: ''
            },
            iconShow: {
                type: Boolean,
                default: false
            },
            tips: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                isFolded: this.folded
            }
        },
        methods: {
            handleToggle () {
                this.isFolded = !this.isFolded
            },
            handleClick () {
                this.$emit('reset')
            }
        }
    }
</script>

<style lang='postcss'>
    .modifier-style.no-padding {
        padding-bottom: 0;
    }
    .modifier-style {
        display: flex;
        flex-direction: column;
        padding-bottom: 16px;
        .style-title {
            font-size: 12px;
            display: flex;
            align-items: center;
            height: 40px;
            line-height: 40px;
            font-weight: bold;
            color: #313238;

            .style-icon {
                height: 20px;
                cursor: pointer;
                font-size: 16px;
                line-height: 18px;
                margin-left: 10px;
            }
        }
    }
    .style-group-box {
        padding: 0 8px 0 12px;
        border-top: 1px solid #dde4eb;
        .ui-group-name {
            margin-left: -6px;
            height: 40px;
            font-size: 12px;
            color: #313238;
            font-weight: Bold;
            position: relative;
            display: flex;
            align-items: center;
            &:hover{
                cursor: pointer;
            }
            .toggle-arrow {
                position: absolute;
                display: block;
                line-height: 40px;
                top: 0;
                left: 0;
                font-size: 24px;
                color: #63656E;
                transition: all .1s linear;
                &.floded {
                    transform: rotate(-90deg);
                }
            }
            span {
                display: block;
                position: absolute;
                left: 24px;
                line-height: 40px;
            }
            .tips-content {
                border-bottom: 1px dashed #313238;
                line-height: 19px;
            }
            .operate-icon {
                position: absolute;
                right: 0px;
                padding: 4px;
                color: #979BA5;
                border-radius: 2px;
                font-size: 14px;
                &:hover {
                    background-color: #F0F5FF;
                    color: #3a84ff;
                }
            }
        }
    }
</style>
