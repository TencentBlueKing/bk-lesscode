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
        <bk-select
            v-else
            :value="value"
            @change="changeUnit"
            ext-cls="style-unit"
            ext-popover-cls="style-unit-content"
        >
            <div slot="trigger" class="dropdown-trigger-text">
                <span class="style-size-unit">{{value}}</span>
            </div>
            <bk-option
                v-for="(unit, index) in unitList"
                :key="index"
                :id="unit"
                :name="unit">
            </bk-option>
        </bk-select>
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

        },
        methods: {
            changeUnit (val) {
                this.$emit('change', val)
            }
        }
    }
</script>

<style lang="postcss">
    .small-padding .style-size-unit {
        padding: 0;
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
        padding: 2px 3px;
        
        &:hover {
            background: #F0F1F5;
            border-radius: 2px;
        }
    }
    .style-unit {
        border: none;
        &.is-focus {
            box-shadow: none;
        }
    }
    .style-unit-content {
        font-size: 12px;
        width: 52px !important;
    }
</style>
