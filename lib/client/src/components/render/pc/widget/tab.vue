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
    <div>
        <bk-tab
            ext-cls="render-widget-tab"
            :active.sync="componentData.prop.active"
            @tab-change="tabChange"
            v-bind="componentData.prop">
            <widget-tab-panel
                v-for="tabPanelItem in componentData.slot.default"
                :key="tabPanelItem.componentId + Math.random()"
                :component-data="tabPanelItem"
            >
            </widget-tab-panel>
        </bk-tab>
    </div>
</template>
<script>
    import LC from '@/element-materials/core'
    import WidgetTabPanel from './tab-panel'

    export default {
        name: 'widget-tab',
        components: {
            WidgetTabPanel
        },
        inheritAttrs: false,
        props: {
            componentData: {
                type: Object,
                required: true
            }
        },
        created () {
            const updateCallback = ({ target }) => {
                if (target.componentId === this.componentData.componentId) {
                    console.log('update tab', this.componentData.componentId)
                    this.$forceUpdate()
                }
            }

            LC.addEventListener('update', updateCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('update', updateCallback)
            })
        },
        methods: {
            tabChange (name) {
                this.componentData.setProp({
                    'active': LC.utils.genPropFormatValue({
                        format: 'value',
                        code: name,
                        renderValue: name,
                        modifiers: ['sync']
                    })
                })
            }
        }
    }
</script>
<style lang='postcss'>
    .render-widget-tab {
        pointer-events: all;
        .bk-tab-header {
            pointer-events: all;
            * {
                pointer-events: all;
            }
        }
    }
</style>
