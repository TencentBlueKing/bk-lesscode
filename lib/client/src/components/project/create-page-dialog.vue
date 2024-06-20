<template>
    <section>
        <bk-dialog v-model="isShow"
            render-directive="if"
            :width="nocodeType ? 750 : 1080"
            ext-cls="new-page-from-template-dialog"
            :position="{ top: 80 }"
            :mask-close="false"
            :auto-close="false"
            :close-icon="false"
            @value-change="handleDialogToggle">

            <page-from-template :platform="platform" :create-from-template="createFromTemplate" :template-change="changeTemplate" :nocode-type="nocodeType">
                <div class="dialog-title">
                    <span class="platform-icon">
                        <i v-if="platform === 'MOBILE'" class="bk-drag-icon bk-drag-mobilephone"> </i>
                        <i v-else class="bk-drag-icon bk-drag-pc"> </i>
                    </span>
                    <span class="main-title">{{pageTitle}}</span>
                </div>
                <bk-form ref="templateForm" :label-width="300" :rules="formRules" :model="formData" form-type="vertical" class="create-page-form new-ui-form">
                    <bk-form-item v-if="createFromTemplate" :label="$t('form_当前已选模板')" property="templateName"
                        error-display-type="normal" :desc="$t('如需模板请从右侧选择，不选则默认创建空白页面')">
                        <bk-input readonly v-model.trim="selectTemplate.templateName"
                            :placeholder="$t('如需模板请从右侧选择，不选则默认创建空白页面')">
                        </bk-input>
                    </bk-form-item>
                    <bk-form-item :label="$t('form_页面名称')" required property="pageName" error-display-type="normal">
                        <bk-input
                            id="pageName-input"
                            maxlength="60"
                            v-model.trim="formData.pageName"
                            :placeholder="$t('请输入页面名称，60个字符以内')">
                        </bk-input>
                    </bk-form-item>
                    <bk-form-item :label="$t('页面ID')" required property="pageCode" error-display-type="normal">
                        <bk-input
                            id="pageCode-input"
                            maxlength="60"
                            v-model.trim="formData.pageCode"
                            :placeholder="pageCodePlaceholder">
                        </bk-input>
                    </bk-form-item>
                    <bk-form-item error-display-type="normal">
                        <div style="display: flex; justify-content: space-between; height: 24px">
                            <label class="bk-label"><span class="bk-label-text">{{ $t('form_导航布局') }}</span></label>
                            <bk-link theme="primary" class="jump-link" icon="bk-drag-icon bk-drag-jump-link" @click="handleCreateLayout">{{ $t('跳转新建') }}</bk-link>
                        </div>
                        <div>
                            <layout-thumb-list
                                :toolkit="['select']"
                                :list="showLayoutList"
                                :from-project="!nocodeType"
                                @change-checked="handleLayoutChecked" />
                        </div>
                    </bk-form-item>
                    <bk-form-item :label="$t('form_页面路由')" required property="pageRoute"
                        style="margin-top: 14px"
                        error-display-type="normal">
                        <bk-input 
                            id="pageRoute-input"
                            maxlength="60"
                            v-model.trim="formData.pageRoute"
                            :placeholder="$t('由数字、字母、下划线、中划线(-)、冒号(:)或反斜杠(/)组成')">
                            <template slot="prepend">
                                <div class="group-text">{{layoutRoutePath}}</div>
                            </template>
                        </bk-input>
                    </bk-form-item>
                    <bk-form-item
                        :label="$t('form_本页面添加到导航菜单')"
                        v-if="showAddNavListSwitcher"
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
                    @click="handleConfirmClick">{{ $t('确定') }}</bk-button>
                <bk-button @click="handleDialogCancel" :disabled="loading">{{ $t('取消') }}</bk-button>
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
                formData: {},
                formRules: {
                    pageName: [
                        {
                            required: true,
                            message: this.$t('必填项'),
                            trigger: 'blur'
                        },
                        {
                            validator: this.checkName,
                            message: '该页面名称已存在',
                            trigger: 'blur'
                        }
                    ],
                    pageCode: [
                        {
                            required: true,
                            message: this.$t('必填项'),
                            trigger: 'blur'
                        },
                        {
                            regex: /^[a-z][a-z0-9]{0,60}$/,
                            message: this.$t('以小写字母开头，由小写字母与数字组成,少于60个字符'),
                            trigger: 'blur'
                        },
                        {
                            validator: this.checkName,
                            message: '该页面ID已存在',
                            trigger: 'blur'
                        }
                    ],
                    pageRoute: [
                        {
                            required: true,
                            message: this.$t('必填项'),
                            trigger: 'blur'
                        },
                        {
                            validator: function (value) {
                                try {
                                    compile(value)
                                    if (!/^[\w-_:\/?]+$/.test(value)) {
                                        this.message = this.$t('由数字、字母、下划线、中划线(-)、冒号(:)或反斜杠(/)组成')
                                        return false
                                    } else if (/\/{2,}/.test(value)) {
                                        this.message = this.$t('请检查路径正确性')
                                        return false
                                    }
                                } catch (e) {
                                    this.message = this.$t('请检查路径正确性')
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
                return !this.nocodeType
            },
            pageTitle () {
                const platformType = this.platform === 'MOBILE' ? 'Mobile' : 'PC'
                const pageType = NOCODE_TYPE_MAP.title[this.nocodeType] || this.$t('自定义页')
                return this.$t('新建{0}{1}面', [platformType, pageType])
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
                    ? this.$t('页面ID将作为数据表表名，以小写字母开头，由小写字母与数字组成，创建后不可更改')
                    : this.$t('以小写字母开头，由小写字母与数字组成，创建后不可更改')
            }
        },
        methods: {
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
                // 判断是不是流程页面或流程管理页面
                if (['FLOW', 'FLOW_MANAGE'].includes(this.nocodeType)) {
                    this.$emit('save')
                } else {
                    this.save()
                }
            },
            async checkName () {
                const nameExist = await this.$store.dispatch('page/checkName', {
                    data: {
                        pageName: this.formData.pageName,
                        pageCode: this.formData.pageCode,
                        projectId: this.projectId,
                        versionId: this.versionId,
                        from: 'create',
                        blurCheck: true
                    }
                })
                if (nameExist) {
                    return false
                } else {
                    return true
                }
            },
            async save () {
                try {
                    this.loading = true
                    await this.$refs.templateForm.validate()

                    let templateFormData = {}
                    const template = this.selectTemplate
                    if (template?.id) {
                        const content = []
                        content.push(JSON.parse(template.content))
                        templateFormData = { previewImg: template.previewImg, content: JSON.stringify(content) }
                    }
                    
                    const formData = {
                        pageName: this.formData.pageName,
                        pageCode: this.formData.pageCode
                    }
                    
                    const payload = {
                        data: {
                            pageData: Object.assign({}, this.formData, templateFormData),
                            projectId: this.projectId,
                            versionId: this.versionId,
                            formId: this.formId
                        }
                    }
                    // 查找为默认的布局
                    const { id, routePath } = this.showLayoutList.find(layout => layout.checked)
                    payload.data.layout = { id, routePath }
                    if (this.showAddNavListSwitcher) {
                        payload.data.pageData.isAddNav = this.isAddNavList
                    }
                    const res = await this.$store.dispatch('page/create', payload)
                    if (res) {
                        // 页面不是流程页面或流程管理页面
                        if (!['FLOW', 'FLOW_MANAGE'].includes(this.nocodeType)) {
                            this.$bkMessage({
                                theme: 'success',
                                message: this.$t('新建页面成功')
                            })
                            // 判断this.nocodeType有没有值
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
                    return { id: res, pageName: this.formData.pageName }
                } catch (e) {
                    console.error(e)
                    if (e?.field) {
                        const errorField = document.getElementById(`${e?.field}-input`)
                        errorField?.scrollIntoView({ behavior: 'smooth' })
                    }
                } finally {
                    this.loading = false
                }
            },
            handleDialogCancel () {
                this.isShow = false
            },
            handleDialogToggle () {
                if (this.isShow) {
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
                } else {
                    this.$emit('closeDialog')
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
    @import "@/css/mixins/scroller";
    
    .new-page-from-template-dialog {
        .bk-dialog-tool{
            display: none;
        }
        .dialog-title {
            display: flex;
            text-align: left;
            margin-bottom: 24px;
            .platform-icon {
                font-size: 16px;
                margin-right: 6px;
                padding: 2px 5px;
                color: #979ba5;
                border-radius: 2px;
                background: #f0f1f5;
            }
            .main-title {
                font-size: 20px;
                color: #313238;
            }
        }
        .bk-dialog-body{
            padding: 0;
            /* height: 570px; */
            min-height: 400px;
            display:flex;
            font-size:12px;
            .create-page-form {
                height: calc(100% - 72px);

                overflow-y: auto;
                @mixin scroller #dcdee5, 2px;
                padding-right: 16px;
            }
            .jump-link {
                i, .bk-link-text {
                    font-size: 12px;
                }
            }
        }

        .bk-dialog-footer {
            padding: 8px 24px;
        }
    }
</style>
