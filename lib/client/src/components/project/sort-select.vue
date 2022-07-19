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

<script lang="ts">
    import { computed, defineComponent } from '@vue/composition-api'

    export default defineComponent({
        props: {
            value: {
                type: String,
                default: 'default'
            }
        },
        setup (props, { emit }) {
            const selected = computed({
                get () {
                    return props.value
                },
                set (value) {
                    emit('change', value)
                }
            })

            return {
                selected
            }
        }
    })
</script>

<template>
    <bk-select
        class="sort-selector"
        prefix-icon="bk-icon icon-sort"
        :clearable="false"
        v-model="selected">
        <bk-option id="default" name="默认"></bk-option>
        <bk-option id="createTime" name="按创建时间"></bk-option>
        <bk-option id="updateTime" name="按更新时间"></bk-option>
    </bk-select>
</template>

<style lang="postcss" scoped>
    .sort-selector {
        width: 112px;
        border: none;
        background: #EAEBF0;
        margin-left: 8px;

        &.is-focus {
            box-shadow: unset;
        }

        ::v-deep {
            .bk-select-name {
                padding-right: 12px;
            }
        }
    }
</style>
