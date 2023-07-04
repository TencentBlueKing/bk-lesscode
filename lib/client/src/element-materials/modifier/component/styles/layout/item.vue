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

<template functional>
    <div class="style-item" :class="props.type === 'vertical' ? 'vertical-item' : 'horizontal-item'">
        <div
            class="item-label"
            v-bk-tooltips="{
                content: props.tips,
                disabled: !props.tips,
                placements: ['left-start'],
                boundary: 'window',
                maxWidth: 400
            }"
        >
            <span
                :class="{
                    'g-config-subline': props.tips
                }"
            >
                {{ props.name }}
            </span>
        </div>
        <div class="item-content">
            <slot />
        </div>
    </div>
</template>

<style lang='postcss'>
    .style-item {
        margin-top: 12px;
        &:first-child {
            margin-top: 4px;
        }
        .item-label {
            display: flex;
            align-items: center;
            font-size: 12px;
        }
        .item-content {
            display: flex;
            justify-content: space-between;
            align-items: center;
            
        }
    }
    .horizontal-item {
        display: flex;
        height: 32px;
        .item-label {
            width: 95px;
        }
        .item-content {
            width: 181px;
        }
    }
    .vertical-item {
        /* margin-bottom: 12px; */
        .item-label {
            margin-bottom: 6px;
            width: 100%;
        }
        .item-content {
            width: 100%;
        }
    }
</style>
