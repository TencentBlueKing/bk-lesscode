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
    <help-doc-detail :select-doc="docNameParam" @pageSwitchMethod="pageSwitchMethod" />
</template>

<script>
    import HelpDocDetail from '@/components/help-doc-detail'
    export default {
        components: {
            HelpDocDetail
        },
        data () {
            return {
                docNameParam: 'intro'
            }
        },
        watch: {
            '$route': {
                handler (to, from) {
                    this.docNameParam = this.$route.params.docName
                },
                immediate: true
            }
        },
        methods: {
            pageSwitchMethod (docName) {
                this.$router.push({
                    path: `/help/${docName}`
                })
            }
        }
    }
</script>
