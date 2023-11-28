<template>
    <section v-bkloading="{ isLoading: isLoading, opacity: 1 }" :class="$style['release-wrapper']">
        <bk-alert v-if="showMobileTips" type="info" closable>
            <div slot="title">{{ $t('本次部署的页面中含有移动端页面') }}</div>
        </bk-alert>
        <section v-show="!isLoading" :class="$style['release-container']">
            <div :class="$style['release-summary']">
                <div :class="$style['title']">{{ $t('部署信息') }}</div>
                <div :class="$style['release-info']">
                    <span :class="$style['setting']" v-enClass="$style['en-setting']">
                        <span :class="$style['label']" v-bk-tooltips="bindInfoTips">{{ $t('绑定蓝鲸应用模块') }}</span>
                        <app-module-select ref="appModuleSelect" :class="$style['detail']"></app-module-select>
                    </span>
                    <span :class="[$style['latest-info']]" v-enClass="$style['en-latest-info']">
                        <span :class="$style['label']">{{ $t('当前生产环境部署版本') }}</span>
                        <span v-if="prodInfo.version && !prodInfo.isOffline" :class="$style['detail']">
                            <span v-if="prodInfo.accessUrl" :class="$style['link-detail']" v-bk-tooltips.top="{ content: getInfoTips(prodInfo), maxWidth: 400 }">
                                <a target="_blank" :href="prodInfo.accessUrl">
                                    {{ prodInfo.version }}
                                    <i class="bk-drag-icon bk-drag-jump-link"></i>
                                </a>
                                <a v-if="prodInfo.mobileUrl" href="javascript:;" @click="copy(prodInfo.accessUrl + prodInfo.mobileUrl)" v-bk-tooltips.top="{ content: $t('本次部署版本含有移动端页面，在对本域名申请移动端网关后可在移动端访问该链接，点击可复制链接'), maxWidth: 400 }">
                                    <i class="bk-drag-icon bk-drag-mobilephone"> </i>
                                </a>
                            </span>
                            <span v-else>
                                {{ prodInfo.version }}
                            </span>
                            <span v-if="prodInfo.isDefault">,
                                <span v-if="prodInfo.marketPublished">{{ $t('已发布至市场') }}</span>
                                <span v-else>{{ $t('未发布至市场,') }}<a :href="`${createLinkUrl}/apps/${currentAppInfo.appCode}/market`" target="_blank" style="cursor: pointer;color: #3a84ff">{{ $t('去设置') }}</a></span>
                            </span>
                        </span>
                        <span v-else :class="$style['detail']">
                            <i :class="$style['info-tips']" class="bk-drag-icon bk-drag-info-tips"></i>
                            <span>{{ $t('未部署') }}</span>
                        </span>
                    </span>
                    <span :class="[$style['latest-info']]" v-enClass="$style['en-latest-info']">
                        <span :class="$style['label']">{{ $t('当前预发布环境部署版本') }}</span>
                        <span v-if="stagInfo.version && !stagInfo.isOffline" :class="$style['detail']">
                            <span v-if="stagInfo.accessUrl" :class="$style['link-detail']">
                                <a target="_blank" :href="stagInfo.accessUrl" v-bk-tooltips.top="getInfoTips(stagInfo)">
                                    {{ stagInfo.version }}
                                    <i class="bk-drag-icon bk-drag-jump-link"></i>
                                </a>
                                <a v-if="stagInfo.mobileUrl" href="javascript:;" @click="copy(stagInfo.accessUrl + stagInfo.mobileUrl)" v-bk-tooltips.top="{ content: $t('本次部署版本含有移动端页面，在对本域名申请移动端网关后可在移动端访问该链接，点击可复制链接'), maxWidth: 400 }">
                                    <i class="bk-drag-icon bk-drag-mobilephone"> </i>
                                </a>
                            </span>
                            <span v-else>
                                {{ stagInfo.version }}
                            </span>
                        </span>
                        <span v-else :class="$style['detail']">
                            <i :class="$style['info-tips']" class="bk-drag-icon bk-drag-info-tips"></i>
                            <span>{{ $t('未部署') }}</span>
                        </span>
                    </span>
                    
                    <div :class="[$style['operation'],{ [$style['seperate-line']]: currentAppInfo.appCode && currentAppInfo.moduleCode }]">
                        <span :class="$style['offline-operate']" v-show="(stagInfo.version && !stagInfo.isOffline) || (prodInfo.version && !prodInfo.isOffline)">
                            <bk-button size="small" :disabled="latestInfo.status === 'running'" :class="$style['offline-btn']" @click="toggleOffline(true)">
                                <i class="bk-drag-icon bk-drag-off-shelf"></i>
                                <span>{{ $t('下架') }}</span>
                            </bk-button>
                        </span>
                        <bk-dropdown-menu v-show="currentAppInfo.appCode && currentAppInfo.moduleCode" @show="() => isDropdownShow = true " @hide="isDropdownShow = false" ref="dropdown">
                            <div :class="$style['dropdown-trigger-btn']" slot="dropdown-trigger">
                                <span>{{ $t('更多操作') }}</span>
                                <i :class="[$style['icon-size'],'bk-icon icon-angle-down', { 'icon-flip': isDropdownShow }]"></i>
                            </div>
                            <ul class="bk-dropdown-list" style="max-height: 194px" slot="dropdown-content">
                                <template v-if="appDetail.type === 'cloud_native'">
                                    <li><a href="javascript:;" @click="toManagePage('deployments/stag', false)">{{ $t('部署管理') }}</a></li>
                                    <li><a href="javascript:;" @click="toManagePage('logging')">{{ $t('日志查询') }}</a></li>
                                    <li><a href="javascript:;" @click="toManagePage('settings/modules')">{{ $t('模块配置') }}</a></li>
                                    <li><a href="javascript:;" @click="toManagePage('settings/application/', false)">{{ $t('应用配置') }}</a></li>
                                </template>
                                <template v-else>
                                    <li><a href="javascript:;" @click="toManagePage('deploy')">{{ $t('部署管理') }}</a></li>
                                    <li><a href="javascript:;" @click="toManagePage('process')">{{ $t('进程管理') }}</a></li>
                                    <li><a href="javascript:;" @click="toManagePage('log?tab=structured')">{{ $t('日志查询') }}</a></li>
                                    <li><a href="javascript:;" @click="toManagePage('environment_variable')">{{ $t('环境配置') }}</a></li>
                                    <li><a href="javascript:;" @click="toManagePage('app_entry_config')">{{ $t('访问入口') }}</a></li>
                                    <li><a href="javascript:;" @click="toManagePage('base-info', false)">{{ $t('基本信息') }}</a></li>
                                </template>
                            </ul>
                        </bk-dropdown-menu>
                    </div>
                </div>
                
            </div>

            <div :class="$style['release-content']">
                <div :class="$style['title']">{{ $t('部署新版本') }}</div>
                <section :class="$style['release-form-info']" v-if="!publishCom">
                    <bk-alert v-if="latestInfo.id" :type="latestInfo.status === 'successful' ? 'success' : (latestInfo.status === 'failed' ? 'error' : 'info')" :class="$style['last-version-tips']">
                        <div slot="title">
                            <span :class="$style['tips-content']">{{ $t('最近{0}版本：', [typeMap[latestInfo.isOffline]]) }}<span v-html="getInfoTips(latestInfo, 'last')"></span></span>
                            <span v-if="!latestInfo.isOffline" :class="$style['latest-log-link']" @click="showLog(latestInfo)">，{{ latestInfo.status === 'successful' ? $t('查看成功日志') : (latestInfo.status === 'failed' ? $t('查看失败日志') : $t('查看日志'))}}</span>
                        </div>
                    </bk-alert>
                    <div :class="$style['release-form']">
                        <div :class="$style['type']">
                            <span :class="[$style['version-label'],$style['required']]">{{ $t('form_部署环境') }}</span>
                            <bk-radio-group v-model="versionForm.env" class="version-type" @change="getReleaseSql">
                                <bk-radio-button value="stag">{{ $t('预发布环境') }}</bk-radio-button>
                                <bk-radio-button value="prod">{{ $t('生产环境') }}</bk-radio-button>
                            </bk-radio-group>
                        </div>
                        <div :class="[$style['type'], $style['is-source']]">
                            <span :class="[$style['version-label'],$style['required']]">{{ $t('form_源码包') }}</span>
                            <div>
                                <bk-radio-group v-model="versionForm.releaseType" class="version-type" @change="getReleaseSql">
                                    <bk-radio-button value="PROJECT_VERSION">{{ $t('应用版本') }}
                                        <i :class="['bk-icon', 'icon-info', $style['icon']]"
                                            v-bk-tooltips="{
                                                content: $t('基于应用“默认”或未归档的版本'),
                                                width: 220
                                            }"
                                        ></i>
                                    </bk-radio-button>
                                    <bk-radio-button value="HISTORY_VERSION">{{ $t('历史部署包') }}
                                        <i :class="['bk-icon', 'icon-info', $style['icon']]"
                                            v-bk-tooltips="{
                                                content: $t('已部署成功过的的源码包')
                                            }"
                                        ></i>
                                    </bk-radio-button>
                                </bk-radio-group>
                                <div :class="$style['source-from']" v-if="isProjVersion">
                                    <bk-select :placeholder="$t('请选择要部署的应用版本')" style="width: 700px"
                                        :clearable="false"
                                        v-model="versionForm.projVersionSelect" :loading="projVersionLoading" @toggle="toggleProjVersionList"
                                        @change="changeProjVersionList">
                                        <bk-option v-for="option in projVersionList"
                                            :key="option.id"
                                            :id="option.id"
                                            :name="option.version">
                                        </bk-option>
                                    </bk-select>
                                </div>
                            </div>
                        </div>
                        <div
                            :class="[$style['last-version-tips'], $style['version-table']]"
                            v-if="showReleaseTips"
                            v-bkloading="{ isLoading: isLoadingReleaseSql || flowListLoading }">
                            <i :class="$style['table-icon']" class="bk-drag-icon bk-drag-info-tips"></i>
                            <div class="release-tips-content">
                                <p v-if="releaseSqls.length">
                                    <span :class="$style['tips-content']">{{ $t('部署后数据库将会有变更，请确认后操作，点击查看') }}</span>
                                    <span :class="$style['table-link']" @click="showSql">{{ $t('变更详情') }}</span>
                                </p>
                                <p v-if="notDeployedFlowList.length">
                                    {{ $t('检测到流程') }} <template v-for="(flow, index) in notDeployedFlowList">
                                        {{ index === 0 ? '' : '、' }}
                                        <span
                                            :key="flow.id"
                                            :class="$style['table-link']">
                                            【{{ flow.flowName }}】
                                        </span>
                                    </template>
                                    {{ $t('有更新，未在预览环境部署验证，建议先验证流程再发布应用') }} </p>
                            </div>
                        </div>
                        <div :class="$style['form-item']">
                            <p :class="$style['form-label']">
                                <span :class="[$style['version-label'], $style['required']]">{{ $t('form_部署版本号') }}</span>
                                <span :class="$style['version-tips']" v-show="newVersionInfo.version">{{newVersionInfo.version ? $t('上次部署版本号为：{0}', [newVersionInfo.version]) : ''}}</span>
                            </p>
                            <div v-if="isProjVersion">
                                <bk-input
                                    :placeholder="$t('请输入部署版本号，仅支持英文、数字、下划线、中划线和英文句号')"
                                    maxlength="30"
                                    style="width: 700px"
                                    v-model="versionForm.releaseVersion">
                                </bk-input>
                                <p :class="$style['version-err-tips']" v-show="versionErrTips">{{versionErrTips}}</p>
                            </div>
                            <bk-select v-else-if="isSucVersion" :placeholder="$t('请选择要部署的历史版本')" style="width: 700px"
                                :clearable="false"
                                v-model="versionForm.sucVersionSelect" :loading="sucVersionLoading" @toggle="toggleSucVersionList">
                                <bk-option v-for="option in sucVersionList"
                                    :key="option.version"
                                    :id="option.version"
                                    :name="option.version">
                                </bk-option>
                            </bk-select>
                        </div>
                        <div :class="$style['form-item']" v-if="isProjVersion">
                            <span :class="[$style['version-label'],$style['required']]">{{ $t('form_创建应用版本') }}</span>
                            <bk-radio-group v-model="versionForm.isCreateProjVersion" class="version-type">
                                <bk-radio :value="0">{{ $t('不创建') }}</bk-radio>
                                <bk-radio :value="1" style="margin-left: 50px">{{ $t('创建，部署成功后创建应用版本并归档') }}</bk-radio>
                            </bk-radio-group>
                        </div>
                        <div :class="[$style['form-item'], 'version-publish-log']"
                            v-show="isProjVersion && versionForm.projVersionSelect && versionForm.isCreateProjVersion">
                            <span :class="[$style['version-label'],$style['required']]">{{ $t('版本日志') }}</span>
                            <mavon-editor
                                :external-link="false"
                                v-model="versionForm.versionLog"
                                default-open="edit"
                                :placeholder="versionLogPlaceholder" />
                            <p :class="$style['version-err-tips']" v-show="versionLogErrTips">{{versionLogErrTips}}</p>
                        </div>
                        <div :class="$style['release-btn']">
                            <bk-button theme="primary" :disabled="releaseBtnDisabled" @click="release">
                                {{((latestInfo.status === 'running' && !latestInfo.isOffline) || disabledRelease) ? $t('部署中...') : $t('部署')}}
                            </bk-button>
                            <span :class="$style['release-tips']">{{ $t('由PaaS平台-开发者中心提供部署支持，部署成功后，应用进程等信息可以在蓝鲸开发者中心管理') }}</span>
                        </div>
                    </div>
                </section>
                <component
                    v-if="publishCom"
                    :is="publishCom"
                    :current-app-info="currentAppInfo"
                    :env="versionForm.env"
                    :deploy-id="latestInfo.deployId"
                    :latest-info="latestInfo"
                    :default-content="defaultContent"
                    :deploy-status="latestInfo.status"
                    :create-user="latestInfo.createUser"
                    @checkCom="checkCom"></component>
            </div>
            <bk-dialog v-model="showOffline"
                render-directive="if"
                :title="$t('下架版本')"
                width="530"
                :mask-close="false"
                :auto-close="false"
                header-position="left"
                ext-cls="offline-dialog"
            >
                <div>
                    <bk-alert type="warning" :title="$t('下架成功后，应用对应的访问入口将会被关闭')"></bk-alert>
                    <div :class="[$style['offline-env-div'], $style['type']]">
                        <span :class="$style['offline-label']">{{ $t('下架环境') }}</span>
                        <bk-radio-group v-model="offlineEnv" :class="$style['offline-type']">
                            <bk-radio value="stag" :disabled="!(stagInfo.version && !stagInfo.isOffline)">{{ $t('预发布环境') }}</bk-radio>
                            <bk-radio value="prod" :disabled="!(prodInfo.version && !prodInfo.isOffline)" style="margin-left: 50px">{{ $t('生产环境') }}</bk-radio>
                        </bk-radio-group>
                    </div>
                </div>
                <div class="dialog-footer" slot="footer">
                    <bk-button
                        theme="primary"
                        :loading="offlineLoading"
                        @click="confirmOffline">{{ $t('确定') }}</bk-button>
                    <bk-button @click="toggleOffline(false)" :disabled="offlineLoading">{{ $t('取消') }}</bk-button>
                </div>
            </bk-dialog>
            <bk-sideslider
                :is-show.sync="isShowReleaseSql"
                :quick-close="true"
                :width="960"
                :title="`${$t('数据库变更详情')}【${versionForm.env === 'stag' ? $t('预发布环境') : $t('生产环境')} 】`">
                <div slot="content">
                    <monaco
                        read-only
                        height="calc(100vh - 90px)"
                        :value="releaseSqls.reduce((acc, cur) => (acc = (cur.sql + acc), acc), '')"
                        :options="{ language: 'sql' }">
                    </monaco>
                </div>
            </bk-sideslider>
        </section>
    </section>
</template>

<script>
    import dayjs from 'dayjs'
    import completedInfo from './components/completed-info'
    import appModuleSelect from '@/components/project/app-module-select'
    import runningInfo from './components/running-info'
    import monaco from '@/components/monaco.vue'
    import publishMixin from './publish-mixin'
    import { execCopy } from '@/common/util'

    const defaultVersionFormData = () => ({
        env: 'stag',
        releaseType: 'PROJECT_VERSION',
        releaseVersion: '',
        projVersionSelect: -1,
        sucVersionSelect: '',
        versionLog: undefined,
        isCreateProjVersion: 0
    })
    
    export default {
        components: {
            completedInfo,
            runningInfo,
            monaco,
            appModuleSelect
        },
        mixins: [publishMixin],
        data () {
            return {
                isLoading: true,
                sucVersionLoading: false,
                projVersionLoading: false,
                projVersionList: [],
                sucVersionList: [],
                currentProject: {},
                appDetail: {},
                currentAppInfo: {
                    appCode: '',
                    moduleCode: ''
                },
                versionForm: defaultVersionFormData(),
                isDropdownShow: false,
                disabledRelease: false,
                createLinkUrl: '',
                latestInfo: {},
                newVersionInfo: {},
                stagInfo: {},
                prodInfo: {},
                envMap: {
                    prod: window.i18n.t('生产环境'),
                    stag: window.i18n.t('预发布环境')
                },
                defaultContent: '',
                timer: null,
                showOffline: false,
                offlineEnv: '',
                offlineLoading: false,
                isShowReleaseSql: false,
                isLoadingReleaseSql: false,
                releaseSqls: [],
                notDeployedFlowList: [],
                flowListLoading: true,
                publish: '',
                versionLogPlaceholder: window.i18n.t('eg: 新增 XXX 功能\n    优化 XXX 功能\n    修复 XXX 功能\n')
            }
        },
        computed: {
            publishCom () {
                const comMap = {
                    'runningInfo': runningInfo,
                    'completedInfo': completedInfo
                }
                return comMap[this.publish]
            },
            projectId () {
                return this.$route.params.projectId
            },
            isSucVersion () {
                return this.versionForm.releaseType === 'HISTORY_VERSION'
            },
            isProjVersion () {
                return this.versionForm.releaseType === 'PROJECT_VERSION'
            },
            curProjVersionLog () {
                return this.projVersionList.find(item => item.id === this.versionForm.projVersionSelect)?.versionLog
            },
            curProjVersionId () {
                return this.projVersionList.find(item => item.id === this.versionForm.projVersionSelect)?.id
            },
            curProjVersion () {
                return this.projVersionList.find(item => item.id === this.versionForm.projVersionSelect)?.version
            },
            curSucReleaseVersionId () {
                return this.sucVersionList.find(item => item.version === this.versionForm.sucVersionSelect)?.id
            },
            sourceVersion () {
                if (this.isProjVersion) return this.curProjVersion
                if (this.isSucVersion) return this.versionForm.sucVersionSelect
                return ''
            },
            curReleaseVersion () {
                if (this.isProjVersion) return this.versionForm.releaseVersion
                if (this.isSucVersion) return this.versionForm.sucVersionSelect
                return ''
            },
            showAppAndModule () {
                const innerData = this.$refs.appModuleSelect && this.$refs.appModuleSelect.showAppAndModule
                return (innerData && innerData !== '/') ? innerData : `${this.currentAppInfo.appCode}/${this.currentAppInfo.moduleCode}`
            },
            releaseBtnDisabled () {
                return this.disabledRelease
                    || (this.isProjVersion && !!this.versionErrTips)
                    || (this.isProjVersion && this.versionForm.isCreateProjVersion && !this.versionForm.versionLog)
                    || !this.sourceVersion
                    || this.latestInfo.status === 'running'
            },
            showMobileTips () {
                return this.prodInfo.mobileUrl || this.stagInfo.mobileUrl
            },
            versionErrTips () {
                let tips = ''
                const version = this.versionForm.releaseVersion
                if (!version) {
                    tips = window.i18n.t('部署版本号必填')
                } else if (!/^[A-za-z0-9\-\.\_]{1,40}$/.test(version)) {
                    tips = window.i18n.t('仅支持英文、数字、下划线、中划线和英文句号')
                }
                return tips
            },
            versionLogErrTips () {
                let tips = ''
                const version = this.versionForm.versionLog
                if (version !== undefined && !version) {
                    tips = window.i18n.t('版本日志必填')
                }
                return tips
            },
            bindInfoTips () {
                return {
                    placement: 'top',
                    width: '284px',
                    content: window.i18n.t('必须绑定“源码管理”方式为“蓝鲸运维开发平台提供源码包”的蓝鲸应用模块')
                }
            },
            showReleaseTips () {
                return this.versionForm.releaseType === 'PROJECT_VERSION' && (this.releaseSqls.length || this.notDeployedFlowList.length)
            }
        },
        watch: {
            'latestInfo.status': {
                handler: function (val) {
                    if (val === 'running') {
                        this.checkDeployResult()
                        this.publish = 'runningInfo'
                    } else {
                        this.timer && clearInterval(this.timer)
                    }
                }
            }
        },
        async created () {
            await this.init()
        },
        destroyed () {
            this.timer && clearInterval(this.timer)
        },
        methods: {
            async getAppDetailInfo (appCode) {
                this.appDetail = await this.$store.dispatch('release/getAppDetailInfo', appCode)
            },
            async resetData () {
                const res = await this.$store.dispatch('release/detailInfo', {
                    projectId: this.projectId,
                    bindInfo: this.showAppAndModule
                })
                this.prodInfo = res.prodInfo || {}
                this.stagInfo = res.stagInfo || {}
                this.latestInfo = res.latestInfo || {}
                this.newVersionInfo = res.newVersionInfo || {}
                this.createLinkUrl = res.createLinkUrl
            },

            async init () {
                try {
                    this.isLoading = true
                    this.getProjVersionOptionList()
                    this.getSucVersionList()
                    const { appCode = '', moduleCode = '' } = await this.$store.dispatch('project/detail', { projectId: this.projectId }) || {}
                    this.currentAppInfo.appCode = appCode || ''
                    this.currentAppInfo.moduleCode = moduleCode || ''
                    await this.resetData()
                    this.getAppDetailInfo(appCode)
                    this.getReleaseSql()
                    this.getUnDeployedFlows()
                } catch (err) {
                    console.error(err)
                } finally {
                    this.isLoading = false
                }
            },
            async getProjVersionOptionList () {
                this.projVersionLoading = true
                const projVersionList = await this.$store.dispatch('release/getProjectVersionOptionList', {
                    projectId: this.projectId
                })
                const defaultVersion = {
                    id: -1,
                    version: window.i18n.t('默认'),
                    versionLog: ''
                }
                this.projVersionList = [defaultVersion].concat(projVersionList)
                this.projVersionLoading = false
            },
            async getSucVersionList () {
                this.sucVersionLoading = true
                this.sucVersionList = await this.$store.dispatch('release/getSucVersionList', {
                    projectId: this.projectId
                })
                this.sucVersionLoading = false
            },
            async getUnDeployedFlows () {
                try {
                    this.flowListLoading = true
                    const res = await this.$store.dispatch('nocode/flow/getFlowList', {
                        projectId: this.projectId
                    })
                    this.notDeployedFlowList = res.list.filter(item => item.deployed === 0)
                } catch (e) {
                    console.error(e)
                } finally {
                    this.flowListLoading = false
                }
            },
            toManagePage (pageUrl, showModule = true) {
                window.open(`${this.createLinkUrl}/apps/${this.currentAppInfo.appCode}${showModule ? '/' + this.currentAppInfo.moduleCode : ''}/${pageUrl}`, '_blank')
            },
            copy (value) {
                execCopy(value)
            },
            async release () {
                // this.showRunningLog = true
                if (this.releaseBtnDisabled) {
                    return false
                }
                try {
                    const { versionForm, projectId } = this
                    this.disabledRelease = true
                    const data = {
                        releaseForm: {
                            projectId,
                            env: versionForm.env,
                            status: 'running',
                            releaseType: versionForm.releaseType,
                            releaseVersionId: this.curSucReleaseVersionId, // 历史发布id
                            version: this.curReleaseVersion, // 基于应用版本为填写的部新版本号，基于历史包为历史部署版本号
                            versionId: this.curProjVersionId === -1 ? undefined : this.curProjVersionId, // 选择应用版本则为版本id值或者无
                            fromProjectVersion: this.curProjVersionId === -1 ? '' : this.curProjVersion, // 基于应用版本的版本号
                            versionLog: versionForm.versionLog,
                            bindInfo: this.showAppAndModule,
                            releaseSqlIds: this.releaseSqls.map(releaseSql => releaseSql.id).join(','),
                            isCreateProjVersion: versionForm.isCreateProjVersion
                        }
                    }
                    const res = await this.$store.dispatch('release/releaseProject', data)
                    if (res.deployment_id) {
                        this.$bkMessage({
                            theme: 'success',
                            message: window.i18n.t('部署任务执行中')
                        })
                        await this.resetData()
                        // 显示部署日志
                        this.publish = 'runningInfo'
                    }
                } catch (err) {
                    await this.resetData()
                } finally {
                    this.disabledRelease = false
                }
            },

            showLog (row) {
                if (row.status !== 'running') {
                    this.defaultContent = row.errorMsg || window.i18n.t('日志为空')
                    this.publish = 'completedInfo'
                } else {
                    this.publish = 'runningInfo'
                }
            },
            checkDeployResult () {
                this.timer && clearInterval(this.timer)
                this.timer = setInterval(() => {
                    this.getLatestDetail()
                }, 3000)
            },
            async getLatestDetail () {
                try {
                    if (this.latestInfo.deployId && this.latestInfo.status === 'running') {
                        const action = this.latestInfo.isOffline ? 'offlineResult' : 'detailFromV3'
                        let detail = await this.$store.dispatch(`release/${action}`, {   // eslint-disable-line
                            projectId: this.projectId,
                            deployId: this.latestInfo.deployId
                        })
                        if ((detail.status === 'running' || detail.status === 'pending')) {
                            // 如果超过30分钟，判定为失败
                            const tmpTime = this.latestInfo.createTime || this.latestInfo.updateTime
                            const createTime = dayjs(tmpTime).format('YYYY-MM-DD HH:mm:ss') || ''
                            const createTimeUnix = new Date(createTime).getTime()
                            const currentTimeUnix = new Date().getTime()
                            if ((currentTimeUnix - createTimeUnix) > 1800000) {
                                detail.status = 'failed'
                            }
                        }
                        if (detail.status && detail.status !== 'running' && detail.status !== 'pending') {
                            this.timer && clearInterval(this.timer)
                            const postData = {
                                id: this.latestInfo.id,
                                data: { status: detail.status }
                            }
                            await this.$store.dispatch('release/updateVersion', postData)
                            await this.resetData()
                            this.versionForm = defaultVersionFormData()
                            if (detail.status === 'successful') {
                                this.$bkMessage({
                                    theme: 'success',
                                    message: window.i18n.t('{0}成功', [this.typeMap[this.latestInfo.isOffline]])
                                })
                            } else if (detail.status === 'failed') {
                                this.$bkMessage({
                                    theme: 'error',
                                    message: window.i18n.t('{0}失败', [this.typeMap[this.latestInfo.isOffline]])
                                })
                            }
                        }
                    }
                } catch (err) {
                    console.error(err)
                }
            },
            async toggleOffline (isShow = true) {
                this.offlineEnv = ''
                this.showOffline = isShow
            },
            async confirmOffline () {
                try {
                    if (!this.offlineEnv) {
                        this.$bkMessage({
                            theme: 'error',
                            message: window.i18n.t('请先选择要下架的环境')
                        })
                        return
                    }
                    this.offlineLoading = true
                    const version = this.offlineEnv === 'prod' ? this.prodInfo.version : this.stagInfo.version
                    const offlineId = await this.$store.dispatch('release/offlineProject', {
                        projectId: this.projectId,
                        env: this.offlineEnv,
                        version
                    })
                    if (offlineId) {
                        await this.resetData()
                        this.toggleOffline(false)
                        this.$bkMessage({
                            theme: 'success',
                            message: window.i18n.t('下架中')
                        })
                    }
                } catch (err) {
                    this.$bkMessage({
                        theme: 'error',
                        message: err.message || err
                    })
                } finally {
                    this.offlineLoading = false
                }
            },
            toggleSucVersionList (isOpen) {
                if (isOpen) {
                    this.getSucVersionList()
                }
            },
            toggleProjVersionList (isOpen) {
                if (isOpen) {
                    this.getProjVersionOptionList()
                }
            },
            changeProjVersionList () {
                this.versionForm.versionLog = this.curProjVersionLog
            },
            getReleaseSql () {
                this.isLoadingReleaseSql = true
                return new Promise((resolve, reject) => {
                    if (this.versionForm.releaseType === 'HISTORY_VERSION') {
                        resolve([])
                    } else {
                        const releaseInfo = this.versionForm.env === 'stag' ? this.stagInfo : this.prodInfo
                        const postData = {
                            timeRange: [new Date(releaseInfo.createTime)],
                            projectId: this.projectId
                        }
                        this.$store.dispatch('dataSource/tableRecordList', postData).then((res) => {
                            resolve(res)
                        }).catch(reject)
                    }
                }).then((sqls) => {
                    this.releaseSqls = sqls
                }).catch((err) => {
                    this.releaseSqls = []
                    this.$bkMessage({ theme: 'error', message: err.message || err })
                }).finally(() => {
                    this.isLoadingReleaseSql = false
                })
            },
            showSql () {
                this.isShowReleaseSql = true
            },
            checkCom (comName) {
                this.publish = comName
            }
        }
    }
</script>

<style lang="postcss" module>
    .release-wrapper {
        min-height: 500px;
    
    .release-container {
        .title {
                font-weight: 700;
                font-size: 14px;
                color: #313238;
                font-weight: bold;
                margin-bottom: 17px;
            }
        .release-summary {
            min-width: 1030px;
            width: calc(100% - 52px);
            height: 140px;
            margin: 20px 24px;
            font-size: 12px;
            background: #FFFFFF;
            box-shadow: 0 2px 4px 0 #1919290d;
            border-radius: 2px;
            padding: 24px;
            .release-info {
                display: flex;
                align-items: center;
                margin-top: 17px;
                .label {
                    margin-right: 4px;
                    height: 26px;
                    font-size: 12px;
                    color: #979BA5;
                    line-height: 26px;
                    white-space: nowrap;
                }
                .info-tips {
                    color: orange;
                }
                .setting {
                        display: flex;
                        flex-direction: column;
                        margin-right: 80px;
                        color: #313238;
                    }
                .en-setting {
                    margin-right: 0;
                    width: 260px;
                }
                .latest-info {
                    display: flex;
                    flex-direction: column;
                    margin: 0 70px 0 40px;
                    max-width: 358px;
                        .link-detail a {
                            margin-right: 6px;
                            cursor: pointer;
                            color: #3a84ff;
                            &:hover {
                                 border-bottom: solid 1px #3a84ff
                        }
                    }
                }
                .en-latest-info {
                    margin:0;
                    width: 370px;
                }
            .operation{
                display: flex;
                align-items: center;
                height: 30px;
            }
            .seperate-line {
                border-left: 1px solid #DCDEE5;
                padding-left: 40px;
            }
            }
            .dropdown-trigger-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                border: 1px solid #c4c6cc;
                height: 28px;
                min-width: 68px;
                border-radius: 2px;
                padding: 0 8px 0 12px;
                color: #63656E;
                white-space: nowrap;
                .icon-size {
                    font-size: 18px;
                    margin-left: 4px;
                    
                }
                }
            }

            .offline-operate {
                .offline-btn {
                    margin-right: 20px;
                    height: 28px;
                }
            }
            .detail {
                line-height: 26px;
                height: 26px;
            }
        }

        .release-content {
            min-width: 1030px;
            width: calc(100% - 52px);
            margin: 20px 24px;
            font-size: 12px;
            background: #FFFFFF;
            box-shadow: 0 2px 4px 0 #1919290d;
            border-radius: 2px;
            padding: 24px;
            .release-form-info  {
                .last-version-tips {
                    margin-bottom: 16px;
                    min-height: 32px;
                    font-size: 12px;
                    min-width: 700px;
                    width: fit-content;
                    .tips-icon {
                        color: #3a84ff;
                        margin: 0 10px;
                    }
                    .tips-content {
                        .status-successful {
                            color: #2dcb56;
                        }
                        .status-failed {
                            color: #ea3636;
                        }
                    }
                    .latest-log-link {
                        color: #3a84ff;
                        cursor: pointer;
                    }
                }
                .release-form {
            
                    .release-tips {
                        color: #979ba5;
                        font-size: 12px;
                        margin-left: 18px;
                    }
                    & > div {
                        margin-bottom: 24px;
                    }
                    .last-version-tips {
                        margin-top: -20px;
                        display: flex;
                        align-items: center;
                        padding: 8px 0;
                    }
                    .type,
                    .form-item {
                        .form-label{
                            display: flex;
                            justify-content: space-between;
                            width: 700px;
                        }
                        .version-label {
                            line-height: 20px;
                            flex: none;
                            position: relative;
                            display:inline-block;
                            margin-bottom: 6px;
                        }
                    }
                
                        .version-type {

                        .icon {
                            font-size: 16px;
                        }
                    }
                    
                    .source-from {
                        margin-top: 24px;
                    }

                    &.is-source {
                        align-items: flex-start;
                    }
                }
                .release-btn {
                    display: flex;
                    align-items: center;
                }
                .required:after {
                    content: '*';
                    display: inline-block;
                    position: absolute;
                    top: 50%;
                    height: 8px;
                    line-height: 1;
                    font-size: 12px;
                    color: #ea3636;
                    transform: translate(3px, -50%);
                }
                .form-item {
                    .version-label {
                        &.is-proj-history {
                            font-weight: 700;
                        }
                    }
                    .version-err-tips {
                        top: 100%;
                        font-size: 12px;
                        color: red;
                        margin-top: 2px;
                    }
                }
                .version-table {
                    border-color: #ffdfac;
                    background-color: #fff4e2;
                    width: 700px;
                    .table-icon {
                        color: #ff9c01;
                        margin: 0 10px;
                    }
                    .table-link {
                        color: #3a84ff;
                        cursor: pointer;
                        margin-left: 3px;
                    }
                }
   
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
    .offline-env-div {
        display: flex;
        margin:  30px 0 10px;
        .offline-label {
            width: 100px;
        }
    }
    .loading-rotate {
        animation: icon-loading 1.5s linear infinite;
    }
    @keyframes icon-loading {
        to {
            transform:rotate(1turn);
        }
    }

    :global {
        .version-publish-log {
            align-items: stretch !important;
            .markdown-body {
                width: 720px;
                min-height: 290px !important;
                max-height: 320px;
                box-shadow: none !important;
                border: 1px solid #C4C6CC !important;
                border-radius: 2px;
                .auto-textarea-input {
                    min-height: 100px;

                    &::placeholder {
                        color: #C4C6CC;
                        font-size: 14px;
                    }
                }

                &.fullscreen {
                    width: 100%;
                    max-height: 100%;
                }
            }

            &.is-proj-history {
                width: 720px;
                padding: 12px;
                background: #fff;
                flex-direction: column;
                margin-left: 110px;

                .markdown-body {
                    min-height: auto !important;
                    width: 100%;
                    border: none !important;
                }
            }
        }

        .release-box {
            background: #e7fcfa;
            color: #979ba5;
            height: 55px;
            line-height: 55px;
            border-radius: 2px;
            padding: 0 10px;
            max-width: 1300px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .deploy-text{
                color: #313238;
                font-weight: 500;
            }
        }
        .failed-box{
            background: #ffecec;
        }
        .version-type {
                .bk-form-radio{
                    margin-top: 2px;
                    font-size: 12px;
                }
                .bk-radio-button-text {
                        width: 350px;
                        font-size: 12px;
                }
                .icon {
                        font-size: 16px;
                    }
                }
        }
    }
</style>
