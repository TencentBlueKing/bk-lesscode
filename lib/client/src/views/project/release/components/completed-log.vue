<template>
    <section>
        <bk-sideslider
            :is-show.sync="isShow"
            :quick-close="true"
            :title="$t('部署日志')"
            :width="920"
            :before-close="handleClose"
        >
            <div slot="header">
                <i v-if="status === 'successful'" class="bk-drag-icon bk-drag-check-circle-fill icon-successful"></i>
                <i v-if="status === 'failed'" class="bk-drag-icon bk-drag-close-circle-fill icon-failed"></i>
                {{ logTitle }}
            </div>
            <div class="log-content" slot="content" v-bkloading="{ isLoading: isLoading, opacity: 1 }">
                <div class="deploy-view">
                    <div id="deploy-timeline-box" style="width: 250px; margin-right: 10px;"
                        v-bkloading="{ isLoading: isTimelineLoading, opacity: 1 }">
                        <deploy-timeline
                            :list="timeLineList"
                            :disabled="true"
                            class="mt20 ml15 mr15"
                            style="min-width: 230px;"
                            v-if="timeLineList.length">
                        </deploy-timeline>
                    </div>
                    <div class="deploy-container" v-if="content">
                        <bk-alert style="margin: 0px; border-radius: 0;" type="warning" :title="$t('仅展示准备阶段、构建阶段日志')"></bk-alert>
                        <pre class="log-detail" v-html="content"></pre>
                    </div>
                    <!-- <pre v-if="content" class="log-detail" v-html="content"></pre> -->
                </div>
            </div>
        </bk-sideslider>
    </section>
</template>

<script>
    import deployTimeline from './deploy-timeline'
    export default {
        components: {
            deployTimeline
        },
        props: {
            status: {
                type: String,
                default: ''
            },
            isShow: {
                type: Boolean,
                default: false
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
            }
        },
        data () {
            return {
                isLoading: false,
                isTimelineLoading: false,
                content: '',
                timeLineList: []
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            },
            logTitle () {
                const envName = this.env === 'stag' ? window.i18n.t('预发布') : window.i18n.t('生产环境')
                return this.status === 'successful' ? envName + window.i18n.t('环境部署成功') : (this.status === 'failed' ? envName + window.i18n.t('环境部署失败') : window.i18n.t('部署日志'))
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
                        })
                    })
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
                    this.content = res.logs || window.i18n.t('v3部署日志为空')
                } catch (err) {
                    this.content = window.i18n.t('日志加载异常\n')
                    this.content += err.message || err
                } finally {
                    this.isLoading = false
                }
            },
            handleClose () {
                this.$emit('closeLog')
            },

            computedDeployTimelineTime (startTime, endTime) {
                if (!startTime || !endTime) {
                    return '--'
                }

                const start = (new Date(startTime).getTime()) / 1000
                const end = (new Date(endTime).getTime()) / 1000
                const interval = Math.ceil(end - start)

                if (!interval) {
                    return '<' + window.i18n.t('1秒')
                }

                return this.getDisplayTime(interval)
            },

            getDisplayTime (payload) {
                let theTime = payload
                if (theTime < 1) {
                    return '<' + window.i18n.t('1秒')
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
                    result = window.i18n.t('{0}秒', [theTime])
                }
                if (middle > 0) {
                    result = window.i18n.t('{0}分{1}', [middle, result])
                }
                if (hour > 0) {
                    result = window.i18n.t('{0}时{1}', [hour, result])
                }

                return result
            }

        }
    }
</script>

<style lang="postcss" scoped>
    .icon-successful {
        color: #2dcb56;
    }
    .icon-failed {
        color: #ea3636;
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
            overflow-y: scroll;
            height: calc(100vh - 105px);
        }
        .log-detail {
            padding: 0 20px 20px 20px;
            line-height: 20px;
            word-wrap:break-word;
            background: #2a2b2f;
            margin-top: 0;
            min-height: 96%;
        }

        .deploy-view {
            display: flex;
            height: 100%;
            margin: 0;
            align-items: stretch;
            font-size: 14px;

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
