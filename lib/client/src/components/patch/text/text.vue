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
    <div class="bk-text-wrapper">
        <label :class="['bk-text', { 'has-desc': !!desc }, extCls]">
            <span v-if="desc" v-bk-tooltips="{ content: desc, allowHTML: false }">{{text}}</span>
            <span v-else>{{text}}</span>
        </label>
    </div>
</template>

<script>
    export default {
        name: 'bk-text',
        props: {
            text: {
                type: String,
                default: 'text'
            },
            desc: {
                type: String,
                default: ''
            },
            extCls: {
                type: String,
                default: ''
            }
        },
        methods: {
        }
    }
</script>
<style>
    @import './text.css';
</style>
