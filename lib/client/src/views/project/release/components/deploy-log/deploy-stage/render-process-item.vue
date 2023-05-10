<template>
    <div class="lesscode-deploy-process-item-wrapper">
        <section class="header" @click.stop="handleExpanded">
            <i class="bk-drag-icon" :class="curExpanded ? 'bk-drag-angle-up-fill' : 'bk-drag-angle-right-fill'"></i>
            <span class="process-title">{{ title }}</span>
            <span class="process-sub-title">({{ subTitle }})</span>
            <StatusItem :status="status" />
            <div :class="['refresh-wrapper', { 'reset-right': !canFullScreen }]" v-if="curExpanded" @click.stop="handleRefresh">
            </div>
            <div class="screen-wrapper" v-if="canFullScreen" @click.stop="handleFullScreen">
            </div>
        </section>
        <section class="content" v-if="curExpanded">
            <section
                v-bkloading="{ isLoading: instanceLogLoading, color: '#2a2b2f' }">
                <render-stage
                    :data="logs"
                    ext-cls="deploy-process-instance-log-cls"
                    v-if="!instanceLogLoading && logs.length > 0" />
                <div
                    class="log-empty"
                    v-if="!instanceLogLoading && logs.length < 1">
                    {{$t('暂无日志')}}
                </div>
            </section>
        </section>

        <bk-dialog
            v-model="fullDialogVisiable"
            fullscreen
            :show-footer="false"
            ext-cls="lesscode-deploy-log-full-screen-cls"
            title="">
            <div class="screen-icon-wrapper" @click="fullDialogVisiable = false">
            </div>
            <div class="dialog-log-content" ref="dialogContent">
                <p v-for="(item, index) in logs" :key="index" class="log-item">
                    <span v-html="item.timestamp"></span>
                    <span v-html="item.message" style="margin-left: 25px;"></span>
                </p>
            </div>
        </bk-dialog>
    </div>
</template>
<script>
    import RenderStage from '../render-deploy-stage'
    import StatusItem from './render-status-item'
    export default {
        name: '',
        components: {
            StatusItem,
            RenderStage
        },
        props: {
            title: {
                type: String,
                default: ''
            },
            subTitle: {
                type: String,
                default: ''
            },
            status: {
                type: String,
                default: 'Running'
            },
            instanceName: {
                type: String,
                default: ''
            },
            currentAppInfo: {
                type: Object,
                default () {
                    return {}
                }
            }
        },
        data () {
            return {
                curExpanded: this.expanded,
                instanceLogLoading: false,
                logs: [],
                fullDialogVisiable: false,
                appCode: '',
                curModuleId: ''
            }
        },
        computed: {
            canFullScreen () {
                return this.logs.length > 0
            }
        },
        watch: {
            currentAppInfo: {
                handler (v) {
                    this.appCode = v.appCode
                    this.curModuleId = v.moduleCode
                },
                immediate: true,
                deep: true
            }
        },
        methods: {
            async handleExpanded () {
                this.curExpanded = !this.curExpanded
                if (!this.curExpanded) {
                    return
                }
                await this.fetchProcessInstanceLog()
            },

            async fetchProcessInstanceLog () {
                this.instanceLogLoading = true
                try {
                    const params = {
                        appCode: this.appCode,
                        moduleId: this.curModuleId,
                        data: {
                            query: {
                                query_string: '',
                                terms: {
                                    pod_name: [this.instanceName]
                                }
                            }
                        }
                    }
                    const res = await this.$store.dispatch('release/processDetailResult', params)
                    this.logs = JSON.parse(JSON.stringify(res.data.logs)).reverse()
                } catch (e) {
                    this.$bkMessage({
                        theme: 'error',
                        message: e.message
                    })
                } finally {
                    this.instanceLogLoading = false
                }
            },

            handleFullScreen () {
                this.fullDialogVisiable = true
            },

            async handleRefresh () {
                await this.fetchProcessInstanceLog()
            }
        }
    }
</script>
<style lang="postcss">
    .lesscode-deploy-process-item-wrapper {
        border-bottom: 1px solid rgba(99, 101, 110, .3);
        .header {
            position: relative;
            line-height: 42px;
            cursor: pointer;
            .expanded-icon {
                position: absolute;
                left: -18px;
                top: 15px;
            }
            .process-title {
                color: #fff;
            }
            .process-sub-title {
                color: #979ba5;
            }

            .refresh-wrapper {
                position: absolute;
                top: 0;
                right: 30px;
                cursor: pointer;
                i {
                    font-size: 16px;
                    color: #63656e;
                }
                &.reset-right {
                    right: 0;
                }
            }

            .screen-wrapper {
                position: absolute;
                top: 0;
                right: 0;
                cursor: pointer;
                i {
                    font-size: 16px;
                    color: #63656e;
                }
            }
        }
        .content {
            position: relative;
            min-height: 60px;
            padding: 0 10px 10px 0;
            color: #fff;
        }
    }
    .deploy-process-instance-log-cls {
        .content {
            padding: 0 !important;
        }
    }
    .lesscode-deploy-log-full-screen-cls {
        .screen-icon-wrapper {
            position: absolute;
            top: 10px;
            right: 10px;
            cursor: pointer;
            i {
                font-size: 18px;
                color: #63656e;
            }
        }
        .dialog-log-content {
            padding: 15px 20px;
            max-height: 100vh;
            overflow-y: auto;
            &::-webkit-scrollbar {
                width: 4px;
                background-color: lighten(transparent, 80%);
            }
            &::-webkit-scrollbar-thumb {
                height: 5px;
                border-radius: 2px;
                background-color: #63656e;
            }
            .log-item {
                line-height: 20px;
                font-size: 12px;
                color: #c4c6cc;
                font-family: Consolas,source code pro,Bitstream Vera Sans Mono,Courier,monospace,\\5FAE\8F6F\96C5\9ED1,Arial;
            }
        }
    }
</style>
