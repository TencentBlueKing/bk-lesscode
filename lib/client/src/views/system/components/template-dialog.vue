<template>
    <section>
        <bk-dialog v-model="isShow"
            render-directive="if"
            theme="primary"
            width="1080"
            :mask-close="false"
            :auto-close="false"
            header-position="left"
            ext-cls="create-template-dialog"
            :close-icon="false"
            @value-change="handleDialogToggle">
            <div class="layout-form-info">
                <div style="margin-bottom: 24px;" >
                    <span class="title-style">
                        {{ $t('新建应用') }}
                        <i
                            class="bk-icon icon-info-circle"
                            style="font-size: 14px;"
                            v-bk-tooltips.top="{ content: $t('创建lesscode应用时，会同步在蓝鲸开发者中心创建应用的default模块'), maxWidth: 400 }">
                        </i>
                    </span>
                </div>
                <div class="project-form-container">
                    <project-form
                        ref="projectForm"
                        :type="createType"
                        :default-layout-list="defaultLayoutList"
                        :template-name="formData.templateName"
                        :propsFormData="{ framework: formData.framework }">
                    </project-form>
                </div>
            </div>
            <div class="layout-template">
                <div class="template-header">
                    <span class="title-style">
                        {{ $t('应用模板') }}
                    </span>
                        <bk-input
                        clearable
                        :placeholder="$t('请输入模板名称')"
                        :right-icon="'bk-icon icon-search'"
                        :ext-cls="'search-input'"
                        v-model="searchFilter"
                        @enter="handleSearchEnter"
                        @clear="handleSearchClear">
                    </bk-input>
                </div>
                
                <ul class="filter-links">
                    <li
                        v-for="link in filterLinks"
                        :key="link.id"
                        :class="['link-item', { 'active': filter === link.id }]"
                        @click="handleClickFilter(link.id)">
                        {{link.name}}
                    </li>
                </ul>
                <div class="template-container" v-bkloading="{ isLoading: pageLoading, opacity: 1 }">
                    <div class="template-container-wrapper" v-show="!pageLoading">
                        <div class="template-list" v-show="!pageLoading">
                            <li v-for="template in list" :key="template.id"
                                :class="['list-item', { checked: template.checked }]"
                                @click="handleClickItem(template)">
                                <div class="checkbox">
                                    <i class="bk-icon icon-check-1 checked-icon"></i>
                                </div>
                                <div class="layout-img">
                                    <page-preview-thumb :alt="$t('模板缩略预览')" :project-id="template.id" :img-src="template.templateImg" />
                                </div>
                                <div class="layout-name">
                                    <span class="template-name" :title="template.projectName">{{ template.projectName }}</span>
                                    <span class="template-preview" @click.stop.prevent="handlePreview(template.id)">{{ $t('预览') }}</span>
                                </div>
                                <frameworkTag class="frameworkTag-op" :framework="template.framework"></frameworkTag>
                            </li>
                        </div>
                        <div class="empty" v-show="!list.length">
                            <empty-status :type="emptyType" @clearSearch="handlerClearSearch"></empty-status>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :loading="loading"
                    @click="handleCreateConfirm">{{ $t('确定') }}</bk-button>
                <bk-button @click="handleDialogCancel" :disabled="loading">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    import ProjectForm from './project-form.vue'
    import PagePreviewThumb from '@/components/project/page-preview-thumb.vue'
    import { bus } from '@/common/bus'
    import { PROJECT_TEMPLATE_TYPE } from '@/common/constant'
    import frameworkTag from '@/components/framework-tag.vue'

    const defaultFormData = {
        templateName: '',
        framework: 'vue2',
        copyFrom: null
    }
    const projectTemplateType = [{ id: '', name: window.i18n.t('全部') }].concat(PROJECT_TEMPLATE_TYPE)

    export default {
        name: 'template-dialog',
        components: {
            ProjectForm,
            PagePreviewThumb,
            frameworkTag
        },
        data () {
            return {
                isShow: false,
                loading: false,
                formData: { ...defaultFormData },
                filterLinks: [...projectTemplateType],
                filter: '',
                searchFilter: '',
                templateList: [],
                list: [],
                pageLoading: false,
                defaultLayoutList: [],
                layoutFullList: []
            }
        },
        computed: {
            createType () {
                return this.formData.copyFrom ? 'templateProject' : 'newProject'
            },
            emptyType () {
                if (this.searchFilter.length > 0) {
                    return 'search'
                }
                return 'noData'
            }
        },
        watch: {
            searchFilter (val) {
                if (!val) {
                    this.handleSearchClear()
                }
            }
        },
        created () {
            this.getDefaultLayout()
        },
        methods: {
            async getTemplateList () {
                this.pageLoading = true
                try {
                    const params = { filter: 'official', officialType: this.filter }
                    const { projectList } = await this.$store.dispatch('project/query', { config: { params } })
                    this.templateList = projectList.map(function (item) {
                        item['checked'] = false
                        return item
                    })
                    this.handleSearchEnter()
                } catch (e) {
                    console.error(e)
                } finally {
                    this.pageLoading = false
                }
            },
            async handleCreateConfirm () {
                try {
                    // if (!this.formData.copyFrom) return
                    const data = this.$refs.projectForm?.formData || {}
                    
                    const isValidate = await this.$refs.projectForm?.validate()
                    
                    if (isValidate) {
                        this.loading = true
                        if (this.formData.copyFrom) {
                            data.copyFrom = this.formData.copyFrom
                        } else {
                            const layouts = this.layoutFullList.filter(layout => layout.checked || layout.type === 'mobile-empty').map(layout => {
                                return {
                                    layoutId: layout.id,
                                    routePath: layout.defaultPath,
                                    isDefault: layout.isDefault,
                                    showName: layout.defaultName,
                                    layoutCode: layout.defaultCode,
                                    content: layout.defaultContent,
                                    layoutType: layout.layoutType
                                }
                            })
                            data.layouts = layouts
                        }
                        
                        const projectId = await this.$store.dispatch('project/create', { data })

                        this.messageSuccess(window.i18n.t('应用创建成功'))
                        this.isShow = false

                        setTimeout(() => {
                            this.handleGotoPage(projectId)
                        }, 300)
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            },
            handleGotoPage (projectId) {
                bus.$emit('update-project-info')
                // 开发应用和页面管理时调用跳到@/views/project/page-manage
                this.$router.replace({
                    name: 'pageList',
                    params: {
                        projectId
                    }
                })
            },
            handleClickFilter (link) {
                this.filter = link
                this.getTemplateList()
            },
            handleClickItem (template) {
                template.checked = !template.checked
                this.list.map(function (item) {
                    if (item.id !== template.id && item.checked) {
                        item.checked = false
                    }
                    return item
                })
                if (!template.checked) {
                    this.formData.templateName = ''
                    this.formData.copyFrom = null
                    this.formData.framework = ''
                } else {
                    this.formData.templateName = template.projectName
                    this.formData.copyFrom = template.id
                    this.formData.framework = template.framework
                }
            },
            handlePreview (id) {
                this.$emit('preview', id)
            },
            handleSearchClear () {
                this.list.splice(0, this.list.length, ...this.templateList)
            },
            handleSearchEnter () {
                const checked = this.templateList.find(item => item.checked)
                if (checked) checked.checked = false
                this.list.splice(0, this.list.length, ...this.templateList.filter(item => {
                    return item.projectName.toUpperCase().includes(this.searchFilter.toUpperCase())
                }))
                this.handleReSelect()
            },
            handleReSelect () {
                if (this.formData.copyFrom) {
                    const template = this.list.find(item => item.id === this.formData.copyFrom)
                    if (template) {
                        template.checked = true
                    } else {
                        this.formData.templateName = ''
                        this.formData.copyFrom = null
                        this.formData.framework = ''
                    }
                }
            },
            handleDialogCancel () {
                this.isShow = false
            },
            handleDialogToggle () {
                if (this.isShow) {
                    this.filter = ''
                    this.searchFilter = ''
                    this.formData = { ...defaultFormData }
                    this.getTemplateList()
                }
            },
            handlerClearSearch (searchName) {
                this.searchFilter = searchName
            },
            async getDefaultLayout () {
                try {
                    const layoutList = await this.$store.dispatch('layout/getPlatformList')
                    layoutList.forEach(item => {
                        const isEmptyType = ['empty', 'mobile-empty'].includes(item.type)
                        item.isDefault = isEmptyType
                        item.checked = isEmptyType
                        item.disabled = isEmptyType
                    })
                    this.layoutFullList = layoutList
                    this.defaultLayoutList = this.layoutFullList.filter(item => item.type !== 'mobile-empty')
                } catch (e) {
                    console.error(e)
                }
            },
        }
    }
</script>

<style lang="postcss">
    @import "@/css/mixins/scroller";
    @import "@/css/mixins/ellipsis";

    .create-template-dialog{
        .bk-dialog {
            top: 10%;
        }
        .bk-dialog-tool{
            display: none;
        }
        .bk-dialog-body {
            padding: 0;
            height: 80vh;
            display: flex;
            font-size: 12px;

            .title-style {
                color: #313238;
                font-size: 20px;
            }

            .layout-template {
                width: 681px;
                height: 100%;
                opacity: 1;
                background: #ffffff;
                padding: 16px 24px 20px 16px;

                .template-header {
                    display: flex;
                    justify-content: space-between;
                    .search-input {
                        width: 300px;
                    }
                }

                .filter-links {
                    display: flex;
                    align-items: center;
                    margin-top: 24px;

                    .link-item {
                        padding: 4px 10px;
                        margin-right: 10px;
                        border-radius: 16px;
                        cursor: pointer;

                        &:hover {
                            background: #E1ECFF;
                        }

                        &.active {
                            background: #E1ECFF;
                            color: #3A84FF;
                        }
                    }
                }

                .template-container{
                    width: 100%;
                    height: calc(100% - 72px);
                    margin-top: 14px;

                    .template-container-wrapper{
                        /* width: calc(100% - 20px); */
                        height: 100%;
                        overflow-y: auto;
                        @mixin scroller #dcdee5 2px;

                        .empty{
                            margin-top: 100px;
                        }
                    }
                }

                .template-list{
                    width: 100%;
                    display: flex;
                    flex-wrap: wrap;

                    .list-item {
                        position: relative;
                        flex: none;
                        display: flex;
                        flex-direction: column;
                        width: 206px;
                        height: 160px;
                        background: #ffffff;
                        border-radius: 2px;
                        cursor: pointer;
                        border: 1px solid #dcdee5;
                        margin-right: 10px;
                        margin-bottom: 10px;

                        &:nth-of-type(3n) {
                            margin-right: 0;
                        }

                        &:hover {
                            border-color: #3a84ff;
                            .layout-name .template-preview{
                                display: block;
                            }
                        }

                        &.checked {
                            border-color: #3a84ff;
                            background: #e1ecff;
                            .checkbox {
                                display: block;
                            }
                            .layout-name .template-preview{
                                display: none;
                            }
                        }

                        .checkbox {
                            display: none;
                            position: absolute;
                            right: -1px;
                            bottom: -1px;
                            border-style: solid;
                            border-width: 0 0 30px 34px;
                            border-color: transparent transparent #3A84FF transparent;
                            .checked-icon {
                                position: absolute;
                                left: -20px;
                                top: 10px;
                                color: #fff;
                                font-size: 20px;
                            }
                        }

                        .layout-img {
                            width: 100%;
                            height: 128px;

                            &::before {
                                content: "";
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 128px;
                                /* background: rgba(0, 0, 0, 0.4); */
                            }

                            img {
                                width: 100%;
                                height: 100%;
                            }

                            .empty-preview-img {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 14px;
                                font-weight: 700;
                                color: #C4C6CC;
                                height: 100%;
                                background: #f0f1f5;
                                border-radius: 4px 4px 0px 0px;
                            }
                        }
                        .layout-name {
                            padding: 0 6px;
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            height: 32px;
                            width: 100%;

                            .template-name{
                                color: #63656e;
                                @mixin ellipsis 80%, block;
                            }

                            .template-preview {
                                display: none;
                                color: #3A84FF;
                            }
                        }
                        .frameworkTag-op{
                            position: absolute;
                            top: 10px;
                            right: 10px;
                        }
                    }
                }
            }

            .layout-form-info {
                position: relative;
                width: 399px;
                height: 100%;
                opacity: 1;
                background: #ffffff;
                border: 1px solid #dcdee5;
                padding: 16px 0 20px 24px;
                .project-form-container {
                    padding-right: 16px;
                    height: calc(100% - 54px);
                    overflow-y: auto;
                    @mixin scroller #dcdee5, 2px;
                }
            }
        }
    }
</style>
