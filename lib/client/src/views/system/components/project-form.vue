<template>
    <bk-form ref="infoForm" :label-width="300" form-type="vertical" :rules="formRules" :model="formData">
        <bk-form-item v-if="type === 'templateProject'" :label="$t('form_当前已选模板')" :label-width="200">
            <bk-input readonly v-model.trim="templateName" :placeholder="$t('请先选择模板')">
            </bk-input>
        </bk-form-item>
        <bk-form-item v-if="type === 'importProject'" :label="$t('form_应用JSON文件')" required error-display-type="normal">
            <bk-upload with-credentials :multiple="false" :url="uploadUrl" :limit="1" accept=".json"
                :desc="$t('应用JSON可通过“导出”已有应用获得')" @on-success="handleUploadSuccess" @on-error="handleUploadReset"
                @on-delete="handleUploadReset"></bk-upload>
        </bk-form-item>
        <bk-form-item :label="$t('VUE 版本')" required property="framework" error-display-type="normal">
            <div class="bk-button-group">
                <bk-button @click="formData.framework = 'vue2'"
                    :class="formData.framework === 'vue2' ? 'is-selected' : ''" :disabled="type !== 'newProject'">VUE
                    2</bk-button>
                <bk-button @click="formData.framework = 'vue3'"
                    :class="formData.framework === 'vue3' ? 'is-selected' : ''" :disabled="type !== 'newProject'">VUE
                    3</bk-button>
            </div>
        </bk-form-item>
        <bk-form-item :label="$t('form_应用名称')" required property="projectName" error-display-type="normal">
            <bk-input maxlength="60" v-model.trim="formData.projectName" :placeholder="$t('由汉字，英文字母，数字组成，20个字符以内')">
            </bk-input>
        </bk-form-item>
        <bk-form-item :label="$t('应用ID')" required property="projectCode" error-display-type="normal">
            <bk-input maxlength="60" v-model.trim="formData.projectCode"
                :placeholder="$t('由小写字母组成，长度小于16个字符，该ID将作为自定义组件前缀，创建后不可更改')">
            </bk-input>
        </bk-form-item>
        <bk-form-item :label="$t('form_应用简介')" required property="projectDesc" error-display-type="normal">
            <bk-input v-model.trim="formData.projectDesc" :type="'textarea'" :rows="3" :maxlength="100">
            </bk-input>
        </bk-form-item>
        <bk-form-item :label="$t('form_导航布局')" style="margin-top: 10px" v-if="type === 'newProject'"
            error-display-type="normal">
            <p class="layout-desc">{{ $t('可多选，作为创建应用页面时可供选择的导航布局，便于在应用中统一配置导航') }}</p>
            <layout-thumb-list :list="formLayoutList" @change-checked="handleLayoutChecked"
                @set-default="handleLayoutDefault" />
        </bk-form-item>
    </bk-form>
</template>

<script>
    import LayoutThumbList from '@/components/project/layout-thumb-list'

    const defaultFormData = {
        projectCode: '',
        projectName: '',
        projectDesc: '',
        framework: 'vue2'
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
        data() {
            return {
                formData: {},
                formRules: {
                    projectName: [
                        {
                            regex: /^[a-zA-Z0-9\u4e00-\u9fa5]{1,20}$/,
                            message: window.i18n.t('由汉字，英文字母，数字组成，20个字符以内'),
                            trigger: 'blur'
                        },
                        {
                            validator: this.checkName,
                            message: '该应用名称已存在',
                            trigger: 'blur'
                        }
                    ],
                    projectCode: [
                        {
                            regex: /^[a-z]{1,16}$/,
                            message: window.i18n.t('只能由小写字母组成, 16个字符以内'),
                            trigger: 'blur'
                        },
                        {
                            validator: this.checkCode,
                            message: '该应用ID已存在',
                            trigger: 'blur'
                        }
                    ],
                    projectDesc: [
                        {
                            required: true,
                            message: window.i18n.t('必填项'),
                            trigger: 'blur'
                        }
                    ]
                },
                formLayoutList: [],
                importProjectData: {}
            }
        },
        computed: {
            uploadUrl() {
                return `${process.env.BK_AJAX_URL_PREFIX}/page/importJson`
            }
        },
        watch: {
            'propsFormData.framework': {
                handler(val) {
                    this.formData.framework = val || 'vue2'
                },
                immediate: true
            }
        },
        created() {
            this.formData = Object.assign({}, defaultFormData, this.propsFormData)
            this.formLayoutList = this.defaultLayoutList
            this.importProjectData = []
        },
        methods: {
            async checkName() {
                const res = await this.$store.dispatch('project/checkname', {
                    data: {
                        name: this.formData.projectName,
                        isBlurCheck: true
                    }
                })
                // 接口返回true， 代表重复
                return res.data !== true
            },
            async checkCode() {
                const res = await this.$store.dispatch('project/checkname', {
                    data: {
                        projectCode: this.formData.projectCode,
                        isBlurCheck: true
                    }
                })
                // 接口返回true， 代表重复
                return res.data !== true
            },
            async validate() {
                const res = await this.$refs.infoForm.validate()
                return res
            },
            handleLayoutChecked(layout) {
                layout.checked = !layout.checked
                if (!layout.checked && layout.isDefault) {
                    layout.isDefault = 0
                    this.formLayoutList.filter(item => item.checked)[0].isDefault = 1
                }
            },
            handleLayoutDefault(layout) {
                this.formLayoutList.forEach(item => (item.isDefault = 0))
                layout.isDefault = 1
            },
            handleUploadSuccess(res) {
                const dataStr = res.responseData?.data
                this.importProjectData = JSON.parse(dataStr)
                if (typeof this.importProjectData?.route !== 'object' || typeof this.importProjectData?.func !== 'object' || typeof this.importProjectData?.page !== 'object') {
                    this.$bkMessage({
                        theme: 'error',
                        message: window.i18n.t('请上传符合规范的应用json')
                    })
                    return
                }
                const projectData = this.importProjectData?.project || {}
                Object.assign(this.formData, projectData)
            },
            handleUploadReset() {
                this.importProjectData = {}
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .bk-button-group {
        width: 100%;
        display: flex;

        .bk-button {
            flex: 1;
            height: 32px;
        }
    }

    .layout-desc {
        line-height: 20px;
        color: #979BA5;
        font-size: 12px;
        margin-bottom: 4px;
    }
</style>