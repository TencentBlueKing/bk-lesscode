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
    <style-layout :title="$t('边距')" :icon-show="true" @reset="handleReset">
        <i slot="header" class="bk-drag-icon bk-drag-undo-2" @click.stop="handleReset" v-bk-tooltips="{ content: $t('重置属性值') }"></i>
        <distance-container title="MARGIN" style="height: 140px;">
            <template v-slot:center>
                <section style="margin-left: 42px;margin-top: 10px;width: 190px;padding: 2px;background: #fff;">
                    <distance-container title="PADDING">
                        <template v-slot:center>
                            <div class="padding-blank-center">
                            </div>
                        </template>
                        <template v-for="item in paddingConfig">
                            <distance-item
                                :key="item.key"
                                :name="item.key"
                                :unit="item.unit"
                                :value="item.value"
                                :distance="item.distanceStyle"
                                @change="handleInputChange(item, $event)"
                            >
                                <size-unit :value="item.unit" @change="handleSelectChange(item, $event)" class="small-padding"></size-unit>
                            </distance-item>
                        </template>
                    </distance-container>
                </section>
            </template>
            <template v-for="item in marginConfig">
                <distance-item
                    :key="item.key"
                    :name="item.key"
                    :unit="item.unit"
                    :value="item.value"
                    :distance="item.distanceStyle"
                    @change="handleInputChange(item, $event)"
                >
                    <size-unit :value="item.unit" @change="handleSelectChange(item, $event)" class="small-padding"></size-unit>
                </distance-item>
            </template>
        </distance-container>
    </style-layout>
</template>

<script>
    import { mapGetters } from 'vuex'

    import StyleLayout from '../layout/index'
    import distanceContainer from '@/components/modifier/distance-container'
    import distanceItem from '@/components/modifier/distance-item'
    import sizeUnit from '@/components/modifier/size-unit'
    import { splitValueAndUnit } from '@/common/util'
    import defaultUnitMixin from '@/common/defaultUnit.mixin'

    export default {
        components: {
            StyleLayout,
            distanceContainer,
            distanceItem,
            sizeUnit
        },
        mixins: [defaultUnitMixin],
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
                marginConfig: [
                    {
                        key: 'marginTop',
                        value: '',
                        unit: 'px',
                        distanceStyle: 'distance-top'
                    },
                    {
                        key: 'marginLeft',
                        value: '',
                        unit: 'px',
                        distanceStyle: 'distance-left'
                    },
                    {
                        key: 'marginRight',
                        value: '',
                        unit: 'px',
                        distanceStyle: 'distance-right'
                    },
                    {
                        key: 'marginBottom',
                        value: '',
                        unit: 'px',
                        distanceStyle: 'distance-bottom'
                    }
                ],
                paddingConfig: [
                    {
                        key: 'paddingTop',
                        value: '',
                        unit: 'px',
                        distanceStyle: 'distance-top'
                    },
                    {
                        key: 'paddingLeft',
                        value: '',
                        unit: 'px',
                        distanceStyle: 'distance-left'
                    },
                    {
                        key: 'paddingRight',
                        value: '',
                        unit: 'px',
                        distanceStyle: 'distance-right'
                    },
                    {
                        key: 'paddingBottom',
                        value: '',
                        unit: 'px',
                        distanceStyle: 'distance-bottom'
                    }
                ]
            }
        },
        computed: {
            ...mapGetters('drag', ['curSelectedComponentData'])
        },
        created () {
            this.initData()
        },
        methods: {
            initData () {
                this.marginConfig.map(item => {
                    item.value = splitValueAndUnit('value', this.value[item.key])
                    item.unit = splitValueAndUnit('unit', this.value[item.key]) || this.defaultUnit
                })
                this.paddingConfig.map(item => {
                    item.value = splitValueAndUnit('value', this.value[item.key])
                    item.unit = splitValueAndUnit('unit', this.value[item.key]) || this.defaultUnit
                })
            },
            handleInputChange (item, val) {
                item.value = val
                const newValue = val === '' ? '' : val + item.unit

                // bk-divider 本身带有 margin 的 inline 样式，所以这里 important
                if (this.curSelectedComponentData.type === 'bk-divider') {
                    this.change(item.key, newValue + ' !important')
                } else {
                    this.change(item.key, newValue)
                }
            },
            handleSelectChange (item, unit) {
                if (item.value !== '') {
                    item.unit = unit
                    item.value = Math.min(item.value, unit === '%' ? 100 : item.value)
                    this.change(item.key, item.value + unit)
                    // bk-divider 本身带有 margin 的 inline 样式，所以这里 important
                    if (this.curSelectedComponentData.type === 'bk-divider') {
                        this.change(item.key, item.value + unit + ' !important')
                    } else {
                        this.change(item.key, item.value + unit)
                    }
                }
            },
            handleReset () {
                this.marginConfig.forEach(item => {
                    this.handleInputChange(item, '')
                    this.handleSelectChange(item, '')
                })
                this.paddingConfig.forEach(item => {
                    this.handleInputChange(item, '')
                    this.handleSelectChange(item, '')
                })
            }
        }
    }
</script>

<style lang="postcss">
    .margin-style-container {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .padding-blank-center {
        background-color: #fff;
        height: 24px;
        width: 96px;
        position: absolute;
        top: 50%;
        left: 50%;
        bottom: 50%;
        right: 50%;
        transform:translate(-50%,-50%);
    }
</style>
