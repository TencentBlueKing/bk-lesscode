<template>
    <menu-item
        v-bkloading="{ isLoading }"
        :item="item"
        :class="{
            disabled: isLocked
        }" />
</template>

<script>
    import { mapGetters } from 'vuex'
    import MenuItem from '@/views/index/components/action-tool/components/menu-item'
    export default {
        components: {
            MenuItem
        },
        props: {
            custom: Boolean // 是否需要自定义保存逻辑
        },
        data () {
            return {
                isLoading: false,
                isLocked: false,
                item: {
                    icon: 'bk-drag-icon bk-drag-save',
                    text: '保存',
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
            }
        },
        methods: {
            async handleSubmit () {
                if (this.custom) {
                    if (this.validateForm()) {
                        this.$emit('save', this.$store.state.nocode.formSetting.fieldsList)
                    }
                    return
                }
                if (this.nocodeType === 'FORM') {
                    this.saveFormList()
                } else if (this.nocodeType === 'FORM_MANAGE') {
                    console.log('FORM_MANAGE')
                    this.saveFormManage()
                }
                this.saveTemplate()
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
                const res = await this.$store.dispatch(`form/${action}`, formData)
                if (res && res.id) {
                    this.$bkMessage({
                        theme: 'success',
                        message: '保存成功'
                    })
                    action === 'createForm' && this.$store.commit('page/setPageDetail', Object.assign({}, this.pageDetail, { formId: res.id }))
                }
                console.log(res, this.pageDetail)
            },
            // 保存表单管理页
            async saveFormManage () {
                const content = []
                content.push(JSON.stringify(this.$store.state.nocode.formSetting.tableFieldsConfig))
                const pageData = {
                    id: this.pageDetail.id,
                    content
                }
                try {
                    const res = await this.$store.dispatch('page/update', {
                        data: {
                            pageData,
                            projectId: this.projectId,
                            versionId: this.versionId
                        }
                    })
                    if (res) {
                        this.$bkMessage({
                            theme: 'success',
                            message: '新建单据管理页面成功'
                        })
                    }
                } catch (e) {
                    console.error(e)
                }
            },
            // 校验表单配置
            validateForm () {
                let result = true
                if (this.$store.state.nocode.formSetting.fieldsList.length < 1) {
                    result = false
                    this.$bkMessage({
                        theme: 'error',
                        message: '表单项不能为空'
                    })
                }
                return result
            },
            // 保存导航数据
            async saveTemplate () {
                const {
                    layoutType,
                    logo,
                    siteName,
                    theme,
                    menuList = [],
                    topMenuList = [],
                    renderProps = {}
                } = this.curTemplateData

                const templateData = layoutType === 'empty' ? {} : {
                    logo,
                    siteName,
                    theme,
                    menuList,
                    topMenuList,
                    renderProps
                }
                layoutType !== 'empty' && this.$store.dispatch('layout/update', {
                    data: {
                        layoutData: { id: this.pageLayout?.layoutId, content: JSON.stringify(templateData) },
                        projectId: this.projectId,
                        versionId: this.versionId
                    }
                })
            }
        }
    }
</script>
