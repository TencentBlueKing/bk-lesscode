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
    <div class="modifier-props-chart-color-container">
        <bk-select v-model="renderValue" @selected="handleChange">
            <bk-option v-for="colorSet in colorSets"
                :key="colorSet.name"
                :name="colorSet.name"
                :id="colorSet.name">
                <span class="chart-color-sets-wrapper">
                    <span class="chart-color-set-item"
                        :style="{ background: color }"
                        v-for="color in colorSet.list"
                        :key="color"
                    ></span>
                </span>
            </bk-option>
        </bk-select>
        <div class="chart-color-set-mask">
            <span class="chart-color-sets-wrapper">
                <span class="chart-color-set-item"
                    v-for="color in currentColorSetList"
                    :key="color"
                    :style="{ background: color }"
                ></span>
            </span>
        </div>
    </div>
</template>

<script>
    import { colorSets } from '@/common/chart-color-sets.js'
    export default {
        props: {
            defaultValue: {
                type: [String, Array],
                required: true
            },
            name: {
                type: String,
                required: true
            },
            type: {
                type: String,
                required: true
            },
            change: {
                type: Function,
                required: true
            }
        },
        data () {
            return {
                colorSets,
                isError: false,
                renderValue: this.defaultValue
            }
        },
        computed: {
            currentColorSetList () {
                const colorSet = this.colorSets.find(item => {
                    return item.name === this.renderValue
                })
                return colorSet?.list || []
            }
        },
        methods: {
            handleChange (val) {
                this.change(this.name, val, this.type)
            }
        }

    }
</script>

<style lang="postcss" scoped>
.modifier-props-chart-color-container {
    position: relative;
    .chart-color-set-mask {
        position: absolute;
        width: 242px;
        background: #fff;
        box-sizing: content-box;
        padding-left: 5px;
        left: 11px;
        top: 50%;
        transform: translateY(-50%);
        pointer-events: none;
    }
}
</style>

<style lang="postcss">
.chart-color-sets-wrapper {
    display: flex;
    justify-content: space-around;
    padding: 5px;
    .chart-color-set-item {
        display: inline-block;
        width: 18px;
        height: 18px;
        flex-shrink: 0;
        margin: 1px;
        border-radius: 2px;
    }
}
</style>
