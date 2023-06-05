<template>
    <section>
        <div v-if="!showEdit" :class="$style['show-setting']">
            <span v-if="currentAppInfo.appCode && currentAppInfo.moduleCode">{{ showAppAndModule }}</span>
            <span v-else>
                <i class="bk-drag-icon bk-drag-info-tips" :class="$style['info-tips']"></i>
                <span>{{ $t('未绑定') }}</span>
                <i v-if="canEdit" class="bk-drag-icon bk-drag-edit" :class="$style['edit-setting-icon']" @click="showEdit = true"></i>
                <span v-else @click="toBindApp" style="cursor: pointer;color: #3a84ff">，{{ $t('去绑定') }}</span>
            </span>
        </div>
        <div v-else :class="$style['edit-setting']">
            <bk-select :class="$style['saas-option']" v-enClass="$style['en-saas-option']" v-model="tmpAppCode" :placeholder="$t('请选择应用')" :clearable="false" searchable :loading="isLoadingAppList" @toggle="toggleApplicationList" @selected="changeAppCode">
                <bk-option v-for="option in applicationList"
                    :key="option.application.id"
                    :id="option.application.code"
                    :name="option.application.name">
                </bk-option>
                <div slot="extension" :class="$style['selector-create-item']">
                    <a :href="`${createLinkUrl}/app/create`" target="_blank"><i class="bk-drag-icon bk-drag-add-line" />{{ $t('去创建应用') }}</a>
                </div>
            </bk-select>
            <bk-select :class="$style['saas-option']" v-enClass="$style['en-saas-option']" v-model="tmpModuleCode" :placeholder="$t('请选择模块')" :clearable="false" searchable :loading="isLoadingModuleList" @toggle="toggleModuleList">
                <bk-option v-for="option in moduleList"
                    :key="option.id"
                    :id="option.name"
                    :name="option.name"
                    :disabled="option.disabled"
                >
                </bk-option>
                <template v-if="createLinkUrl && tmpAppCode">
                    <div slot="extension" :class="$style['selector-create-item']">
                        <a :href="`${createLinkUrl}/apps/${tmpAppCode}/module/create`" target="_blank">
                            <i class="bk-drag-icon bk-drag-add-line" />
                            {{ $t('去创建模块') }} </a>
                    </div>
                </template>
            </bk-select>
            <span :class="$style['operate-bind']" v-enClass="$style['en-operate-bind']">
                <span @click="confirmBind">{{ $t('确定') }}</span> | <span @click="cancelBind">{{ $t('取消') }}</span>
            </span>
        </div>
    </section>
</template>

<script>

    export default {
        props: {
            canEdit: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                isLoading: false,
                showEdit: false,
                currentAppInfo: {
                    appCode: '',
                    moduleCode: ''
                },
                tmpAppCode: '',
                tmpModuleCode: '',
                applicationList: [],
                moduleList: [],
                createLinkUrl: '',
                isLoadingAppList: false,
                isLoadingModuleList: false
            }
        },

        computed: {
            projectId () {
                return this.$route.params.projectId
            },

            showAppAndModule () {
                const selectApp = this.applicationList.find(item => item.application.code === this.currentAppInfo.appCode)
                const showAppCode = (selectApp && selectApp.application.name) || this.currentAppInfo.appCode
                return `${showAppCode}/${this.currentAppInfo.moduleCode}`
            },

            bindInfoTips () {
                return {
                    placement: 'top',
                    width: '284px',
                    content: this.$t('必须绑定“源码管理”方式为“蓝鲸可视化开发平台提供源码包”的蓝鲸应用模块，')`<a target="_blank" href="${this.createLinkUrl}" style="cursor: pointer;color: #3a84ff">` + this.$t('跳转创建') + '</a>'
                }
            }
        },

        created () {
            this.init()
        },

        methods: {
            init () {
                this.getReleaseDetail()
                Promise.all([this.getApplicationList(), this.getProjectDetail()]).then(([applicationList, appCode]) => {
                    const index = applicationList.findIndex((item) => {
                        const application = item.application || {}
                        return application.code === appCode
                    })
                    if (index > -1) this.getModuleList(appCode)
                })
            },

            getProjectDetail () {
                this.isLoading = true
                return this.$store.dispatch('project/detail', { projectId: this.projectId }).then((projectDetail) => {
                    this.tmpAppCode = this.currentAppInfo.appCode = projectDetail.appCode || ''
                    this.tmpModuleCode = this.currentAppInfo.moduleCode = projectDetail.moduleCode || ''
                    return this.currentAppInfo.appCode
                }).finally(() => {
                    this.isLoading = false
                })
            },

            getReleaseDetail () {
                this.$store.dispatch('release/detailInfo', { projectId: this.projectId }).then((detailInfo) => {
                    this.createLinkUrl = detailInfo.createLinkUrl
                })
            },

            changeAppCode (val) {
                this.tmpModuleCode = ''
                this.getModuleList(val)
            },

            toBindApp () {
                this.$router.push({
                    name: 'basicInfo'
                })
            },

            toggleApplicationList (isOpen) {
                if (isOpen) {
                    this.getApplicationList()
                }
            },
            toggleModuleList (isOpen) {
                if (isOpen && this.tmpAppCode) {
                    this.getModuleList(this.tmpAppCode)
                }
            },

            getApplicationList () {
                this.isLoadingAppList = true
                return this.$store.dispatch('release/applicationList').then((applicationList) => {
                    this.applicationList = applicationList || []
                    return this.applicationList
                }).finally(() => {
                    this.isLoadingAppList = false
                })
            },

            getModuleList (appCode) {
                this.isLoadingModuleList = true
                return this.$store.dispatch('release/moduleList', { appCode }).then((moduleList) => {
                    this.moduleList = moduleList || []
                }).finally(() => {
                    this.isLoadingModuleList = false
                })
            },

            cancelBind () {
                this.showEdit = false
                this.tmpAppCode = this.currentAppInfo.appCode
                this.tmpModuleCode = this.currentAppInfo.moduleCode
            },

            async confirmBind () {
                if (!this.tmpAppCode || !this.tmpModuleCode) {
                    this.$bkMessage({
                        theme: 'error',
                        message: this.$t('请先选择应用和相应模块')
                    })
                } else {
                    await this.$store.dispatch('release/checkAppInfoExist', {
                        appInfo: {
                            appCode: this.tmpAppCode,
                            moduleCode: this.tmpModuleCode
                        },
                        projectId: this.projectId
                    })
                    const res = await this.$store.dispatch('project/update', {
                        data: {
                            id: this.projectId,
                            fields: {
                                appCode: this.tmpAppCode,
                                moduleCode: this.tmpModuleCode
                            }
                        }
                    })
                    if (res) {
                        this.$bkMessage({
                            theme: 'success',
                            message: this.$t('绑定成功')
                        })
                        this.currentAppInfo = {
                            appCode: this.tmpAppCode,
                            moduleCode: this.tmpModuleCode
                        }
                        this.showEdit = false
                    }
                }
            }
        }
    }
</script>

<style lang="postcss" module>
    .credential-manage {
        padding: 20px 24px;
        font-size: 12px;
        min-height: 100%;
    }
    .label {
        font-weight: bold;
    }
    .bind-label {
        width: 112px;
        cursor: default;
        padding-bottom: 3px;
        border-bottom: 1px dashed #979797;
    }
    .info-tips {
        color: orange;
    }
    .show-setting {
        display: inline-flex;
        align-items: center;
        .edit-setting-icon {
            cursor: pointer;
            padding: 6px;
            font-size: 16px;
            &:hover {
                color: #3a84ff;
            }
        }
    }
    .edit-setting {
        display: inline-flex;
        align-items: center;
        .saas-option {
            width: 150px;
            height: 32px;
            margin-right: 6px;
        }
        .en-saas-option{
            width: 195px;
        }
        .operate-bind {
            width: 60px;
            span {
                cursor: pointer;
                color: #3a84ff;
            }
        }
        .en-operate-bind {
            width: 80px;
        }
    }
    .selector-create-item {
        cursor: pointer;
        height: 38px;
        line-height: 38px;
        font-size: 12px;
        a {
            color: #63656e;
        }
        &:hover {
            a {
                color: #3a84ff;
            }
        }
    }
</style>
