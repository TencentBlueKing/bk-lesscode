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
    <section
        class="choose-event"
    >
        <h3 class="event-title">
            <span
                class="label mr10"
                v-bk-tooltips="{
                    content: $t(eventConfig.tips),
                    disabled: !eventConfig.tips,
                    placements: ['left-start'],
                    width: 200,
                    boundary: 'window'
                }"
            >
                {{ eventName }}
            </span>
            <bk-switcher
                size="small"
                theme="primary"
                v-bk-tooltips="{
                    content: $t('关闭后，该事件不生效'),
                    boundary: 'window'
                }"
                :value="eventValue.enable === undefined || eventValue.enable"
                @change="handleEnableEvent"
            ></bk-switcher>
        </h3>
        <i class="bk-icon icon-close-line panel-minus" @click="handleDeleteEvent"></i>
        <bk-radio-group
            class="g-prop-radio-group mb12"
            :value="eventValue.type || EVENT_TYPE.METHOD"
            @change="handleChangeEventType"
        >
            <bk-radio-button
                v-for="item in types"
                :key="item.id"
                :value="item.id"
                class="prop-radio"
            >
                {{ item.name }}
            </bk-radio-button>
        </bk-radio-group>
        <describe-function
            v-if="eventValue.type === EVENT_TYPE.ACTION"
            :event-value="eventValue"
            @change="handleChangeEvent"
        />
        <choose-function
            v-else
            default-variable-format="event"
            :format-include="['event', 'value', 'variable', 'expression']"
            :choosen-function="eventValue"
            :function-templates="eventConfig.functionTemplates || eventValue.eventTemplates"
            @change="handleChangeEvent"
            @clear="handleClearEvent"
        />
    </section>
</template>

<script>
    import ChooseFunction from '@/components/methods/choose-function/index.vue'
    import DescribeFunction from './describe-function/index.vue'
    import {
        EVENT_TYPE
    } from 'shared/function/constant'

    export default {
        name: 'render-event',

        components: {
            ChooseFunction,
            DescribeFunction
        },

        props: {
            eventName: String,
            eventValue: Object,
            eventConfig: Object
        },

        data () {
            return {
                EVENT_TYPE,
                types: [
                    {
                        id: EVENT_TYPE.METHOD,
                        name: this.$t('事件函数')
                    },
                    {
                        id: EVENT_TYPE.ACTION,
                        name: this.$t('事件行为描述')
                    }
                ]
            }
        },

        methods: {
            handleChangeEvent (eventValue) {
                this.$emit('update', {
                    [this.eventName]: {
                        ...this.eventValue,
                        ...eventValue
                    }
                })
            },

            handleChangeEventType (type) {
                this.$emit('update', {
                    [this.eventName]: {
                        ...this.eventValue,
                        type
                    }
                })
            },

            handleClearEvent () {
                this.$emit('update', {
                    [this.eventName]: {
                        ...this.eventValue,
                        methodCode: ''
                    }
                })
            },

            handleDeleteEvent () {
                this.$emit('minus', this.eventName)
            },

            handleEnableEvent (enable) {
                this.$emit('update', {
                    [this.eventName]: {
                        ...this.eventValue,
                        enable
                    }
                })
            }
        }
    }
</script>

<style lang='postcss' scoped>
    .event-title {
        margin: 4px 0 8px;
        height: 16px;
        line-height: 16px;
        font-size: 14px;
        font-weight: normal;
        color: #63656E;
        word-break: keep-all;
        padding: 0;
        .label {
            border-bottom: 1px dashed #979ba5;
            cursor: pointer;
        }
    }
    .choose-event {
        margin: 16px 10px 0;
        background: #f0f1f5;
        border-radius: 2px;
        padding: 8px;
        position: relative;
        &:hover {
            box-shadow: 0px 2px 4px 0px rgb(0 0 0 / 20%);
            .panel-minus {
                display: block;
            }
        }
    }
    .panel-minus {
        position: absolute;
        cursor: pointer;
        right: 6px;
        top: 6px;
        font-size: 12px;
        display: none;
    }
    .prop-radio {
        background-color: #fff;
    }
</style>
