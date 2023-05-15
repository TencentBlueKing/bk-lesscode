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
    <div class="more-action-wrapper">
        <form-page-operate v-if="pageDetail.nocodeType === 'FORM'"></form-page-operate>
        <data-manage-operate v-if="['FORM_MANAGE', 'FLOW_MANAGE'].includes(pageDetail.nocodeType)"></data-manage-operate>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import FormPageOperate from './form-page-operate'
    import DataManageOperate from './data-manage-operate'

    export default {
        name: 'MoreActions',
        components: {
            FormPageOperate,
            DataManageOperate
        },
        props: {
            type: String
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            projectId () {
                return parseInt(this.$route.params.projectId)
            },
            linkName () {
                if (this.type === 'FORM_MANAGE') {
                    return window.i18n.t('编辑表单【{0}】', [this.pageDetail.formName])
                } else if (this.type === 'FLOW_MANAGE') {
                    return window.i18n.t('编辑流程【{0}】', [this.pageDetail.flowName])
                }
                return ''
            },
            linkURL () {
                if (this.type === 'FORM_MANAGE') {
                    return {
                        name: 'editNocode',
                        params: {
                            projectId: this.projectId,
                            pageId: this.type === 'FORM_MANAGE' ? this.pageDetail.formId : this.pageDetail.flowId
                        }
                    }
                } else if (this.type === 'FLOW_MANAGE') {
                    return {
                        name: 'flowConfig',
                        params: {
                            projectId: this.projectId,
                            flowId: this.pageDetail.flowId
                        }
                    }
                }
                return { name: '' }
            }
        }
    }
</script>
