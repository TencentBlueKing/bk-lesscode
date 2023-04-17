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
    <section>
        <span v-if="readOnly" class="style-size-unit-span">{{value}}</span>
        <!-- <bk-popover trigger="click" v-else>
            <div class="dropdown-trigger-text" slot="dropdown-trigger">
                <span class="style-size-unit">{{value}}</span>
            </div>
            <ul class="bk-dropdown-list bk-dropdown-list-unit" slot="dropdown-content">
                <template v-for="unit in unitList">
                    <li :key="unit"><a href="javascript:;" @click="$emit('change', unit, $event)">{{unit}}</a></li>
                </template>
            </ul>
        </bk-popover> -->
        <bk-dropdown-menu trigger="click" ext-cls="style-unit" v-else>
            <div class="dropdown-trigger-text" slot="dropdown-trigger">
                <span class="style-size-unit">{{value}}</span>
            </div>
            <ul class="bk-dropdown-list bk-dropdown-list-unit" slot="dropdown-content">
                <template v-for="unit in unitList">
                    <li :key="unit"><a href="javascript:;" @click="$emit('change', unit, $event)">{{unit}}</a></li>
                </template>
            </ul>
        </bk-dropdown-menu>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    export default {
        props: {
            value: {
                type: String,
                required: true
            },
            readOnly: {
                type: Boolean,
                default: false
            }
        },
        computed: {
            ...mapGetters('page', ['platform']),
            unitList () {
                return this.platform === 'PC'
                    ? ['px', '%']
                    : ['rpx', '%', 'px']
            }

        }
    }
</script>

<style lang="postcss">
    .style-unit .bk-dropdown-content {
        z-index: 1000;
    }
    .bk-dropdown-unit-list {
        z-index: 1000;
    }
    .dropdown-trigger-text {
        width: 22px;
        height: 16px;
        line-height: 16px;
        text-align: center;
        &:hover {
            background: #F0F1F5;
            border-radius: 2px;
        }
    }
    .style-size-unit-span {
        cursor: default;
        font-size: 12px;
    }
    .style-size-unit {
        cursor: pointer;
        
        &:hover {
            background: #F0F1F5;
            border-radius: 2px;
        }
    }
    
</style>
