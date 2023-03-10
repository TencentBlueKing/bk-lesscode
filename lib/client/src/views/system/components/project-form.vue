<template>
    <bk-form ref="infoForm" :label-width="type === 'newProject' ? 86 : 120" :rules="formRules" :model="formData" :form-type="formType">
        <bk-form-item v-if="type === 'templateProject'" label="当前已选模板">
            <bk-input readonly v-model.trim="templateName"
                placeholder="请先选择模板">
            </bk-input>
        </bk-form-item>
        <bk-form-item v-if="type === 'importProject'" label="应用JSON文件" required error-display-type="normal">
            <bk-upload
                with-credentials
                :multiple="false"
                :url="uploadUrl"
                :limit="1"
                accept=".json"
                desc="应用JSON可通过“导出”已有应用获得"
                @on-success="handleUploadSuccess"
                @on-error="handleUploadReset"
                @on-delete="handleUploadReset"
            ></bk-upload>
        </bk-form-item>
        <bk-form-item label="应用名称" required property="projectName" error-display-type="normal">
            <bk-input maxlength="60" v-model.trim="formData.projectName"
                placeholder="由汉字，英文字母，数字组成，20个字符以内">
            </bk-input>
        </bk-form-item>
        <bk-form-item label="应用ID" required property="projectCode" error-display-type="normal">
            <bk-input maxlength="60" v-model.trim="formData.projectCode"
                placeholder="由小写字母组成，长度小于16个字符，该ID将作为自定义组件前缀，创建后不可更改">
            </bk-input>
        </bk-form-item>
        <bk-form-item label="应用简介" required property="projectDesc" error-display-type="normal">
            <bk-input
                v-model.trim="formData.projectDesc"
                :type="'textarea'"
                :rows="3"
                :maxlength="100">
            </bk-input>
        </bk-form-item>
        <bk-form-item label="导航布局" style="margin-top: 10px" v-if="type === 'newProject'" error-display-type="normal">
            <span class="layout-desc">可多选，作为创建应用页面时可供选择的导航布局，便于在应用中统一配置导航</span>
            <layout-thumb-list :list="formLayoutList" @change-checked="handleLayoutChecked" @set-default="handleLayoutDefault" />
        </bk-form-item>
    </bk-form>
</template>

<script>
    import LayoutThumbList from '@/components/project/layout-thumb-list'
    
    const defaultFormData = {
        projectCode: '',
        projectName: '',
        projectDesc: ''
    }

    export default {
        components: {
            LayoutThumbList
        },
        props: {
            type: {
                type: String,
                required: true
            },
            templateName: {
                type: String,
                default: ''
            },
            propsFormData: {
                type: Object,
                default: () => ({})
            },
            defaultLayoutList: {
                type: Array,
                default: () => ([])
            }
        },
        data () {
            return {
                formData: {},
                formRules: {
                    projectName: [
                        {
                            regex: /^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$/,
                            message: '由汉字，英文字母，数字组成，20个字符以内',
                            trigger: 'blur'
                        }
                    ],
                    projectCode: [
                        {
                            regex: /^[a-z]{1,16}$/,
                            message: '只能由小写字母组成, 16个字符以内',
                            trigger: 'blur'
                        }
                    ],
                    projectDesc: [
                        {
                            required: true,
                            message: '必填项',
                            trigger: 'blur'
                        }
                    ]
                },
                formLayoutList: [],
                importProjectData: {}
            }
        },
        computed: {
            formType () {
                return this.type === 'templateProject' ? 'vertical' : 'horizontal'
            },
            uploadUrl () {
                return `${process.env.BK_AJAX_URL_PREFIX}/page/importJson`
            }
        },
        created () {
            this.formData = Object.assign({}, defaultFormData, this.propsFormData)
            this.formLayoutList = this.defaultLayoutList
            this.importProjectData = []
        },
        methods: {
            async validate () {
                const res = await this.$refs.infoForm.validate()
                return res
            },
            handleLayoutChecked (layout) {
                layout.checked = !layout.checked
                if (!layout.checked && layout.isDefault) {
                    layout.isDefault = 0
                    this.formLayoutList.filter(item => item.checked)[0].isDefault = 1
                }
            },
            handleLayoutDefault (layout) {
                this.formLayoutList.forEach(item => (item.isDefault = 0))
                layout.isDefault = 1
            },
            handleUploadSuccess (res) {
                const dataStr = res.responseData?.data
                this.importProjectData = JSON.parse(dataStr)
                if (typeof this.importProjectData?.route !== 'object' || typeof this.importProjectData?.func !== 'object' || typeof this.importProjectData?.page !== 'object') {
                    this.$bkMessage({
                        theme: 'error',
                        message: '请上传符合规范的应用json'
                    })
                    return
                }
                const projectData = this.importProjectData?.project || {}
                Object.assign(this.formData, projectData)
            },
            handleUploadReset () {
                this.importProjectData = {}
            }
        }
    }
</script>
