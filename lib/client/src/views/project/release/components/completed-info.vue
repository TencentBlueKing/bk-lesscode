<template>
    <section v-bkloading="{ isLoading: isLoading, opacity: 1 }">
        <div v-show="!isLoading" :class="['deploy-status',{ 'deploy-success': deployStatus === 'successful','deploy-error': deployStatus === 'failed' }]">
            <i v-if="deployStatus === 'successful'" class="bk-drag-icon bk-drag-check-circle-fill icon-successful"></i>
            <i v-if="deployStatus === 'failed'" class="bk-drag-icon bk-drag-close-circle-fill icon-failed"></i>
            <div class="deploy-about-operate">
                <div class="deploy-type-info">
                    <p class="mr20">
                        <span v-html="getInfoTips(latestInfo,'running')"></span>
                    </p>
                    <p class="mr20">
                        <span>{{ $t('已耗时:') }}</span>
                        <span>{{totalTime}}</span>
                    </p>
                    <p class="mr20">
                        <span>{{ $t('操作人:') }}</span>
                        <span>{{createUser}}</span>
                    </p>
                </div>
                <bk-button size="small" @click="$emit('checkCom', '')">{{ $t('返回部署页') }}</bk-button>
            </div>
        </div>
        <div class="log-content">
            <div class="deploy-view">
                <div id="deploy-timeline-box" style="width: 300px; margin-right: 18px;background: #F5F7FA;"
                    v-bkloading="{ isLoading: isTimelineLoading, opacity: 1 }">
                    <deploy-timeline
                        :list="timeLineList"
                        :disabled="true"
                        class="deploy-timeline"
                        ext-cls="deploy-timeline-reset"
                        style="min-width: 268px;"
                        :width="268"
                        v-if="timeLineList.length">
                    </deploy-timeline>
                </div>
                <div class="deploy-container" v-if="content">
                    <deploying-type :deploying-info="lastStepSateInfo" :content="content" screenfull-class-name=".log-detail"></deploying-type>
                    <pre class="log-detail" v-html="content"></pre>
                    <div class="deploy-error-tips" v-if="latestInfo.errorMsg">
                        <p class="error-title">
                            <i class="bk-drag-icon bk-drag-close-circle-fill icon-error"></i>
                            <span>{{ $t('失败原因一') }}</span>
                        </p>
                        <p class="error-info">{{latestInfo.errorMsg}}</p>
                    </div>
                </div>
                <!-- <pre v-if="content" class="log-detail" v-html="content"></pre> -->
            </div>
        </div>
    </section>
</template>

<script>
    import deployTimeline from './deploy-timeline'
    import deployingType from './deploying-type.vue'
    import publishMixin from '../publish-mixin'
    export default {
        components: {
            deployTimeline,
            deployingType
        },
        mixins: [publishMixin],
        props: {
            deployStatus: {
                type: String,
                default: ''
            },
            deployId: {
                type: String,
                default: ''
            },
            defaultContent: {
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
            createUser: {
                type: String,
                default: 'admin'
            },
            latestInfo: {
                type: Object
            }
        },
        data () {
            return {
                isLoading: true,
                isTimelineLoading: false,
                content: '',
                timeLineList: [],
                totalTime: '',
                lastStepSateInfo: {}
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },
        watch: {
            currentAppInfo: {
                handler (v) {
                    this.appCode = v.appCode
                    this.curModuleId = v.moduleCode
                    if (this.appCode && this.curModuleId) {
                        this.getDeployTimeline()
                    }
                },
                immediate: true,
                deep: true
            },
            env: {
                handler (v) {
                    this.environment = v
                    if (this.environment) {
                        this.getDeployTimeline()
                    }
                },
                immediate: true,
                deep: true
            }
        },
        created () {
            if (this.deployId) {
                this.isLoading = true
                this.getDeployTimeline()
                this.getLogs()
            } else {
                this.content = this.defaultContent
                this.isLoading = false
            }
        },
        methods: {
            async getDeployTimeline (params) {
                if (!this.appCode || !this.curModuleId || !this.environment) return
                if (this.isTimelineLoading) {
                    return false
                }

                this.isTimelineLoading = true
                try {
                    const res = await this.$store.dispatch('release/deployPhaseResult', {
                        appCode: this.appCode,
                        moduleId: this.curModuleId,
                        env: this.environment,
                        deployId: this.deployId || ''
                    })
                    const timeLineList = []
                    let lastTime = ''
                    let lastStepState = {}
                    res.forEach(stageItem => {
                        timeLineList.push({
                            name: stageItem.type,
                            tag: stageItem.display_name,
                            content: this.computedDeployTimelineTime(stageItem.start_time, stageItem.complete_time),
                            status: stageItem.status || 'default',
                            stage: stageItem.type
                        })

                        stageItem.steps.forEach(stepItem => {
                            timeLineList.push({
                                name: stepItem.name,
                                tag: stepItem.name,
                                content: this.computedDeployTimelineTime(stepItem.start_time, stepItem.complete_time),
                                status: stepItem.status || 'default',
                                parentStage: stageItem.type
                            })
                            if (stepItem.complete_time) {
                                lastTime = stepItem.complete_time
                            }
                            if (['successful', 'failed'].includes(stepItem.status)) {
                                lastStepState = stepItem
                            }
                        })
                    })
                    this.lastStepSateInfo = lastStepState
                    this.totalTime = this.computedDeployTimelineTime(res[0].start_time, lastTime)
                    this.timeLineList = timeLineList
                } catch (e) {
                    this.timeLineList = []
                } finally {
                    this.isTimelineLoading = false
                }
            },
            async getLogs () {
                try {
                    this.isLoading = true
                    const res = await this.$store.dispatch('release/detailFromV3', {
                        projectId: this.projectId,
                        deployId: this.deployId
                    })
                    this.content = res.logs || window.i18n.t(window.i18n.t('v3部署日志为空'))
                } catch (err) {
                    this.content = window.i18n.t('日志加载异常\n')
                    this.content += err.message || err
                } finally {
                    this.isLoading = false
                }
            },

            computedDeployTimelineTime (startTime, endTime) {
                if (!startTime || !endTime) {
                    return '--'
                }

                const start = (new Date(startTime).getTime()) / 1000
                const end = (new Date(endTime).getTime()) / 1000
                const interval = Math.ceil(end - start)

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

        .deploy-status  {
            display: flex;
            align-items: center;
            height: 42px;
            padding-left: 18px;
            border-radius: 2px;
            font-size: 12px;
                .icon-successful {
                    font-size: 18px;
                    color: #2dcb56;
                }
                .icon-failed {
                    font-size: 18px;
                    color: #ea3636;
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
            margin-left: 9px;
            .deploy-type-info {
                display: flex;
                align-items: center;
                justify-content: space-between;
                min-width: 480px;
                border-right: 1px solid #C4C6CC;
                margin-right: 20px;
                padding-right: 20px;
                .mr20 {
                    margin-right: 20px;
                }
        }
        }
    
    .log-content {
        height: 100%;
        min-height: 500px;
        padding: 16px 0px;
        pre {
            white-space: pre-wrap;
            white-space: -moz-pre-wrap;
            white-space: -pre-wrap;
            white-space: -o-pre-wrap;
            word-wrap: break-word;
        }
        .deploy-container{
            flex: 1;
            color: #fff;
            font-size: 12px;
            .deploy-error-tips {
                width: 100%;
                min-height: 68px;
                background: #2E2E2E;
                border-radius: 0 0 2px 2px;
                bottom: 0;
                left: 0;
                color: #DCDEE5;
                font-size: 12px;
                line-height: 22px;
                padding:8px 0 8px 15px;
                border-top:2px transparent solid;
                border-left: 4px solid #B34747;
            .error-title {
                .icon-error {
                    font-size: 12px;
                    color: #B34747;
                    margin-right: 6px;
                }
            }
            .error-info {
                margin-left: 20px;
            }
            
         }
        }
        .log-detail {
            padding: 0 20px 20px 20px;
            line-height: 20px;
            overflow-y: scroll;
            word-wrap:break-word;
            background: #242424;
            margin: 0;
            height: calc(100vh - 336px);
            &::-webkit-scrollbar {
                width: 14px;
                background: #2E2E2E;
                border-left: 1px solid #3D3D3D;
            }
            &::-webkit-scrollbar-thumb {
                width: 100%;
                background: #3B3C42;
                border: 1px solid #63656E;
                border-radius: 1px;
            }
        }

        .deploy-view {
            display: flex;
            height: 100%;
            margin: 0;
            align-items: stretch;
            font-size: 14px;
            .deploy-timeline {
                margin: 16px;
            }

            .pre-deploy-detail {
                flex: 1;
                background: #f5f6fa;
                border-radius: 2px;
                padding: 30px;
                margin-left: 20px;
                max-width: 1050px;
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
        }
    }
</style>
