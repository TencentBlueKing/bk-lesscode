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
    <style-layout :title="$t('鼠标')">
        <style-item :name="'cursor'">
            <bk-select
                :value="cursorValue"
                font-size="medium"
                :clearable="false"
                @change="handleChange"
                style="width: 100%;">
                <div slot="trigger">
                    <div class="icon-content">
                        <i :class="iconMap[cursorValue]"></i>
                        {{cursorValue}}
                    </div>
                    <i class="bk-select-angle bk-icon icon-angle-down" />
                </div>
                <template v-for="item in Object.keys(iconMap)">
                    <bk-option :id="item" :name="item" :key="item">
                        <i :class="iconMap[item]" style="color: #000;margin-right: 6px;"></i>
                        <span>{{item}}</span>
                    </bk-option>
                </template>
            </bk-select>
        </style-item>
    </style-layout>
</template>

<script>
    import StyleLayout from '../layout/index'
    import StyleItem from '../layout/item'

    export default {
        components: {
            StyleLayout,
            StyleItem
        },
        props: {
            value: {
                type: Object,
                required: true
            },
            change: {
                type: Function,
                required: true
            }
        },
        data () {
            return {
                cursorValue: this.value.cursor || 'auto',
                iconMap: {
                    auto: 'bk-drag-icon bk-drag-auto',
                    default: 'bk-drag-icon bk-drag-shubiaozhizhen',
                    crosshair: 'bk-drag-icon bk-drag-crosshair',
                    pointer: 'bk-drag-icon bk-drag-pointer',
                    move: 'bk-drag-icon bk-drag-move',
                    text: 'bk-drag-icon bk-drag-text-3',
                    wait: 'bk-drag-icon bk-drag-wait',
                    help: 'bk-drag-icon bk-drag-help'
                }
            }
        },
        methods: {
            handleChange (val) {
                this.cursorValue = val
                this.change('cursor', val)
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .icon-content {
        margin-left: 8px;
        i {
            color: #000;
        }
    }
</style>
