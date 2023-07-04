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
    <div class="form-page-operate">
        <bk-button
            v-if="dataManagePages.length === 0"
            @click="handleCreateManagePage"
            style="margin-left: 8px"
        >
        {{ $t('生成表单数据管理页') }}
        </bk-button>
        <bk-popover
            v-else
            ext-cls="form-data-manage-pages-popover"
            placement="bottom-end"
            theme="light"
            width="300">
            <bk-button
                style="margin-left: 8px"
            >
                {{ $t('关联的数据管理页面（{0}）', [dataManagePages.length]) }}
            </bk-button>
            <div slot="content" class="manage-page-list">
                <div class="list-title">
                    {{ $t('已生成') }} <span style="font-weight: bold">{{ dataManagePages.length }}</span>
                        {{ $t('个数据管理页') }} </span>
                    <i
                        v-bk-tooltips="$t('继续添加')"
                        class="bk-drag-icon bk-drag-add-line create-page-icon"
                        @click="handleCreateManagePage">
                    </i>
                </div>
                <ul class="list-ul">
                    <li v-for="item in dataManagePages" :key="item.id">
                        <i class="bk-drag-icon bk-drag-page"></i>
                        <span class="name">{{item.pageName}}</span>
                        <i :title="$t('预览')" class="bk-icon icon-eye click-icon" @click="handlePreview(item)"></i>
                        <i :title="$t('编辑')" class="bk-drag-icon bk-drag-edit click-icon" style="font-size: 20px;" @click="handleEditPage(item)"></i>
                    </li>
                </ul>
            </div>
        </bk-popover>
        <create-page-dialog ref="createPageDialog" nocode-type="FORM_MANAGE" :init-page-data="initManagePageData" />
    </div>
</template>
<script>
    import { mapGetters, mapState } from 'vuex'
    import { getRouteFullPath } from 'shared/route'
    import CreatePageDialog from '@/components/project/create-page-dialog.vue'

    export default {
        name: 'FormPageOperate',
        components: {
            CreatePageDialog
        },
        data () {
            return {
                dataManagePages: []
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            ...mapState('route', ['layoutPageList']),
            projectId () {
                return parseInt(this.$route.params.projectId)
            },
            initManagePageData () {
                const { formId, pageCode, pageName } = this.pageDetail
                return {
                    formId,
                    pageCode: pageCode + 'manage',
                    pageName: pageName + window.i18n.t('表单数据管理页'),
                    content: JSON.stringify({ filters: [], tableConfig: ['createUser', 'createTime'] })
                }
            }
        },
        created () {
            if (this.pageDetail.formId) {
                this.getDataManagePages()
            }
        },
        methods: {
            async getDataManagePages () {
                const res = await this.$store.dispatch('nocode/form/getFormRelatedPages', { formId: this.pageDetail.formId, type: 'FORM_MANAGE' })
                this.dataManagePages = res.data
            },
            handleCreateManagePage () {
                if (this.pageDetail.formId) {
                    this.$refs.createPageDialog.isShow = true
                } else {
                    this.$bkMessage({
                        theme: 'warning',
                        message: window.i18n.t('请先保存表单页面再生成数据管理页')
                    })
                }
            },
            handlePreview (page) {
                const pageRoute = this.layoutPageList.find(({ pageId }) => pageId === Number(page.id))
                if (pageRoute) {
                    const fullPath = getRouteFullPath(pageRoute)
                    const routerUrl = `/preview/project/${this.projectId}${fullPath}?pageCode=${page.pageCode}`
                    window.open(routerUrl, '_blank')
                }
            },
            handleEditPage (page) {
                const route = this.$router.resolve({ name: 'editNocode', params: { projectId: this.projectId, pageId: page.id } })
                window.open(route.href, '_blank')
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .form-page-operate {
        display: flex;
        align-items: center;
        color: #7573e6;
        font-size: 12px;
    }
</style>
<style lang="postcss">
    .form-data-manage-pages-popover {
        .manage-page-list {
            font-size: 12px;
            color: #63656E;
            cursor: default;
            .list-title {
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 24px;
                .create-page-icon {
                    color: #979ba5;
                    cursor: pointer;
                    &:hover {
                        color: #3a84ff;
                    }
                }
            }
            .list-ul {
                li {
                    display: flex;
                    align-items: center;
                    padding-left: 10px;
                    height: 28px;
                    border-radius: 2px;
                    i {
                        margin-right: 6px;
                    }
                    .click-icon {
                        cursor: pointer;
                    }
                    .name {
                        display: inline-block;
                        width: 200px;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                    }
                    &:hover {
                        color: #3A84FF;
                        background: #E1ECFF;
                    }
                }
            }
        }
    }
</style>
