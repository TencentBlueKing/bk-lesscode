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
    <router-link
        class="page-link"
        target="_blank"
        :to="route">
        {{ name }}
    </router-link>
</template>
<script>
    import { mapGetters } from 'vuex'

    export default {
        name: 'DataManageOperate',
        data () {
            return {
                name: '',
                route: {}
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            projectId () {
                return parseInt(this.$route.params.projectId)
            }
        },
        created () {
            if (this.pageDetail.nocodeType === 'FORM_MANAGE') {
                this.getFormPage()
            } else {
                this.name = window.i18n.t('编辑流程【{0}】', [this.pageDetail.flowName])
                this.route = {
                    name: 'flowConfig',
                    params: {
                        projectId: this.projectId,
                        flowId: this.pageDetail.flowId
                    }
                }
            }
        },
        methods: {
            // 获取表单数据管理页关联的表单页
            async getFormPage () {
                // console.log(this.pageDetail)
                const res = await this.$store.dispatch('nocode/form/getFormRelatedPages', {
                    formId: this.pageDetail.formId,
                    type: 'FORM'
                })
                if (res.data && res.data.length > 0) {
                    const { pageName, id } = res.data[0]
                    this.name = window.i18n.t('编辑表单【{0}】', [pageName])
                    this.route = {
                        name: 'editNocode',
                        params: {
                            projectId: this.projectId,
                            pageId: id
                        }
                    }
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .page-link {
        display: inline-block;
        max-width: 200px;
        line-height: 1;
        font-size: 12px;
        color: #3a84ff;
        white-space: nowrap;
        text-overflow: ellipsis;
        overflow: hidden;
    }
</style>
