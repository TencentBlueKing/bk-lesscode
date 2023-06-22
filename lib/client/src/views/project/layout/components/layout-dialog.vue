<template>
    <section>
        <bk-dialog v-model="dialog.visible"
            render-directive="if"
            theme="primary"
            :title="title"
            width="750"
            :mask-close="false"
            :auto-close="false"
            header-position="left"
            ext-cls="layout-operate-dialog"
        >
            <bk-form ref="dialogForm" class="dialog-form" :label-width="200" form-type="vertical" :rules="dialog.formRules" :model="dialog.formData">
                <bk-form-item :label="$t('导航类型')" required property="showName" error-display-type="normal">
                    <bk-radio-group v-model="dialog.formData.layoutType">
                        <bk-radio-button value="PC" :disabled="action !== 'create' && dialog.formData.layoutType !== 'PC'">
                            PC
                        </bk-radio-button>
                        <bk-radio-button value="MOBILE" :disabled="action !== 'create' && dialog.formData.layoutType !== 'MOBILE'">
                            {{$t('移动端')}}
                        </bk-radio-button>
                    </bk-radio-group>
                </bk-form-item>
                <bk-form-item :label="$t('名称')" required property="showName" error-display-type="normal">
                    <bk-input ref="showNameInput"
                        maxlength="60"
                        v-model.trim="dialog.formData.showName"
                        :placeholder="$t('请输入名称，60个字符以内')">
                    </bk-input>
                </bk-form-item>
                <bk-form-item label="ID" required property="layoutCode" error-display-type="normal">
                    <bk-input maxlength="60" v-model.trim="dialog.formData.layoutCode"
                        :placeholder="$t('以小写字母开头，由字母与数字组成')">
                    </bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('路由')" required property="routePath" error-display-type="normal">
                    <bk-input maxlength="60" v-model.trim="dialog.formData.routePath"
                        :placeholder="$t('请输入，由数字、字母、下划线、中划线(-)、冒号(:)或反斜杠(/)组成')">
                        <template slot="prepend">
                            <div class="group-text">{{ routePrepend }}</div>
                        </template>
                    </bk-input>
                    <p style="line-height: 20px" class="mt5 mb0 f12" slot="tip">{{ $t('导航布局路由将会作为本应用一级路由，请谨慎命名') }}</p>
                </bk-form-item>
                <bk-form-item :label="$t('form_布局实例')" v-if="action === 'create'" error-display-type="normal">
                    <layout-thumb-list :toolkit="['select']" :list="filterLayoutList" @change-checked="handleLayoutChecked" />
                </bk-form-item>
            </bk-form>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    :disabled="disabled"
                    :loading="dialog.loading"
                    @click="handleDialogConfirm">{{ $t('确定') }}</bk-button>
                <bk-button @click="handleDialogCancel" :disabled="dialog.loading">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import { compile } from 'path-to-regexp'
    import LayoutThumbList from '@/components/project/layout-thumb-list'

    export default {
        components: {
            LayoutThumbList
        },
        props: {
            action: {
                type: String,
                default: ''
            },
            currentLayout: { // 编辑导航时，传入的当前所编辑的Layout对象
                type: Object,
                default: () => ({})
            },
            refreshList: {
                type: Function,
                default: () => {}
            }
        },
        data () {
            return {
                title: '',
                actionName: '',
                requestMethod: '',
                defaultLayoutList: [],
                dialog: {
                    visible: false,
                    loading: false,
                    formData: {
                        showName: '',
                        routePath: '',
                        layoutCode: '',
                        layoutType: 'PC'
                    },
                    formRules: {
                        showName: [
                            {
                                required: true,
                                message: window.i18n.t('必填项'),
                                trigger: 'blur'
                            }
                        ],
                        layoutCode: [
                            {
                                required: true,
                                message: window.i18n.t('必填项'),
                                trigger: 'blur'
                            },
                            {
                                regex: /^[a-z][a-zA-Z0-9]{0,60}$/,
                                message: window.i18n.t('以小写字母开头，由字母与数字组成'),
                                trigger: 'blur'
                            }
                        ],
                        routePath: [
                            {
                                required: true,
                                message: window.i18n.t('必填项'),
                                trigger: 'blur'
                            },
                            {
                                validator: function (value) {
                                    try {
                                        compile(value)
                                        if (!/^[\w-_:\/?]+$/.test(value)) {
                                            this.message = window.i18n.t('由数字、字母、下划线、中划线(-)、冒号(:)或反斜杠(/)组成')
                                            return false
                                        } else if (/\/{2,}/.test(value)) {
                                            this.message = window.i18n.t('请检查路径正确性')
                                            return false
                                        }
                                    } catch (e) {
                                        this.message = window.i18n.t('请检查路径正确性')
                                        return false
                                    }
                                    return true
                                },
                                trigger: 'blur'
                            }
                        ]
                    }
                }
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            routePrepend () {
                return this.selectedLayout?.layoutType === 'MOBILE' ? '/mobile/' : '/'
            },
            realRoutePath () {
                return this.routePrepend + this.dialog.formData.routePath.replace(/^\/+|\/+$/g, '')
            },
            disabled () {
                if (this.action === 'edit') {
                    return (this.dialog.formData.showName === this.currentLayout.showName || !this.dialog.formData.showName)
                        && (this.dialog.formData.layoutCode === this.currentLayout.layoutCode || !this.dialog.formData.layoutCode)
                        && (this.realRoutePath === this.currentLayout.routePath || !this.dialog.formData.routePath)
                }
                return !this.dialog.formData.showName || !this.dialog.formData.routePath
            },
            filterLayoutList () {
                let checkedSymbol = false
                const filterList = this.defaultLayoutList.filter(item => {
                    if (item.layoutType === this.dialog.formData.layoutType) {
                        item.checked = !checkedSymbol
                        checkedSymbol = true
                        return true
                    }
                    return false
                })
                return filterList
            },
            selectedLayout () {
                if (this.currentLayout.id) {
                    return this.currentLayout
                }
                return this.filterLayoutList.find(item => item.checked)
            }
        },
        watch: {
            'dialog.visible' (val) {
                if (val) {
                    // setTimeout(() => {
                    //     this.$refs.showNameInput && this.$refs.showNameInput.$el.querySelector('input').focus()
                    // }, 50)
                    if (this.action === 'edit') {
                        this.dialog.formData.showName = this.currentLayout.showName
                        this.dialog.formData.layoutCode = this.currentLayout.layoutCode
                        this.dialog.formData.routePath = this.getDisplayLayoutPath(this.currentLayout.routePath)
                        this.dialog.formData.layoutType = this.currentLayout.layoutType
                    } else {
                        this.dialog.formData.showName = ''
                        this.dialog.formData.layoutCode = ''
                        this.dialog.formData.routePath = ''
                        this.currentLayout.layoutType = ''
                    }
                    this.defaultLayoutList.forEach((item, index) => {
                        item.checked = index === 0
                    })
                }
            },
            action: {
                handler: function (val) {
                    this.title = val === 'create' ? window.i18n.t('新建导航布局') : window.i18n.t('编辑导航布局')
                    this.requestMethod = val === 'create' ? 'layout/create' : 'layout/update'
                    this.actionName = val === 'create' ? window.i18n.t('新建') : window.i18n.t('编辑')
                },
                immediate: true
            }
        },
        created () {
            this.getDefaultLayout()
        },
        methods: {
            getDisplayLayoutPath (path) {
                return this.currentLayout.layoutType === 'MOBILE' && path.includes('/mobile/') ? path.replace('/mobile', '') : path
            },
            async getDefaultLayout () {
                try {
                    const res = await this.$store.dispatch('layout/getPlatformList')
                    const layoutList = res.filter(item => !['empty', 'mobile-empty'].includes(item.type))
                    layoutList.forEach((item, index) => {
                        item.checked = index === 0
                    })
                    this.defaultLayoutList = layoutList
                } catch (e) {
                    console.error(e)
                }
            },
            async handleDialogConfirm () {
                this.dialog.loading = true
                try {
                    await this.$refs.dialogForm.validate()
 
                    const formData = {
                        showName: this.dialog.formData.showName,
                        layoutCode: this.dialog.formData.layoutCode,
                        routePath: this.realRoutePath
                    }

                    if (this.action === 'create') {
                        const layoutChecked = this.filterLayoutList.find(layout => layout.checked)
                        formData.layoutId = layoutChecked.id
                        formData.content = layoutChecked.defaultContent
                        formData.layoutType = layoutChecked.layoutType
                    }
                    if (this.action === 'edit') {
                        formData.id = this.currentLayout.id
                        formData.layoutType = this.currentLayout.layoutType
                        if (formData.showName === this.currentLayout.showName) {
                            delete formData.showName
                        }
                        if (formData.layoutCode === this.currentLayout.layoutCode) {
                            delete formData.layoutCode
                        }
                        if (formData.routePath === this.currentLayout.routePath) {
                            delete formData.layoutType
                            delete formData.routePath
                        }
                    }
                    await this.$store.dispatch('layout/checkName', {
                        data: {
                            ...formData,
                            projectId: this.projectId,
                            versionId: this.versionId
                        }
                    })

                    const res = await this.$store.dispatch(this.requestMethod, {
                        data: {
                            layoutData: formData,
                            projectId: this.projectId,
                            versionId: this.versionId
                        }
                    })
                    if (res) {
                        this.$bkMessage({
                            theme: 'success',
                            message: window.i18n.t('{0}成功', [this.actionName])
                        })
                        this.dialog.visible = false
                        this.refreshList()
                    }
                } catch (err) {
                    console.error(err)
                } finally {
                    this.dialog.loading = false
                }
            },
            handleDialogCancel () {
                this.dialog.visible = false
                this.dialog.formData.showName = ''
                this.dialog.formData.routePath = ''
            },
            handleLayoutChecked (layout) {
                this.defaultLayoutList.forEach(item => (item.checked = false))
                layout.checked = true
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

   .dialog-form {
        margin-bottom: 30px;
        max-height: 446px;
        overflow-y: overlay;
        padding: 0 16px;
        @mixin scroller;
   }
</style>
<style lang="postcss">
    .layout-operate-dialog {
        .bk-dialog-body {
            padding: 3px 6px 26px;
        }
        .bk-dialog-header {
            padding-bottom: 10px;
        }
    }
</style>
