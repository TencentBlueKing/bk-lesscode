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
    <choose-function
        class="choose-event"
        default-variable-format="event"
        :format-include="['event', 'value', 'variable', 'expression']"
        :choosen-function="eventValue"
        :function-templates="eventConfig.functionTemplates || eventValue.eventTemplates"
        @change="handleChangeEvent"
        @clear="handleClearEvent"
    >
        <template v-slot:header>
            <h3 class="event-title">
                <span
                    class="label mr10"
                    v-bk-tooltips="{
                        content: eventConfig.tips,
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
                    v-bk-tooltips="{
                        content: '关闭后，该事件不生效',
                        boundary: 'window'
                    }"
                    :value="eventValue.enable === undefined || eventValue.enable"
                    @change="handleEnableEvent"
                ></bk-switcher>
            </h3>
            <i class="bk-icon icon-close-line panel-minus" @click="handleDeleteEvent"></i>
        </template>
    </choose-function>
</template>

<script>
    import ChooseFunction from '@/components/methods/choose-function/index.vue'

    export default {
        name: 'render-event',

        components: {
            ChooseFunction
        },

        props: {
            eventName: String,
            eventValue: Object,
            eventConfig: Object
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
        right: 10px;
        top: 10px;
        font-size: 12px;
        display: none;
    }
</style>
