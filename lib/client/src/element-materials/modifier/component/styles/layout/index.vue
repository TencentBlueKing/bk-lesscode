<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2025 Tencent. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <div class="modifier-style" :class="{ 'no-padding': isFolded, 'style-border': true }">
        <div class="style-group-box">
            <div @click="handleToggle" class="ui-group-name">
                <section class="group-name-left">
                    <span
                        class="label"
                        :class="{ 'tips-content': tips }"
                        v-bk-tooltips="{
                            width: 300,
                            interactive: false,
                            allowHtml: false,
                            disabled: !tips,
                            content: tips
                        }">
                        {{ title }}
                    </span>
                    <div class="operate-icon">
                        <slot name="header"></slot>
                    </div>
                </section>
                <i
                    class="bk-drag-icon bk-drag-arrow-down toggle-arrow"
                    :class="{
                        floded: isFolded
                    }" />
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
    .modifier-style.style-border{
        border-bottom: 1.25px solid #EAEBF0;
    }
    .modifier-style {
        display: flex;
        flex-direction: column;
        padding-bottom: 14px;
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
        .ui-group-name {
            height: 40px;
            font-size: 12px;
            color: #313238;
            font-weight: Bold;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 8px 0 12px;
            &:hover{
                cursor: pointer;
            }
            .toggle-arrow {
                display: block;
                line-height: 40px;
                font-size: 24px;
                color: #63656E;
                transition: all .1s linear;
                &.floded {
                    transform: rotate(-90deg);
                }
            }
            span {
                display: block;
                line-height: 40px;
            }
            .tips-content {
                border-bottom: 1px dashed #313238;
                line-height: 19px;
            }
            .group-name-left {
                display: flex;
                justify-content: center;
                align-items: center;
                position: relative;
            }
            .operate-icon {
                font-size: 0;
                margin-left: 5px;
                padding: 4px;
                color: #979BA5;
                border-radius: 2px;
                i {
                    font-size: 14px;
                }
                &:hover {
                    background-color: #F0F5FF;
                    color: #3a84ff;
                }
            }
        }
        .style-action {
            padding: 0 8px 0 12px;
        }
    }
</style>
