<template>
    <section>
        <bk-dialog v-model="isShow"
            render-directive="if"
            :width="nocodeType ? 750 : 1080"
            ext-cls="new-page-from-template-dialog"
            :position="{ top: 80 }"
            :mask-close="false"
            :auto-close="false"
            @value-change="handleDialogToggle">
            <div slot="header">
                <div class="header">
                    <div class="dialog-title">
                        <span class="platform-icon">
                            <i v-if="platform === 'MOBILE'" class="bk-drag-icon bk-drag-mobilephone"> </i>
                            <i v-else class="bk-drag-icon bk-drag-pc"> </i>
                        </span>
                        <span class="main-title">{{pageTitle}}</span>
                    </div>
                    <div class="bk-button-group origin-type" v-if="!nocodeType">
                        <bk-button
                            :ext-cls="'type-button'"
                            @click="changeCreateFrom('EMPTY')"
                            :class="pageFrom !== 'TEMPLATE' ? 'is-selected' : ''">
                            新建空白页面
                        </bk-button>
                        <bk-button
                            :ext-cls="'type-button'"
                            @click="changeCreateFrom('TEMPLATE')"
                            :class="pageFrom === 'TEMPLATE' ? 'is-selected' : ''">
                            从模板新建
                        </bk-button>
                    </div>
                </div>
            </div>

            <page-from-template :platform="platform" :create-from-template="createFromTemplate" :template-change="changeTemplate" :nocode-type="nocodeType">
                <bk-form ref="templateForm" :label-width="150" :rules="formRules" :model="formData" form-type="vertical">
                    <bk-form-item label="当前已选模板" property="templateName" error-display-type="normal" v-if="createFromTemplate">
                        <bk-input readonly v-model.trim="selectTemplate.templateName"
                            placeholder="模板名称">
                        </bk-input>
                    </bk-form-item>
                    <bk-form-item label="页面名称" required property="pageName" error-display-type="normal">
                        <bk-input
                            maxlength="60"
                            v-model.trim="formData.pageName"
                            placeholder="请输入页面名称，60个字符以内">
                        </bk-input>
                    </bk-form-item>
                    <bk-form-item label="页面ID" required property="pageCode" error-display-type="normal">
                        <bk-input maxlength="60" v-model.trim="formData.pageCode"
                            :placeholder="pageCodePlaceholder">
                        </bk-input>
                    </bk-form-item>
                    <bk-form-item label="导航布局" error-display-type="normal">
                        <layout-thumb-list :toolkit="['select']" :list="showLayoutList" @change-checked="handleLayoutChecked" />
                        <bk-link theme="primary" class="jump-link" icon="bk-drag-icon bk-drag-jump-link" @click="handleCreateLayout">跳转新建</bk-link>
                    </bk-form-item>
                    <bk-form-item label="页面路由" required property="pageRoute"
                        error-display-type="normal">
                        <bk-input maxlength="60" v-model.trim="formData.pageRoute"
                            placeholder="由数字、字母、下划线、中划线(-)、冒号(:)或反斜杠(/)组成">
                            <template slot="prepend">
                                <div class="group-text">{{layoutRoutePath}}</div>
                            </template>
                        </bk-input>
                    </bk-form-item>
                    <bk-form-item
                        label="本页面添加到导航菜单"
                        v-if="showAddNavListSwitcher"
                        :label-width="170"
                        error-display-type="normal">
                        <bk-switcher
                            theme="primary"
                            :value="isAddNavList"
                            @change="(val) => isAddNavList = val" />
                    </bk-form-item>
                </bk-form>
            </page-from-template>

            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :loading="loading"
                    @click="handleConfirmClick">确定</bk-button>
                <bk-button @click="handleDialogCancel" :disabled="loading">取消</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { compile } from 'path-to-regexp'
    import LayoutThumbList from '@/components/project/layout-thumb-list'
    import pageFromTemplate from './page-from-template.vue'
    import { NOCODE_TYPE_MAP } from '@/common/constant'

    export default {
        name: 'page-from-template-dialog',
        components: {
            LayoutThumbList,
            pageFromTemplate
        },
        props: {
            platform: {
                type: String,
                default: 'PC'
            },
            nocodeType: {
                type: String,
                default: ''
            },
            // form和flow的数据管理页需要填写默认的pageCode和pageName，带上formId或flowId
            initPageData: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                isShow: false,
                loading: false,
                pageFrom: 'EMPTY',
                formData: {},
                formRules: {
                    pageName: [
                        {
                            required: true,
                            message: '必填项',
                            trigger: 'blur'
                        }
                    ],
                    pageCode: [
                        {
                            required: true,
                            message: '必填项',
                            trigger: 'blur'
                        },
                        {
                            regex: /^[a-z][a-z0-9]{0,60}$/,
                            message: '以小写字母开头，由小写字母与数字组成,少于60个字符',
                            trigger: 'blur'
                        }
                    ],
                    pageRoute: [
                        {
                            required: true,
                            message: '必填项',
                            trigger: 'blur'
                        },
                        {
                            validator: function (value) {
                                try {
                                    compile(value)
                                    if (!/^[\w-_:\/?]+$/.test(value)) {
                                        this.message = '由数字、字母、下划线、中划线(-)、冒号(:)或反斜杠(/)组成'
                                        return false
                                    } else if (/\/{2,}/.test(value)) {
                                        this.message = '请检查路径正确性'
                                        return false
                                    }
                                } catch (e) {
                                    this.message = '请检查路径正确性'
                                    return false
                                }
                                return true
                            },
                            trigger: 'blur'
                        }
                    ]
                },
                layoutList: [],
                selectedLayout: {},
                selectTemplate: {},
                isAddNavList: true
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            createFromTemplate () {
                return !this.nocodeType && this.pageFrom === 'TEMPLATE'
            },
            pageTitle () {
                const platformType = this.platform === 'MOBILE' ? 'Mobile' : 'PC'
                const pageType = NOCODE_TYPE_MAP.title[this.nocodeType] || '自定义页'
                return `新建${platformType}${pageType}面`
            },
            layoutRoutePath () {
                const { routePath } = this.selectedLayout
                if (routePath) {
                    return routePath.endsWith('/') ? routePath : `${routePath}/`
                }
                return ''
            },
            showLayoutList () {
                return this.layoutList.filter(layout => layout.layoutType === this.platform)
            },
            showAddNavListSwitcher () {
                return this.selectedLayout.type && !['empty', 'mobile-empty'].includes(this.selectedLayout.type)
            },
            pageCodePlaceholder () {
                return ['FORM', 'FLOW'].includes(this.nocodeType)
                    ? '页面ID将作为数据表表名，以小写字母开头，由小写字母与数字组成，创建后不可更改'
                    : '以小写字母开头，由小写字母与数字组成，创建后不可更改'
            }
        },
        methods: {
            changeCreateFrom (from = 'EMPTY') {
                this.pageFrom = from
            },
            changeTemplate (template = {}) {
                this.selectTemplate = template
            },
            async initData () {
                try {
                    const layoutList = await this.$store.dispatch('layout/getList', { projectId: this.projectId, versionId: this.versionId })
                    const noDefaultMobileLayout = layoutList.findIndex(item => item.layoutType === 'MOBILE' && item.isDefault === 1)
                    
                    layoutList.forEach(item => {
                        // 如果移动端没有默认模板(兼容旧数据),则将mobile-empty选为默认
                        if (noDefaultMobileLayout === -1 && item.layoutType === 'MOBILE') {
                            item.checked = item.type === 'mobile-empty'
                        } else {
                            item.checked = item.isDefault === 1
                        }
                        item.defaultName = item.showName || item.defaultName
                        // 不需要显示选中态标签
                        item.isDefault = false
                    })
                    this.layoutList = layoutList
                    this.selectedLayout = this.showLayoutList.find(item => item.checked) || this.showLayoutList[0]
                } catch (err) {
                    this.$bkMessage({
                        theme: 'error',
                        message: err.message || err
                    })
                }
            },
            handleConfirmClick () {
                if (['FLOW', 'FLOW_MANAGE'].includes(this.nocodeType)) {
                    this.$emit('save')
                } else {
                    this.save()
                }
            },
            async save () {
                try {
                    this.loading = true
                    await this.$refs.templateForm.validate()

                    let templateFormData = {}
                    if (this.createFromTemplate) {
                        const template = this.selectTemplate
                        if (!template?.id) {
                            this.$bkMessage({
                                theme: 'error',
                                message: '未选择模板'
                            })
                            return
                        }
                        const content = []
                        content.push(JSON.parse(template.content))
                        templateFormData = { previewImg: template.previewImg, content: JSON.stringify(content) }
                    }
                    
                    const formData = {
                        pageName: this.formData.pageName,
                        pageCode: this.formData.pageCode
                    }
                    const nameExist = await this.$store.dispatch('page/checkName', {
                        data: {
                            ...formData,
                            projectId: this.projectId,
                            versionId: this.versionId,
                            from: 'create'
                        }
                    })
                    if (nameExist) return
                    
                    const payload = {
                        data: {
                            pageData: Object.assign({}, this.formData, templateFormData),
                            projectId: this.projectId,
                            versionId: this.versionId,
                            formId: this.formId
                        }
                    }

                    const { id, routePath } = this.showLayoutList.find(layout => layout.checked)
                    payload.data.layout = { id, routePath }
                    if (this.showAddNavListSwitcher) {
                        payload.data.pageData.isAddNav = this.isAddNavList
                    }
                    const res = await this.$store.dispatch('page/create', payload)
                    if (res) {
                        if (!['FLOW', 'FLOW_MANAGE'].includes(this.nocodeType)) {
                            this.$bkMessage({
                                theme: 'success',
                                message: '新建页面成功'
                            })
                            const toPageRouteName = this.nocodeType ? 'editNocode' : 'new'
                            this.$router.push({
                                name: toPageRouteName,
                                params: {
                                    projectId: this.projectId,
                                    pageId: res
                                }
                            })
                        }
                    }
                    return res
                } catch (e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            },
            handleDialogCancel () {
                this.isShow = false
            },
            handleDialogToggle () {
                if (this.isShow) {
                    this.pageFrom = 'EMPTY'
                    this.formData = {
                        pageType: this.platform || 'PC',
                        pageName: '',
                        pageCode: '',
                        pageRoute: '',
                        nocodeType: this.nocodeType
                    }
                    if (['FORM_MANAGE', 'FLOW_MANAGE', 'FLOW'].includes(this.nocodeType)) {
                        Object.assign(this.formData, this.initPageData)
                    }
                    this.initData()
                }
            },
            handleLayoutChecked (layout) {
                this.showLayoutList.forEach(item => (item.checked = false))
                layout.checked = true
                this.selectedLayout = layout
            },
            handleCreateLayout () {
                this.$router.push({
                    name: 'layout',
                    params: {
                        projectId: this.projectId
                    }
                })
                setTimeout(() => {
                    this.isShow = false
                }, 160)
            }
        }
    }
</script>

<style lang="postcss">
    .new-page-from-template-dialog {
        .bk-dialog-tool{
            display: none;
        }
        .bk-dialog-header{
            padding: 0 24px;
            .header {
                .dialog-title {
                    text-align: left;
                    margin: 18px 0 14px;
                    .platform-icon {
                        font-size: 16px;
                        padding: 2px;
                        color: #979ba5;
                        border-radius: 2px;
                        background: #f0f1f5;
                    }
                    .main-title {
                        font-size: 20px;
                        color: #313238;
                    }
                }
                .origin-type {
                    margin-bottom: 10px;
                }
            }
            .type-button {
                width: 350px;
            }
        }
        .bk-dialog-body{
            padding: 0;
            /* height: 570px; */
            min-height: 400px;
            display:flex;
            font-size:12px;
        }

        .bk-dialog-footer {
            padding: 8px 24px;
        }
    }
</style>
