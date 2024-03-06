<template>
    <bk-sideslider
        :is-show.sync="showSlider"
        :quick-close="true"
        :width="1100"
        ext-cls="node-info-slider"
        transfer
        @shown="initData"
    >
        <div slot="header">
            <div class="node-slider-header">
                <span class="node-name">{{node.name}}</span>
                <span class="node-status" :class="node.status">
                    {{nodeStatusText}}
                </span>
                <bk-button v-if="node.status === 'fail' && node.id !== 'MigrateProcessor'" @click="patchRetry" theme="primary" size="small">{{$t('立即重试')}}</bk-button>
                <p v-if="node.status === 'fail' && node.id === 'MigrateProcessor' && node.url" class="migrate-error-tips">
                    <span>{{$t('您可以根据错误信息修改源码后重试该步骤，')}}</span>
                    <span class="link-text" @click="toLink(node.url)">{{$t('查看应用源码')}}</span>
                </p>
            </div>
        </div>
        <div slot="content">
            <div class="operation-header">
                <div v-if="node.status === 'fail'"
                    class="tab-item"
                    :class="{ 'active-item': currentTab === 'errors' }"
                    @click="currentTab = 'errors'" >
                    {{errorLabel}}
                </div>
                <div 
                    v-if="node.type === 'node'"
                    class="tab-item"
                    :class="{'active-item': currentTab === 'files' }"
                    @click="currentTab = 'files'" >
                    {{fileLabel}}
                    <span class="number-span">{{filesInfo.length}}</span>
                </div>
            </div>
            <div class="info-container">
                <div v-show="currentTab === 'errors'" class="errors-container">
                    <div class="errors-content">
                        <div class="err-msg-div">
                            <i class="bk-drag-icon bk-drag-exclamation-fill"></i>
                            <span>{{errorsInfo.msg}}</span>
                        </div>
                        <div class="err-tb-div" v-if="node.id === 'MigrateProcessor'">
                            <template v-if="errorsInfo.tb.length">
                                <div v-for="(line, index) in errorsInfo.tb" :key="index" style="margin-bottom: 4px;">
                                    {{ line }}
                                </div>
                            </template>
                            <template v-else>
                                {{errorEmpty}}
                            </template>
                        </div>
                    </div>             
                </div>
                <div v-show="currentTab === 'files'" class="files-container">
                    <empty-status style="width: 100%;" v-if="filesInfo.length === 0" :part="false" :empty-text="emptyFileTips"></empty-status>
                    <template v-else>
                        <div class="file-list">
                            <div
                                class="file-item" 
                                :class="{'active-file-item': fileIndex === index }"
                                v-for="(file, index) in filesInfo" :key="index"
                                @click="fileIndex = index"
                            >
                                <i class="bk-drag-icon bk-drag-yuanma"></i>
                                <span :title="file.file_path" class="file-path">{{file.file_path && file.file_path.replace(appName, '')}}</span>
                            </div>
                        </div>
                        <div class="file-content">
                            <monaco
                                width="786px"
                                height="calc(100vh - 136px)"
                                read-only
                                :value="currentFile.code_content || ''"
                                :options="{ language: 'python' }">
                                <span
                                    slot="title"
                                    class="file-title"
                                >{{ currentFile.file_path }}</span>
                                <template v-slot:tools>
                                    <i class="bk-drag-icon bk-drag-copy icon-style copy-icon" @click="handleCopyCode"></i>
                                    <slot name="tools"></slot>
                                </template>
                            </monaco>
                        </div>
                    </template>
                </div>
            </div>
        </div>
    </bk-sideslider>
</template>

<script>
    import monaco from '@/components/monaco.vue'
    export default {
        components: {
            monaco
        },
        data () {
            return {
                currentTab: 'files',
                fileIndex: 0,
                errorEmpty: window.i18n.t('暂无堆栈消息'),
                errorLabel: window.i18n.t('错误信息'),
                fileLabel: window.i18n.t('生成的代码片段'),
                emptyFileTips: window.i18n.t('当前节点没有代码生成')
            }
        },
        computed: {
            node () {
                return this.$store.state.saasBackend?.currentNode || {}
            },
            showSlider: {
                get () {
                    return this.$store.state.saasBackend?.showSlider
                },
                set (val) {
                    this.$store.commit('saasBackend/setStateProperty', { key: 'showSlider', value: val })
                }
            },
            appName () {
                return this.node?.app_name + '/' 
            },
            errorsInfo () {
                return {
                    msg: this.node?.property?.exception?.exn?.msg || window.i18n.t('暂无报错消息'),
                    tb: this.node?.property?.exception?.tb?.split('\n') || []
                }
            },
            filesInfo () {
                return typeof this.node?.content?.result?.code === 'object' ? this.node?.content?.result?.code : []
            },
            currentFile () {
                return this.filesInfo[this.fileIndex] || {}
            },
            nodeStatusText () {
                let txt = this.node?.status
                if (this.node?.status === 'success') {
                    txt = window.i18n.t('执行成功')
                } else if (this.node?.status === 'fail') {
                    txt = window.i18n.t('执行失败')
                }
                return txt
            }
        },
        methods: {
            initData () {
                this.fileIndex = 0
                this.currentTab = this.node?.status === 'fail' ? 'errors' : 'files'
            },
            async patchRetry () {
                const data = {
                    app_name: this.node?.app_name,
                    uuid: this.node?.session_id || this.node?.saas_builder,
                    retry: true
                }
                await this.$store.dispatch('saasBackend/execModuleStory', data)
                this.$store.commit('saasBackend/setStateProperty', { key: 'needUpdate', value: true })
                this.showSlider = false
            },
            toLink (url) {
                window.open(url, '_blank')
            },
            handleCopyCode () {
                const code = this.currentFile?.code_content || ''
                const el = document.createElement('textarea')
                el.value = code
                el.setAttribute('readonly', '')
                el.style.position = 'absolute'
                el.style.left = '-9999px'
                document.body.appendChild(el)
                const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false
                el.select()
                document.execCommand('copy')
                document.body.removeChild(el)
                if (selected) {
                    document.getSelection().removeAllRanges()
                    document.getSelection().addRange(selected)
                }
                this.$bkMessage({ theme: 'primary', message: this.$t('复制成功'), delay: 2000, dismissable: false })
            }
        }
    }
</script>

<style lang="postcss" scoped>
.node-info-slider{
    .node-slider-header {
        display: flex;
        align-items: center;
        .node-name {
            max-width: 800px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .node-status {
            margin: 0 16px;
            padding: 2px 8px;
            line-height: 14px;
            font-size: 12px;
            border-radius: 2px;
            color: #3A84FF;
            background: #EDF4FF;
            &.success {
                color: #14A568;
                background: #E4FAF0;
            }
            &.fail {
                color: #EA3636;
                background: #FFDDDD;
            }
        }
        .migrate-error-tips {
            font-size: 12px;
            color: #979BA5;
            .link-text {
                cursor: pointer;
                color: #3A84FF;
            }
        }
    }
    .operation-header {
        height: 60px;
        background-color: #F5F7FA;
        padding: 18px 24px 0;
        display: flex;
        .tab-item {
            height: 42px;
            margin-right: 8px;
            padding: 0 24px;
            display: flex;
            align-items: center;
            background-color: #EAEBF0;
            color: #63656E;
            cursor: pointer;
            .number-span {
                height: 16px;
                padding: 0 8px;
                font-size: 12px;
                margin-left: 6px;
                background: #DCDEE5;
                color: #979BA5;
                border-radius: 8px;
            }
            &.active-item {
                background-color: #FFF;
                color: #3A84FF;
                .number-span {
                    color: #3A84FF;
                    background: #E1ECFF;
                }
            }
            
        }
    }
    .info-container {
        /* height: calc(100vh - 136px); */
        position: relative;
        .errors-container {
            height: calc(100% - 16px);
            margin: 16px 24px;
            .errors-content {
                background: #FFEDED;
                border: 1px solid #FFD2D2;
                border-radius: 2px;
                padding: 10px 16px;
                color: #63656E;
                overflow-y: auto;
                .err-msg-div {
                    display: flex;
                    align-items: center;
                    line-height: 22px;
                    i {
                        color: #EA3636;
                        margin-right: 12px;
                    }
                }
                .err-tb-div {
                    background-color: #FFF;
                    border-radius: 2px;
                    margin-top: 10px;
                    padding: 16px 24px;
                }
            }
        }
        .files-container {
            height: 100%;
            margin: 16px 16px 0;
            display: flex;
            .file-list {
                background-color: #F5F7FA;
                width: 270px;
                margin-right: 10px;
                padding: 16px;
                .file-item {
                    height: 36px;
                    color: #63656E;
                    background: #FFFFFF;
                    box-shadow: 0 2px 4px 0 #1919290d;
                    border-radius: 4px;
                    display: flex;
                    align-items: center;
                    cursor: pointer;
                    margin-bottom: 8px;
                    padding: 0px 12px;
                    &.active-file-item {
                        color: #3A84FF;
                        background: #E1ECFF;
                    }
                    i {
                        margin-right: 12px;
                    }
                    .file-path {
                        width: 190px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                    }
                }
            }
            .file-content {
                flex: 1;
                .file-title {
                    margin-left: 34px;
                    color: #C4C6CC;
                }
                .copy-icon {
                    margin: 0 16px 0 10px;
                }
            }
        }
    }
}
</style>