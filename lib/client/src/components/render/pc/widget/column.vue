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
    <draggable
        ref="draggable"
        :class="{
            [$style['column']]: true,
            [$style['render-grid-empty']]: renderGrid.isColumnEmpty,
            [$style['empty']]: componentData.children.length < 1
        }"
        :sort="true"
        :list="componentData.slot.default"
        :component-data="componentData"
        :group="{
            name: 'component',
            pull: true,
            put: [
                'layout',
                'component'
            ]
        }">
        <resolve-component
            v-for="slotComponentData in componentData.slot.default"
            ref="component"
            :key="slotComponentData.renderKey"
            :component-data="slotComponentData" />
    </draggable>
</template>
<script>
    import LC from '@/element-materials/core'
    import Draggable from '../components/draggable'
    import ResolveComponent from '../resolve-component'

    export default {
        name: 'render-col',
        components: {
            Draggable,
            ResolveComponent
        },
        inheritAttrs: false,
        inject: ['renderGrid'],
        props: {
            componentData: {
                type: Object,
                default: () => ({})
            }
        },
        computed: {
            defaultMargin () {
                return LC.platform === 'PC' ? '10px' : '20rpx'
            }
        },
        created () {
            const nodeCallback = (event) => {
                if (event.target.componentId === this.componentData.componentId) {
                    this.$forceUpdate()
                }
            }

            LC.addEventListener('appendChild', nodeCallback)
            LC.addEventListener('moveChild', nodeCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('appendChild', nodeCallback)
                LC.removeEventListener('moveChild', nodeCallback)
            })
        },
        methods: {
            
        }
    }
</script>
<style lang="postcss" module>
    .column{
        position: relative;
        width: 100% !important;
        height: 100% !important;
        
        &.render-grid-empty{
            min-height: 34px !important;
        }
    }
    .render-grid-empty{
        min-height: 64px !important;
    }
    .empty{
        background: #FAFBFD;
        &::before{
            content: "请拖入组件";
            position: absolute;
            top: 0;
            right: 0;
            bottom: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: 14px;
            color: #C4C6CC;
            pointer-events: all;
        }
    }
</style>
