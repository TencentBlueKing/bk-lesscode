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
    <div :class="$style['h5-container']">
        <resolve-component
            v-for="slotComponentData in componentData.slot.default"
            :key="slotComponentData.renderKey"
            :component-data="slotComponentData" />
    </div>
</template>
<script>
    import ResolveComponent from '../resolve-component'

    export default {
        name: 'h5-container',
        components: {
            ResolveComponent
        },
        inheritAttrs: false,
        props: {
            componentData: {
                type: Object,
                default: () => ({})
            }
        },
        provide () {
            return {
                renderGrid: this
            }
        },
        data () {
            return {
                isColumnEmpty: true,
                isShowActiveBtn: false
            }
        }
    }
</script>
<style lang="postcss" module>
    .h5-container{
        position: relative;
        /* 如果基础的 slot 可以拖拽需要设置这个屏蔽掉基础组件上面的 pointer-events: none 效果 */
        pointer-events: all;
    }
</style>
