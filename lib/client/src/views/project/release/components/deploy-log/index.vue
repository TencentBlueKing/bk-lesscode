<template>
    <div class="lesscode-deploy-log-wrapper" :class="[isRunning ? 'lesscode-deploy-log-running' : '']">
        <deploying-type :deploying-info="inProgressInfo" ext-cls="deploying-location" screenfull-class-name=".lesscode-deploy-log-wrapper"></deploying-type>
        <stage-item :title="$t('准备阶段')" :data="readyList" ref="readyStageRef" v-if="isShowReady" />
        <stage-item :title="$t('构建阶段')" :ext-cls="isRunning ? 'running-cls' : ''" can-full-screen :data="buildList" style="margin-top: 8px;" ref="buildStageRef" v-if="isShowBuild" />
        <deploy-stage-item
            :loading="processLoading"
            :data="processList"
            style="margin-top: 8px;"
            ref="nowStageRef"
            :environment="environment"
            :current-app-info="currentAppInfo"
            v-if="isShowRelease" />
        <skip-stage-item style="margin-top: 8px;" v-if="isShowSkip" />
        <div class="error-tips" v-if="latestInfo.errorMsg">
            <p class="error-title">
                <i class="bk-drag-icon bk-drag-close-circle-fill icon-error"></i>
                <span>{{$t('失败原因一')}}</span>
            </p>
            <p class="error-info">{{latestInfo.errorMsg}}</p>
        </div>
    </div>
</template>
<script>
    import StageItem from './render-stage'
    import SkipStageItem from './render-skip-stage'
    import DeployStageItem from './deploy-stage'
    import deployingType from '../../components/deploying-type.vue'
    export default {
        name: '',
        components: {
            StageItem,
            SkipStageItem,
            DeployStageItem,
            deployingType
        },
        props: {
            readyList: {
                type: Array,
                default: () => []
            },
            buildList: {
                type: Array,
                default: () => []
            },
            processList: {
                type: Array,
                default: () => []
            },
            stateProcess: {
                type: Array,
                default: () => []
            },
            isShowSkip: {
                type: Boolean,
                default: false
            },
            // 部署阶段获取部署进程的loading
            processLoading: {
                type: Boolean,
                default: false
            },
            environment: {
                type: String,
                default: 'stag'
            },
            isRunning: {
                type: Boolean,
                default: false
            },
            currentAppInfo: {
                type: Object,
                default () {
                    return {}
                }
            },
            list: {
                type: Array,
                default: () => []
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
                inProgressInfo: {}
            }
        },
        computed: {
            isShowReady () {
                return this.stateProcess.includes('preparation')
            },
            isShowBuild () {
                return this.stateProcess.includes('build')
            },
            isShowRelease () {
                return this.stateProcess.includes('release')
            }
        },
        watch: {
            buildList: {
                handler (value) {
                    this.$nextTick(() => {
                        this.$refs.buildStageRef && this.$refs.buildStageRef.handleScrollToBottom()
                    })
                },
                immediate: true
            }
        },
        methods: {
            handleScrollToLocation (type) {
                const $dom = document.querySelector('.lesscode-deploy-log-wrapper')
                if (type === 'preparation') {
                    $dom.scrollTo(0, 0)
                    return
                }
                if (type === 'release') {
                    const $ref = this.$refs.nowStageRef
                    const distance = $ref.$el.offsetTop || 0
                    $dom.scrollTo(0, distance)
                }
            },
            inProgressStatus (name, status, resultStatus) {
                const isRunning = resultStatus === 'running'
                const curNode = this.list.find(item => item.name === name)
                if (curNode) {
                    curNode.status = status
                    if (isRunning) {
                        this.inProgressInfo = this.list.find(item => item.status === 'pending' && item.parentStage)
                    } else {
                        let lastStatus = {}
                        this.list.forEach((item) => {
                            if (item.status === 'successful' || item.status === 'failed') {
                                lastStatus = item
                            }
                        })
                        this.inProgressInfo = lastStatus
                    }
                }
            }

        }
    }
</script>
<style lang="postcss">
    .lesscode-deploy-log-wrapper {
        margin-left: 20px;
        padding: 17px 30px;
        width: calc(100% - 250px);
        height: 670px;
        background: #242424;
        overflow-y: auto;
        /* max-width: 1050px; */
        position: relative;
        &::-webkit-scrollbar {
            width: 4px;
            background-color: lighten(transparent, 80%);
        }
        &::-webkit-scrollbar-thumb {
            height: 5px;
            border-radius: 2px;
            background-color: #63656e;
        }
        .deploying-location {
            position: absolute;
            top: 0;
            left: 0;
        }
        .error-tips {
            width: 100%;
            height: 68px;
            background: #2E2E2E;
            border-radius: 0 0 2px 2px;
            position: absolute;
            bottom: 0;
            left: 0;
            color: #DCDEE5;
            font-size: 12px;
            border-left: 4px solid #B34747;
            line-height: 22px;
            .error-title {
                margin:8px 0 0 15px;
                .icon-error {
                    font-size: 12px;
                    color: #B34747;
                    margin-right: 6px;
                }
            }
            .error-info {
                margin-left: 35px;
            }
            
         }
    }
    .lesscode-deploy-log-running{
        height: 91vh !important;
    }
</style>
