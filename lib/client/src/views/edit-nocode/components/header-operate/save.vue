<template>
    <div
        v-bk-tooltips="{
        disabled: !tips,
        content: tips,
        placement: 'bottom'
    }">
        <bk-button
            theme="primary"
            :loading="isLoading"
            :disabled="disabled"
            @click="handleSubmit">
            {{ $t('保存') }}
        </bk-button>
    </div>
</template>

<script>
    import { mapGetters } from 'vuex'
    import html2canvas from 'html2canvas'
    import { checkAccuracy } from '@/components/flow-form-comp/form/util/index.js'

    import { bus } from '@/common/bus'
    export default {
        props: {
            custom: Boolean, // 是否需要自定义保存逻辑
            customLoading: Boolean,
            disabled: Boolean,
            tips: String
        },
        data () {
            return {
                loading: false,
                isLocked: false,
                item: {
                    icon: 'bk-drag-icon bk-drag-save',
                    text: window.i18n.t('保存'),
                    tips: this.tips,
                    func: this.handleSubmit
                }
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            ...mapGetters('drag', ['curTemplateData']),
            ...mapGetters('layout', ['pageLayout']),
            nocodeType () {
                return this.pageDetail.nocodeType || ''
            },
            projectId () {
                return this.$route.params.projectId
            },
            isLoading () {
                return this.customLoading || this.loading
            }
        },
        methods: {
            async handleSubmit () {
                if (this.disabled) {
                    return
                }
                if (this.custom) {
                    if (this.validateForm()) {
                        this.$emit('save', this.$store.state.nocode.formSetting.fieldsList)
                    }
                    return
                }
                if (this.nocodeType === 'FORM') {
                    this.saveFormList()
                } else if (['FORM_MANAGE', 'FLOW_MANAGE'].includes(this.nocodeType)) {
                    const content = []
                    content.push(JSON.stringify(this.$store.state.nocode.dataManage.pageConfig))
                    this.savePageContent(content)
                } else if (this.nocodeType === 'MARKDOWN') {
                    const content = {
                        content: this.$store.state.nocode.markdown.mdContent
                    }
                    this.savePageContent(JSON.stringify(content))
                }
                this.saveTemplate()
                // this.savePreviewImg()
            },
            // 保存表单
            async saveFormList () {
                if (!this.validateForm()) {
                    return
                }
                const formData = {
                    content: this.$store.state.nocode.formSetting.fieldsList,
                    formName: this.pageDetail.pageName,
                    tableName: this.pageDetail.pageCode,
                    projectId: this.projectId,
                    versionId: this.versionId
                }
                let action = 'updateForm'
                if (!this.pageDetail.formId) {
                    action = 'createForm'
                    Object.assign(formData, { pageId: this.pageDetail.id })
                } else {
                    Object.assign(formData, { id: this.pageDetail.formId })
                }
                try {
                    this.isLoading = true
                    // 修改form表，并且保存名称、生命周期、函数设置等
                    const [res] = await Promise.all([
                        this.$store.dispatch(`form/${action}`, formData),
                        this.$store.dispatch('page/update', {
                            data: {
                                pageData: {
                                    id: this.pageDetail.id,
                                    name: this.pageDetail.pageName,
                                    content: JSON.stringify([]),
                                    lifeCycle: JSON.stringify(this.pageDetail.lifeCycle || {}),
                                    styleSetting: JSON.stringify(this.pageDetail.styleSetting || {})
                                },
                                projectId: this.projectId,
                                versionId: this.versionId
                            }
                        })
                    ])
                    if (res && res.id) {
                        this.savePreviewImg()
                        this.$bkMessage({
                            theme: 'success',
                            message: window.i18n.t('保存成功，数据表结构变更成功')
                        })
                        if (action === 'createForm') {
                            this.$store.commit('page/setPageDetail', Object.assign({}, this.pageDetail, { formId: res.id }))
                            this.$store.dispatch('nocode/form/getFormList', { projectId: this.projectId, versionId: this.versionId })
                        }
                        bus.$emit('saveSuccess')
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            },
            // 保存页面content
            async savePageContent (content) {
                const pageData = {
                    id: this.pageDetail.id,
                    name: this.pageDetail.pageName,
                    content,
                    lifeCycle: JSON.stringify(this.pageDetail.lifeCycle || {}),
                    styleSetting: JSON.stringify(this.pageDetail.styleSetting || {})
                }
                try {
                    this.loading = true
                    const res = await this.$store.dispatch('page/update', {
                        data: {
                            pageData,
                            projectId: this.projectId,
                            versionId: this.versionId
                        }
                    })
                    if (res) {
                        this.savePreviewImg()
                        this.$bkMessage({
                            theme: 'success',
                            message: window.i18n.t('保存成功')
                        })
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            },
            // 校验表单配置
            validateForm () {
                if (this.$store.state.nocode.formSetting.fieldsList.length < 1) {
                    this.$bkMessage({
                        theme: 'error',
                        message: window.i18n.t('表单项不能为空')
                    })
                    return false
                }
                let message = ''
                this.$store.state.nocode.formSetting.fieldsList.some(field => {
                    if (!/^[a-zA-Z0-9_]*$/.test(field.key)) {
                        message = window.i18n.t('字段【{0}】唯一标识需要由字母、数字、下划线组成', [field.name])
                    } else if (field.key === 'title') {
                        message = window.i18n.t('字段【{0}】唯一标识title为系统内置字符，请修改后保存', [field.name])
                    } else if (field.show_type === 0) {
                        if (!('expressions' in field.show_conditions) || field.show_conditions.expressions.some(item => item.key === '' || item.condition === '' || item.value === '')) {
                            message = window.i18n.t('字段【{0}】需要配置隐藏条件', [field.name])
                        }
                    }
                    if (message) {
                        this.$bkMessage({
                            theme: 'error',
                            message
                        })
                        return true
                    }
                    if (this.checkAccuracy(field)) {
                        this.$bkMessage({
                            theme: 'error',
                            message: window.i18n.t('字段【{0}】未设置默认时间精度', [field.name])
                        })
                        return true
                    }
                })
                return message === ''
            },
            // 检查计算组件的默认精度值
            checkAccuracy (field) {
                const computConfigInfo = field.meta.compute_config_info
                if (computConfigInfo && computConfigInfo.type === 'dateTime' && computConfigInfo.dateTime.accuracyResult !== 'day' && !computConfigInfo.dateTime.defaultTime) {
                    return checkAccuracy(computConfigInfo.dateTime.startDate.value, computConfigInfo.dateTime.endDate.value)
                }
            },
            // 保存导航数据
            async saveTemplate () {
                const {
                    layoutType,
                    logo,
                    siteName,
                    theme,
                    themeConfig = {},
                    menuList = [],
                    topMenuList = [],
                    renderProps = {},
                    customMenuCon = []
                } = this.curTemplateData

                const templateData = layoutType === 'empty' ? {} : {
                    logo,
                    siteName,
                    theme,
                    themeConfig,
                    menuList,
                    topMenuList,
                    renderProps,
                    customMenuCon
                }
                layoutType !== 'empty' && this.$store.dispatch('layout/update', {
                    data: {
                        layoutData: { id: this.pageLayout?.layoutId, content: JSON.stringify(templateData) },
                        projectId: this.projectId,
                        versionId: this.versionId
                    }
                })
            },
            async savePreviewImg () {
                const targetArea = document.getElementById('lesscodeDrawContent')
                html2canvas(targetArea)
                    .then(async (canvas) => {
                        const imgData = canvas.toDataURL('image/png')
                        return this.$store.dispatch('page/update', {
                            data: {
                                projectId: this.projectId,
                                versionId: this.versionId,
                                pageData: {
                                    id: this.pageDetail.id,
                                    previewImg: imgData
                                }
                            }
                        })
                    })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .item.disabled {
        color: #c2c4c6;
        cursor: not-allowed;
    }
</style>
