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
        <div :class="$style['empty']" v-if="componentData.children.length < 1">{{$t('请拖入组件')}}</div>
        <draggable
            ref="draggable"
            :class="{
                [$style['column']]: true,
                [$style['render-grid-empty']]: renderGrid.isColumnEmpty
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
    </div>
    
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
                    setTimeout(() => {
                        this.autoType(event.child)
                    }, 20)
                }
            }

            LC.addEventListener('appendChild', nodeCallback)
            LC.addEventListener('moveChild', nodeCallback)
            LC.addEventListener('insertAfter', nodeCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('appendChild', nodeCallback)
                LC.removeEventListener('moveChild', nodeCallback)
                LC.removeEventListener('insertAfter', nodeCallback)
            })
        },
        methods: {
            /**
             * @desc 自动排版子组件
             */
            autoType (childNode) {
                if (this._isDestroyed) {
                    return
                }
                const {
                    top: boxTop,
                    left: boxLeft
                } = this.$refs.draggable.$el.getBoundingClientRect()
                const $childEl = childNode.$elm
                const {
                    top: componentTop,
                    left: componentLeft
                } = $childEl.getBoundingClientRect()
                const styles = {}
                if (componentTop > boxTop + 3) {
                    styles['marginTop'] = '8px'
                }
                if (componentLeft > boxLeft + 3) {
                    styles['marginLeft'] = '8px'
                }
                if (Object.keys(styles).length > 0) {
                    childNode.setStyle(styles)
                }
            }
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
</style>
