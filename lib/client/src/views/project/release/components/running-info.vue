<template>
    <section class="deploy" v-bkloading="{ isLoading: isLoading, opacity: 1 }">
        <div v-show="!isLoading" :class="['deploy-status',{ 'deploy-running': deployStatus === 'running','deploy-success': deployStatus === 'successful','deploy-error': deployStatus === 'failed' }]">
            <span class="svg-icon">
                <svg v-if="deployStatus === 'running'" aria-hidden="true" width="18" style="fill: #3A84FF;" height="18" class="loading-rotate">
                    <use xlink:href="#bk-drag-loading-2"></use>
                </svg>
                <i v-if="deployStatus === 'successful'" class="bk-drag-icon bk-drag-check-circle-fill icon-successful"></i>
                <i v-if="deployStatus === 'failed'" class="bk-drag-icon bk-drag-close-circle-fill icon-failed"></i>
            </span>
            <div class="deploy-about-operate">
                <div :class="['deploy-type-info', { 'deploy-type-line': deployStatus !== 'running' }]">
                    <p class="mr20">
                        <span v-html="getInfoTips(latestInfo, 'running')"></span>
                    </p>
                    <p class="mr20">
                        <span>{{$t('已耗时:')}}</span>
                        <span>{{ totalTime}}</span>
                    </p>
                    <p class="mr20">
                        <span>{{$t('操作人:')}}</span>
                        <span>{{createUser}}</span>
                    </p>
                </div>
                <bk-button size="small" v-if="deployStatus === 'successful' || deployStatus === 'failed'" @click="$emit('checkCom', '')">{{$t('返回部署页')}}</bk-button>
            </div>
        </div>
        <div class="log-content" v-bkloading="{ isLoading: isLoading, opacity: 0 }">
            <div class="deploy-view" :style="{ 'margin-top': `${isScrollFixed ? '104px' : '0'}` }" v-show="!isLoading">
                <div id="deploy-timeline-box" style="width: 300px;background: #F5F7FA;padding: 26px 16px">
                    <deploy-timeline
                        ref="deployTimelineRef"
                        :list="timeLineList"
                        :stage="curDeployStage"
                        :key="timelineComKey"
                        :disabled="true"
                        ext-cls="deploy-timeline-reset"
                        @select="handleTimelineSelect">
                    </deploy-timeline>
                </div>
                <deploy-log
                    ref="deployLogRef"
                    :build-list="streamLogs"
                    :ready-list="readyLogs"
                    :process-list="allProcesses"
                    :state-process="appearDeployState"
                    :process-loading="processLoading"
                    :current-app-info="currentAppInfo"
                    :environment="environment"
                    :list="timeLineList"
                    :latest-info="latestInfo"
                    v-if="isWatchDeploying || isDeploySuccess || isDeployFail || isDeployInterrupted || isDeployInterrupting">
                </deploy-log>
                <div class="pre-deploy-detail" v-else-if="curTimeline">
                    <div class="metadata-card" v-for="metadata of curTimeline.displayBlocks" :key="metadata.key">
                        <strong class="card-title">
                            {{metadata.name}}
                            <router-link
                                class="card-edit"
                                v-bk-tooltips="metadata.name === $t('访问地址') ? $t('查看') : $t('配置')"
                                v-if="metadata.routerName "
                                :to="{ name: metadata.routerName, params: { id: appCode, moduleId: curModuleId } }">
                            </router-link>
                        </strong>
                        <ul class="card-list">
                            <li class="card-item" v-for="(item, index) of metadata.infos" :key="index">
                                <template v-if="metadata.type === 'key-value'">
                                    <div class="card-key">{{item.text}}：</div>
                                    <template v-if="Array.isArray(item.value)">
                                        <div class="card-value" v-if="item.value.length">
                                            <span class="card-value-item mr5" v-for="(subItem, subIndex) of item.value" :key="subIndex">
                                                <router-link :to="subItem.route">
                                                    {{subItem.name}}
                                                </router-link>
                                            </span>
                                        </div>
                                        <div class="card-value" v-else>{{ $t('无') }}</div>
                                    </template>
                                    <template v-else>
                                        <div class="card-value">
                                            {{item.value || $t('无')}}
                                            <span v-if="item.value && item.href"><a target="_blank" :href="item.href" style="color: #3a84ff">{{item.hrefText}}</a></span>
                                            <a class="ml5" href="javascript: void(0);" v-if="item.downloadBtn" @click="item.downloadBtn">{{item.downloadBtnText}}</a>
                                        </div>
                                    
                                    </template>
                                </template>
                                <template v-else>
                                    <a :href="item.value" target="_blank">{{item.text}}</a>
                                </template>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<script>
    import deployTimeline from './deploy-timeline'
    import deployLog from './deploy-log'
    import moment from 'moment'
    import publishMixin from '../publish-mixin'
    export default {
        components: {
            deployTimeline,
            deployLog
        },
        mixins: [publishMixin],
        props: {
            isShow: {
                type: Boolean,
                default: false
            },
            deployId: {
                type: String,
                default: ''
            },
            currentAppInfo: {
                type: Object,
                default () {
                    return {}
                }
            },
            env: {
                type: String,
                default: 'stag'
            },
            deployStatus: {
                type: String,
                default: 'running'
            },
            createUser: {
                type: String,
                default: 'admin'
            },
            latestInfo: {
                type: Object,
                default: () => {
                    return {}
                }
            }
        },
        data () {
            return {
                logs: [],
                isLoading: true,
                status: 'running',
                content: '',
                timer: null,
                timeLineList: [],
                isScrollFixed: false,
                timelineComKey: -1,
                isWatchDeploying: false,
                isDeploySuccess: false,
                isDeployFail: false,
                isDeployInterrupted: false,
                isDeployInterrupting: false,
                curTimeline: {
                    displayBlocks: []
                },
                appCode: '',
                curModuleId: '',
                environment: '',
                appearDeployState: [],
                deployStartTimeQueue: [],
                deployEndTimeQueue: [],
                streamLogs: [],
                readyLogs: [],
                allProcesses: [],
                processLoading: false,
                eventSourceState: {
                    CLOSED: 2
                },
                isLogError: false,
                ansiUp: null,
                serverProcessEvent: null,
                link: '',
                processLoadingLocal: false,
                totalTime: ''
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            },
            curDeployStage () {
                const flag = this.isWatchDeploying || this.isDeploySuccess || this.isDeployFail || this.isDeployInterrupted || this.isDeployInterrupting
                return flag ? 'deploy' : 'noDeploy'
            }
        },
        watch: {
            isWatchDeploying () {
                this.$nextTick(() => {
                    this.computedBoxFixed()
                })
            },
            currentAppInfo: {
                handler (v) {
                    this.appCode = v.appCode
                    this.curModuleId = v.moduleCode
                    if (this.appCode && this.curModuleId) {
                        this.getPreDeployDetail()
                    }
                },
                immediate: true,
                deep: true
            },
            env: {
                handler (v) {
                    this.environment = v
                    if (this.environment) {
                        this.getPreDeployDetail()
                    }
                },
                immediate: true,
                deep: true
            }
        },
        mounted () {
            // 初始化日志彩色组件
            const AU = require('ansi_up')
            // eslint-disable-next-line
            this.ansiUp = new AU.default
        },
        async created () {
            this.isLoading = true
            if (this.deployId) {
                this.getLogs()
                this.loopLogs()
            } else {
                this.content = window.i18n.t('暂无部署日志')
            }
        },
        beforeDestroy () {
            window.onscroll = null
            this.clearPrevDeployData()
        },
        methods: {
            loopLogs () {
                this.timer && clearInterval(this.timer)
                this.timer = setInterval(() => {
                    this.getLogs()
                }, 3000)
            },
            async getLogs () {
                this.timelineComKey = +new Date()
                this.streamPanelShowed = true
                this.isWatchDeploying = true
                this.isDeploySseEof = false
                try {
                    this.content = ''
                    const res = await this.$store.dispatch('release/getRunningLog', {
                        projectId: this.projectId,
                        deployId: this.deployId
                    })
                    this.logs = res.logs || []
                    this.status = res.status
                    this.$emit('handleReleaseStatus', this.status)
                    this.logs.forEach(logItem => {
                        if (logItem.event === 'msg') {
                            const data = JSON.parse(logItem.data)
                            if (this.isDeployReady) {
                                this.appearDeployState.push('preparation')
                                this.$nextTick(() => {
                                    this.$refs.deployTimelineRef && this.$refs.deployTimelineRef.editNodeStatus('preparation', 'pending', '')
                                    this.$refs.deployLogRef && this.$refs.deployLogRef.inProgressStatus('preparation', 'pending', this.status)
                                    this.readyLogs.push(this.ansiUp.ansi_to_html(data.line))
                                })
                            } else {
                                if (!this.streamLogs.includes(this.ansiUp.ansi_to_html(data.line))) {
                                    this.streamLogs.push(this.ansiUp.ansi_to_html(data.line))
                                }
                            }
                        }

                        if (logItem.event === 'phase') {
                            const data = JSON.parse(logItem.data)
                            if (data.name === 'build') {
                                this.isDeployReady = false
                            }

                            if (['build', 'preparation'].includes(data.name)) {
                                this.appearDeployState.push(data.name)
                            }

                            let content = ''
                            if (data.status === 'successful') {
                                this.deployStartTimeQueue.push(data.start_time)
                                this.deployEndTimeQueue.push(data.complete_time)
                            }
                            
                            if (data.name === 'release' && ['failed', 'successful'].includes(data.status)) {
                                content = this.computedDeployTime(data.start_time, data.complete_time)
                                this.totalTime = this.computedDeployTime(this.deployStartTimeQueue[0], data.complete_time)
                            }

                            if (data.name === 'release' && data.status === 'successful') {
                                // 部署成功
                                this.$emit('handleReleaseStatus', 'successed')
                                this.isDeploySuccess = true
                                this.isWatchDeploying = false
                            } else if (data.status === 'failed') {
                                // 部署失败
                                this.$emit('handleReleaseStatus', 'failed')
                                this.isDeployFail = true
                                this.isWatchDeploying = false
                            } else if (data.status === 'interrupted') {
                                // 停止部署成功
                                this.isDeployInterrupted = true
                                this.isWatchDeploying = false
                                this.isDeployInterrupting = false
                            }
                            this.$nextTick(() => {
                                this.$refs.deployTimelineRef && this.$refs.deployTimelineRef.editNodeStatus(data.name, data.status, content)
                                this.$refs.deployLogRef && this.$refs.deployLogRef.inProgressStatus(data.name, data.status, this.status)
                            })
                        }

                        if (logItem.event === 'step') {
                            const data = JSON.parse(logItem.data)
                            let content = ''
                            if (data.name === window.i18n.t('检测部署结果') && data.status === 'pending') {
                                this.appearDeployState.push('release')
                                this.releaseId = data.release_id
                                this.getProcessList(data.release_id, !this.processLoadingLocal)
                                this.$nextTick(() => {
                                    this.$refs.deployLogRef && this.$refs.deployLogRef.handleScrollToLocation('release')
                                })
                            }

                            if (['failed', 'successful'].includes(data.status)) {
                                content = this.computedDeployTime(data.start_time, data.complete_time)
                                this.totalTime = this.computedDeployTime(this.deployStartTimeQueue[0], data.complete_time)
                            }

                            this.$refs.deployTimelineRef && this.$refs.deployTimelineRef.editNodeStatus(data.name, data.status, content)
                            this.$refs.deployLogRef && this.$refs.deployLogRef.inProgressStatus(data.name, data.status, this.status)
                        }
                    })
                    if (res.status === 'end') {
                        this.timer && clearInterval(this.timer)
                    }
                } catch (err) {
                    this.content = window.i18n.t('日志加载异常,请刷新重试\n')
                    this.content += err.message || err
                } finally {
                    this.isLoading = false
                }
            },

            // 获取进程列表
            async getProcessList (releaseId, isLoading = false) {
                this.processLoading = isLoading
                if (this.processLoading) {
                    this.processLoadingLocal = this.processLoading
                }
                try {
                    const res = await this.$store.dispatch('release/processListResult', {
                        appCode: this.appCode,
                        moduleId: this.curModuleId,
                        env: this.environment
                    })
                    this.formatProcesses(res)
                } catch (e) {
                    // 无法获取进程目前状态
                    console.error(e)
                } finally {
                    this.processLoading = false
                }
            },

            // 对数据进行处理
            formatProcesses (processesData) {
                const allProcesses = []

                // 保存上次的版本号
                this.prevProcessVersion = processesData.processes.metadata.resource_version
                this.prevInstanceVersion = processesData.instances.metadata.resource_version

                // 遍历进行数据组装
                const extraInfos = processesData.processes.extra_infos
                const packages = processesData.process_packages
                const instances = processesData.instances.items

                processesData.processes.items.forEach(processItem => {
                    const type = processItem.type
                    const version = processItem.version.toString()
                    const extraInfo = extraInfos.find(item => item.type === type)
                    const packageInfo = packages.find(item => item.name === type)

                    const processInfo = {
                        ...processItem,
                        ...packageInfo,
                        ...extraInfo,
                        instances: []
                    }

                    instances.forEach(instance => {
                        if (instance.process_type === type && instance.version === version) {
                            processInfo.instances.push(instance)
                        }
                    })

                    // 作数据转换，以兼容原逻辑
                    const process = {
                        name: processInfo.name,
                        instance: processInfo.instances.length,
                        instances: processInfo.instances,
                        targetReplicas: processInfo.target_replicas,
                        isStopTrigger: false,
                        targetStatus: processInfo.target_status,
                        isActionLoading: false, // 用于记录进程启动/停止接口是否已完成
                        maxReplicas: processInfo.max_replicas,
                        status: 'Stopped',
                        cmd: processInfo.command,
                        desired_replicas: processInfo.replicas,
                        available_instance_count: processInfo.success,
                        failed: processInfo.failed,
                        resourceLimit: processInfo.resource_limit,
                        clusterLink: processInfo.cluster_link

                    }

                    this.$set(process, 'expanded', false)

                    // 日期转换
                    process.instances.forEach(item => {
                        item.date_time = moment(item.start_time).startOf('minute').fromNow()
                    })

                    allProcesses.push(process)
                })
                this.allProcesses = JSON.parse(JSON.stringify(allProcesses))
            },

            clearPrevDeployData () {
                this.branchList = []
                this.commitsList = []
                this.branchSelection = ''
                this.appMarketPublished = false
                this.handleClearDeploy()
                clearTimeout(this.timer)
                clearInterval(this.offlineTimer)
            },

            handleClearDeploy () {
                this.isWatchDeploying = false
                this.isWatchOfflineing = false
                this.isDeploySuccess = false
                this.isDeployFail = false
                this.isDeployInterrupted = false
                this.isDeployInterrupting = false
                this.isDeploySseEof = true

                // 清空成本参数
                // this.costConf.enable = false
                // this.costConf.hour = ''
                // this.costConf.minute = ''

                this.deployStartTimeQueue = []
                this.deployEndTimeQueue = []
                this.streamLogs = []
                this.deployTotalTime = 0

                // 重置状态
                this.$refs.deployTimelineRef && this.$refs.deployTimelineRef.handleResetStatus()
            },

            // log methods
            computedBoxFixed () {
                const box = document.querySelector('.deploy-action-box')
                // const box = document.getElementById('deploying-box') || document.getElementById('offlineing-box') || document.getElementById('success-box') || document.getElementById('fail-box')
                if (box && box.getBoundingClientRect) {
                    const elementRect = box.getBoundingClientRect()
                    this.summaryOffsetLeft = elementRect.x
                    this.summaryOffsetTop = elementRect.y
                    this.summaryWidth = elementRect.width
                }
            },

            handleTimelineSelect (timelineData) {
                this.curTimeline = timelineData

                if (this.appearDeployState.includes(timelineData.stage)) {
                    this.$refs.deployLogRef && this.$refs.deployLogRef.handleScrollToLocation(timelineData.stage)
                }
            },

            /**
             * 获取部署前各阶段详情
             */
            async getPreDeployDetail () {
                if (!this.appCode || !this.curModuleId || !this.environment) return
                this.isLoading = true
                try {
                    const res = await this.$store.dispatch('release/deployPhaseResult', {
                        appCode: this.appCode,
                        moduleId: this.curModuleId,
                        env: this.environment,
                        deployId: ''
                    })
                    const timeLineList = []
                    res.forEach(stageItem => {
                        timeLineList.push({
                            // name: 部署阶段的名称
                            name: stageItem.type,
                            // tag: 部署阶段的展示名称
                            tag: stageItem.display_name,
                            // content: 完成时间
                            content: '',
                            // status: 部署阶段的状态
                            status: 'default',
                            displayBlocks: this.formatDisplayBlock(stageItem.display_blocks),
                            // stage: 部署阶段类型, 仅主节点有该字段
                            stage: stageItem.type,
                            // sse没返回子进程的状态时强行改变当前的进程状态为 pending 的标识
                            loading: false
                        })

                        stageItem.steps.forEach(stepItem => {
                            timeLineList.push({
                                // name: 部署阶段的名称
                                name: stepItem.name,
                                // tag: 部署阶段的展示名称
                                tag: stepItem.display_name,
                                // content: 完成时间
                                content: '',
                                // status: 部署阶段的状态
                                status: 'default',
                                parent: stageItem.display_name,
                                parentStage: stageItem.type
                            })
                        })
                    })
                    this.timeLineList = timeLineList
                } catch (e) {
                    this.$bkMessage({
                        theme: 'error',
                        message: e.detail || e.message
                    })
                } finally {
                    this.isLoading = false
                }
            },

            formatDisplayBlock (displays) {
                const displayBlocks = []
                const keys = Object.keys(displays)
                for (const key of keys) {
                    const sourceInfo = [
                        {
                            text: window.i18n.t('类型'),
                            value: displays[key].display_name
                        },
                        {
                            text: window.i18n.t('地址'),
                            value: displays[key].repo_url
                        }
                    ]
                    if (displays[key].source_dir) {
                        sourceInfo.push({
                            text: window.i18n.t('部署目录'),
                            value: displays[key].source_dir
                        })
                    }
                    
                    sourceInfo.push({
                        text: window.i18n.t('源码管理'),
                        value: window.i18n.t('蓝鲸运维开发平台提供源码包')
                    })

                    switch (key) {
                        // 源码信息
                        case 'source_info':
                            displayBlocks.push({
                                name: window.i18n.t('源码信息'),
                                type: 'key-value',
                                routerName: 'moduleManage',
                                key: key,
                                infos: sourceInfo
                            })
                            break

                        // 增强服务
                        case 'services_info':
                            displayBlocks.push({
                                name: window.i18n.t('增强服务'),
                                type: 'key-value',
                                key: key,
                                infos: [
                                    {
                                        text: window.i18n.t('启用未创建'),
                                        value: displays[key].filter(item => !item.is_provisioned).map(item => item.display_name).join(', ')
                                    },
                                    {
                                        text: window.i18n.t('已创建实例'),
                                        value: displays[key].filter(item => item.is_provisioned).map(item => {
                                            return {
                                                name: item.display_name,
                                                route: {
                                                    name: 'appServiceInner',
                                                    params: {
                                                        id: this.appCode,
                                                        service: item.service_id,
                                                        category_id: item.category_id
                                                    }
                                                }
                                            }
                                        })
                                    }
                                ]
                            })
                            break

                        // 运行时的信息
                        case 'runtime_info':
                            displayBlocks.push({
                                name: window.i18n.t('运行时信息'),
                                type: 'key-value',
                                routerName: 'appEnvVariables',
                                key: key,
                                infos: [
                                    {
                                        text: window.i18n.t('基础镜像'),
                                        value: displays[key].image
                                    },
                                    {
                                        text: window.i18n.t('构建工具'),
                                        value: displays[key].buildpacks.map(item => item.display_name).join(', ')
                                    }
                                ]
                            })
                            break

                        // 访问地址
                        case 'access_info':
                            displayBlocks.push({
                                name: window.i18n.t('访问地址'),
                                type: 'key-value',
                                routerName: 'appEntryConfig',
                                key: key,
                                infos: [
                                    {
                                        text: window.i18n.t('当前类型'),
                                        value: window.i18n.t('子路径')
                                    },
                                    {
                                        text: window.i18n.t('访问地址'),
                                        value: displays[key].address
                                    }
                                ]
                            })
                            break

                        // 帮助文档
                        case 'prepare_help_docs':
                        case 'build_help_docs':
                        case 'release_help_docs':
                            displayBlocks.push({
                                name: window.i18n.t('帮助文档'),
                                type: 'link',
                                key: key,
                                infos: displays[key].map(doc => {
                                    return {
                                        text: doc.name,
                                        value: doc.link
                                    }
                                })
                            })
                            this.link = (displays['prepare_help_docs'] && displays['prepare_help_docs'][0].link) || this.link
                            this.curTimeline.displayBlocks = [
                                {
                                    name: window.i18n.t('帮助文档'),
                                    type: 'link',
                                    key: 'default',
                                    infos: [
                                        {
                                            text: window.i18n.t('应用进程概念介绍以及如何使用'),
                                            value: this.link
                                        },
                                        {
                                            text: window.i18n.t('应用内部进程通信指南'),
                                            value: this.link
                                        }
                                    ]
                                }
                            ]
                            break
                    }
                }
                return displayBlocks
            },
            /**
             * 计算部署进程间的所花时间
             */
            computedDeployTime (startTime, endTime) {
                const start = new Date(startTime).getTime()
                const end = new Date(endTime).getTime()
                const interval = (end - start) / 1000

                if (!interval) {
                    return '< 1s'
                }

                return this.getDisplayTime(interval)
            },

            getDisplayTime (payload) {
                let theTime = payload
                if (theTime < 1) {
                    return '< 1s'
                }
                let middle = 0
                let hour = 0

                if (theTime > 60) {
                    middle = parseInt(theTime / 60, 10)
                    theTime = parseInt(theTime % 60, 10)
                    if (middle > 60) {
                        hour = parseInt(middle / 60, 10)
                        middle = parseInt(middle % 60, 10)
                    }
                }

                let result = ''

                if (theTime > 0) {
                    result = `${theTime}s`
                }
                if (middle > 0) {
                    result = `${middle}m${result}`
                }
                if (hour > 0) {
                    result = `${hour}h${result}`
                }

                return result
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .deploy{

        .deploy-status  {
            display: flex;
            align-items: center;
            height: 42px;
            margin-bottom: 16px;
            padding-left: 18px;
            border-radius: 2px;
            font-size: 12px;
            .svg-icon {
                height: 18px;
                width: 18px;
                margin-right: 9px;
                font-size: 18px;
                line-height: 18px;
                .icon-successful {
                    color: #2dcb56;
                }
                .icon-failed {
                    color: #ea3636;
                }
            }
        }
        .deploy-running {
            background: #EAEBF0;
            border-radius: 2px;
            display: flex;
            align-items: center;
            padding: 0 17px;
        
        }
        .deploy-success {
            background: #F2FFF4;
            border: 1px solid #2DCB56;
        }
        .deploy-error {
            background: #FFEEEE;
            border: 1px solid #EA3636;
        }
        .deploy-about-operate{
            display: flex;
            align-items: center;
            .deploy-type-info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 480px;
                margin-right: 20px;
                .mr20 {
                    margin-right: 20px;
                }
             }
            .deploy-type-line  {
                border-right: 1px solid #C4C6CC;
            }
        }
    .log-content {
        height: 100%;
        min-height: 500px;
        line-height: 16px;
        font-size: 12px;
        .log-title {
            font-weight: bold;
            margin: 5px 0;
        }
        .log-msg {
            color: #63656e;
            margin: 5px 0;
        }
        .log-loading-div {
            margin-top: 10px;
        }

        .deploy-view {
            display: flex;
            height: 100%;
            align-items: stretch;
            font-size: 14px;

            .pre-deploy-detail {
                flex: 1;
                background: #f5f6fa;
                border-radius: 2px;
                margin-left: 20px;
            }

            .metadata-card {
                border-bottom: 1px solid #DCDEE5;
                margin-bottom: 22px;
                padding-bottom: 10px;

                &:last-child {
                    border-bottom: none;
                }

                .card-title {
                    font-size: 14px;
                    font-weight: 700;
                    text-align: left;
                    color: #63656e;
                    margin-bottom: 14px;
                    display: block;
                }

                .card-edit {
                    font-size: 12px;
                    font-weight: bold;
                    color: #3A84FF;
                    margin-left: 12px;
                    cursor: pointer;
                }

                .card-list {
                    line-height: 1;

                    .card-item {
                        margin-bottom: 12px;
                        display: flex;
                        a {
                            color: #3A84FF;
                        }
                    }
                    .card-key,
                    .card-value {
                        color: #63656E;
                        display: inline-block;
                        padding-right: 8px;
                        white-space: nowrap;
                        line-height: 16px;
                    }

                    .card-value {
                        white-space: normal;
                        word-break: break-all;
                        flex: 1;

                        .card-value-item {
                            &:not(:last-child) {
                                &::after {
                                    content: ', '
                                }
                            }
                        }
                    }
                }
            }
            .lesscode-timeline-icon {
                background: #F5F7FA;
                border-top: 2px solid #F5F7FA;
                border-bottom: 2px solid #F5F7FA;
        }
        }
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
</style>
