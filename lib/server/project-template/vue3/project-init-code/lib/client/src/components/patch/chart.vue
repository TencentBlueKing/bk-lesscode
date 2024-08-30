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
    <div :style="computedStyle" :options="options" :ref="uuid" autoresize></div>
</template>

<script>
    import * as echarts from 'echarts'
    import { uuid, debounce } from 'shared/util'

    export default {
        name: 'chart',
        props: {
            componentId: {
                type: String,
                default: ''
            },
            width: {
                type: [Number, String],
                default: ''
            },
            height: {
                type: [Number, String],
                default: ''
            },
            options: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                charInst: null,
                uuid: '',
                observer: null
            }
        },
        computed: {
            computedStyle () {
                const widthVal = this.width ? (typeof this.width === 'number' ? `${this.width}px` : this.width) : '100%'
                const widthStr = `width:${widthVal};`
                const heightVal = this.height ? (typeof this.height === 'number' ? `${this.height}px` : this.height) : '100%'
                const heightStr = `height:${heightVal};`
                
                return widthStr + heightStr
            }
        },
        watch: {
            options: {
                deep: true,
                handler (val) {
                    this.chartInst?.setOption(val, true)
                }
            }
        },
        created () {
            this.uuid = this.componentId || uuid()
        },
        mounted () {
            this.chartInst = echarts.init(this.$refs[this.uuid])
            this.chartInst.setOption(this.options)
            this.debounceResize = debounce(this.resizeChart, 500)
            this.observer = new ResizeObserver(this.debounceResize)
            this.observer.observe(this.$refs[this.uuid])
        },
        beforeDestroy () {
            this.observer.unobserve(this.$refs[this.uuid])
        },
        methods: {
            resizeChart () {
                this.chartInst?.resize()
            }
        }
    }
</script>

<style scoped>
    /* 不加 scoped 会被 vue-echarts 默认的 .echarts 样式覆盖 */
    .echarts {
        width: 100%;
        height: 100%;
    }
</style>
