<template>
    <lc-sideslider
        class="component-operation-sideslider"
        v-enClass="'en-component-operation'"
        transfer
        :is-show="isShow"
        @update:isShow="close"
        :width="796"
        :title="dialogTitle">
        <div slot="content" class="operation-content" v-enClass="'en-operation-content'">
            <div class="component-guide">
                <a href="/help/custom" target="_blank">{{ $t('组件开发指引') }}</a>
            </div>
            <lc-form ref="form" :label-width="200" :model="formData" :rules="rules" form-type="vertical">
                <lc-form-item :label="$t('form_组件类型')" required error-display-type="normal">
                    <bk-radio-group v-model="formData.compType" style="display: flex;">
                        <bk-radio-button value="PC" style="flex: 1">
                            <bk-radio :checked="formData.compType === 'PC'"
                            ></bk-radio>
                            <i class="bk-drag-icon bk-drag-pc"></i>
                            <div class="component-type-desc">
                                <span class="comp-type-tag">{{ $t('PC 组件') }}</span>
                                <span>{{ $t('适用于搭建 PC 端 Web 界面') }}</span>
                            </div>
                        </bk-radio-button>
                        <bk-radio-button value="MOBILE">
                            <bk-radio :checked="formData.compType === 'MOBILE'"></bk-radio>
                            <i class="bk-drag-icon bk-drag-mobilephone"></i>
                            <div class="component-type-desc">
                                <span class="comp-type-tag">{{ $t('Mobile 组件') }}</span>
                                <span>{{ $t('适用于搭建H5，小程序，APP页面') }}</span>
                            </div>
                        </bk-radio-button>
                    </bk-radio-group>
                </lc-form-item>
                <lc-form-item :label="$t('VUE 版本')" required error-display-type="normal">
                    <bk-radio-group v-model="formData.framework">
                        <div class="bk-button-group">
                            <bk-button
                                @click="formData.framework = 'vue2'"
                                :class="formData.framework === 'vue2' ? 'is-selected' : ''"
                                :disabled="!!data.id || currentProject.framework === 'vue3'"
                            >VUE 2</bk-button>
                            <bk-button
                                @click="formData.framework = 'vue3'"
                                :class="formData.framework === 'vue3' ? 'is-selected' : ''"
                                :disabled="!!data.id || currentProject.framework !== 'vue3'"
                            >VUE 3</bk-button>
                        </div>
                    </bk-radio-group>
                </lc-form-item>
                <lc-form-item :label="$t('form_组件包')" required error-display-type="normal">
                    <bk-upload
                        class="component-upload"
                        :tip="uploadTips"
                        with-credentials
                        :url="uploadUrl"
                        :multiple="false"
                        :limit="1"
                        accept=".zip"
                        @on-success="handleUploadSuccess"
                        @on-progress="handleProgress" />
                </lc-form-item>
                <bk-link class="component-demo-link" theme="primary" @click="handleDownloadDemo">{{ $t('下载开发框架') }}</bk-link>
                <lc-form-item :label="$t('form_组件名称')" required property="name" error-display-type="normal">
                    <bk-input
                        :value="formData.displayName && formData.name ? `${formData.displayName}(${formData.name})` : ''"
                        :placeholder="$t('上传组件包后解析config.json内的displayName和name配置生成')"
                        readonly />
                </lc-form-item>
                <lc-form-item :label="$t('组件ID')" required property="type" error-display-type="normal">
                    <bk-input :value="formData.type" :placeholder="$t('上传组件包后解析config.json内的type配置生成')" readonly />
                </lc-form-item>
                <lc-form-item :label="$t('所属分类')" required property="categoryId" error-display-type="normal">
                    <bk-select v-model="formData.categoryId" :clearable="false">
                        <bk-option
                            v-for="item in categoryList"
                            :key="item.id"
                            :id="item.id"
                            :name="item.name" />
                    </bk-select>
                </lc-form-item>
                <lc-form-item :label="$t('form_组件介绍')" required property="description" error-display-type="normal">
                    <bk-input v-model="formData.description" type="textarea" :maxlength="100" />
                </lc-form-item>
                <lc-form-item :label="$t('form_组件版本')" required property="version" error-display-type="normal">
                    <div class="component-version-wraper">
                        <bk-input v-model="formData.version" :placeholder="$t('版本号格式') + '：1.x.x'" style="width: 300px" />
                        <span v-if="isEdit" class="last-version">{{ $t('上个版本为 {0}', [lastVersion]) }}</span>
                    </div>
                </lc-form-item>
                <lc-form-item ref="log" :label="$t('form_版本日志')" required property="log" error-display-type="normal">
                    <mavon-editor
                        :external-link="false"
                        v-model="formData.log"
                        default-open="edit"
                        :placeholder="versionLogPlaceholder" />
                </lc-form-item>
            </lc-form>
        </div>
        <div slot="footer">
            <div class="sideslider-footer">
                <bk-button theme="primary" :loading="isSubmiting" @click="handleSubmit">{{ $t('提交') }}</bk-button>
                <bk-button theme="default" @click="handleCancel">{{ $t('取消') }}</bk-button>
            </div>
        </div>
    </lc-sideslider>
</template>
<script>
    import { mapGetters } from 'vuex'
    import tnpmVersionValid from '@/common/tnpm-version-valid'
    import { leaveConfirm } from '@/common/leave-confirm'

    const generatorData = (data = {}) => ({
        name: '',
        displayName: '',
        type: '',
        dest: '',
        version: '',
        categoryId: '',
        description: '',
        log: '',
        compType: 'PC',
        framework: 'vue2',
        ...data
    })
    export default {
        name: '',
        props: {
            isShow: {
                type: Boolean,
                default: false
            },
            defaultCategory: {
                type: Number
            },
            data: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            const formData = generatorData({
                framework: this.$store.getters['project/currentProject'].framework || 'vue2'
            })
            return {
                isSubmiting: false,
                formData,
                lastVersion: '',
                categoryList: []
            }
        },
        computed: {
            ...mapGetters('project', ['currentProject']),
            dialogTitle () {
                return this.data.id ? window.i18n.t('更新自定义组件') : window.i18n.t('新建自定义组件')
            },
            isEdit () {
                return this.data.id
            },
            uploadUrl () {
                return `${process.env.BK_AJAX_URL_PREFIX}/component/upload?belongProjectId=${this.belongProjectId}&id=${this.data.id ? this.data.id : ''}`
            }
        },
        watch: {
            isShow (isShow) {
                if (isShow) {
                    this.formData.categoryId = this.defaultCategory
                    this.fetchCategoryList()
                }
            },
            data (newData) {
                if (!newData.id) {
                    return
                }
                const {
                    name,
                    displayName,
                    type,
                    dest,
                    categoryId,
                    version,
                    description,
                    versionLog,
                    framework
                } = newData
                this.formData.name = name
                this.formData.displayName = displayName
                this.formData.type = type
                this.formData.dest = dest
                this.formData.categoryId = categoryId
                this.formData.description = description
                this.formData.log = versionLog
                this.formData.framework = framework || 'vue2'
                this.lastVersion = version
            },
            'formData.log' (log) {
                if (log) {
                    this.$refs.log && this.$refs.log.clearValidator()
                }
            }
        },
        created () {
            this.belongProjectId = parseInt(this.$route.params.projectId)
            this.uploadTips = window.i18n.t('只允许上传ZIP包；\n组件ID对应的组件包内config.json里的type配置，上传成功后会自动添加应用ID({0})前缀，即：{0}-xxx；\n必须使用系统提供的框架构建后上传。', { '0': this.currentProject.projectCode })
            this.versionLogPlaceholder = window.i18n.t('eg: 新增 XXX 功能\n    优化 XXX 功能\n    修复 XXX 功能\n')

            this.markdownOption = {
                defaultOpen: 'edit'
            }
            this.rules = {
                name: [
                    { required: true, message: window.i18n.t('请先上传组件'), trigger: 'blur' }
                ],
                compType: [
                    { required: true, message: window.i18n.t('请选择组件类型'), trigger: 'blur' }
                ],
                type: [
                    { required: true, message: window.i18n.t('请先上传组件'), trigger: 'blur' },
                    {
                        validator: value => /^[a-z][a-z\d]*(-[a-z\d]+)*$/.test(value),
                        message: window.i18n.t('组件type格式：以a-z开头，只允许a-z、0-9、-'),
                        trigger: 'blur'
                    }
                ],
                version: [
                    { required: true, message: window.i18n.t('组件版本不能为空'), trigger: 'blur' },
                    {
                        validator: value => {
                            return /^\d/.test(value) && tnpmVersionValid.re[tnpmVersionValid.t.FULL].test(value)
                        },
                        message: window.i18n.t('版本号格式') + '：0.x.x',
                        trigger: 'blur'
                    }
                ],
                categoryId: [
                    { required: true, message: window.i18n.t('所属分类不能为空'), trigger: 'blur' }
                ],
                description: [
                    { required: true, message: window.i18n.t('组件介绍不能为空'), trigger: 'blur' }
                ],
                log: [
                    { required: true, message: window.i18n.t('版本日志不能为空'), trigger: 'blur' }
                ],
                framework: [
                    { required: true, message: window.i18n.t('组件对应 Vue 版本必须选择'), trigger: 'blur' }
                ]
            }
        },
        methods: {
            async fetchCategoryList () {
                this.categoryList = await this.$store.dispatch('components/categoryList', {
                    belongProjectId: parseInt(this.$route.params.projectId)
                })
            },
            handleUploadSuccess (payload) {
                const { name, displayName, type, dest } = payload.responseData.data
                this.formData.name = name
                this.formData.displayName = displayName
                this.formData.type = type
                this.formData.dest = dest
            },
            handleProgress () {
                window.leaveConfirm = true
            },
            async handleSubmit () {
                try {
                    await this.$refs.form.validate()
                } catch (validator) {
                    return this.$bkMessage({
                        message: validator.content || this.$t('数据校验不通过，请修改后重试'),
                        theme: 'error'
                    })
                }

                this.isSubmiting = true
                try {
                    if (this.isEdit) {
                        await this.$store.dispatch('components/update', {
                            ...this.formData,
                            id: this.data.id,
                            belongProjectId: this.belongProjectId
                        })
                        this.messageSuccess(window.i18n.t('编辑组件成功'))
                    } else {
                        await this.$store.dispatch('components/create', {
                            ...this.formData,
                            belongProjectId: this.belongProjectId
                        })
                        this.messageSuccess(window.i18n.t('添加组件成功'))
                    }
                    window.leaveConfirm = false
                    this.$emit('on-add')
                    this.$emit('on-update')
                    this.close()
                } catch (error) {
                    this.messageError(error.message)
                } finally {
                    this.isSubmiting = false
                }
            },
            close () {
                this.formData = generatorData({
                    framework: this.$store.getters['project/currentProject'].framework || 'vue2'
                })
                this.$emit('update:isShow', false)
            },
            handleCancel () {
                leaveConfirm(window.i18n.t('存在未保存的自定义组件，关闭后不会保存更改'))
                    .then(() => {
                        this.close()
                    })
            },
            handleDownloadDemo () {
                window.open(`/static/bk-lesscode-component-${this.formData.framework}.zip`, '_self')
            }
        }
    }
</script>
<style lang='postcss'>
    .component-operation-sideslider{
        .operation-content{
            padding: 25px 30px;
            .component-guide{
                padding-bottom: 10px;
                margin-top: -15px;
                font-size: 12px;
                text-align: right;
                a{
                    color: #3a84ff;
                }
            }
            .markdown-body{
                max-height: 300px;
                box-shadow: none !important;
                border: 1px solid #C4C6CC;
                border-radius: 2px;
                .auto-textarea-input{
                    min-height: 100px;
                }
            }
            .component-upload{
                .file-name{
                    display: block !important;
                }
                .progress-bar-wrapper{
                    margin-top: 16px !important;
                }
                .tip{
                    line-height: 20px;
                    white-space: pre-line;
                }
            }
            .component-version-wraper{
                display: flex;
                align-items: center;
                .last-version{
                    margin-left: 10px;
                    font-size: 12px;
                    color: #979BA5;
                }
            }
            .component-demo-link {
                margin-top: -16px;
                .bk-link-text {
                    font-size: 12px;
                }
            }
        }
        .sideslider-footer{
            padding-left: 30px;
            .bk-button {
                margin-right: 10px;
            }
        }
        .middle-text .bk-radio-button-text {
            justify-content: center;
        }

        .bk-form-radio-button .bk-radio-button-text {
            height: 56px;
            display: flex;
            align-items: center;

            i {
                font-size: 30px;
                margin-left: 5px;
                color: #979ba5;
            }

            .component-type-desc {
                display: flex;
                flex-direction: column;
                align-items: flex-start;
                margin-left: 10px;

                span {
                    line-height: 20px;
                    font-size: 12px;
                }

                .comp-type-tag{
                    font-weight: 700;
                }
            }
        }

        .bk-form-radio-button .bk-radio-button-input:checked+.bk-radio-button-text i{
            color: #3a84ff;
        }

        .bk-button-group {
            display: flex;
            .bk-button {
                flex: 1;
                height: 56px;
            }
        }
    }
</style>
