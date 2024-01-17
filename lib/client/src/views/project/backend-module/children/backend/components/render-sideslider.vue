<template>
    <bk-sideslider
        :is-show.sync="showSlider"
        :quick-close="true"
        :width="1100"
        :title="node.name"
        ext-cls="node-info-slider"
        transfer
        @shown="initData"
    >
        <div slot="content">
            <div class="operation-header">
                <div v-if="node.status === 'fail'"
                    class="tab-item"
                    :class="{ 'active-item': currentTab === 'errors' }"
                    @click="currentTab = 'errors'" >
                    {{errorLabel}}
                </div>
                <div 
                    class="tab-item"
                    :class="{'active-item': currentTab === 'files' }"
                    @click="currentTab = 'files'" >
                    {{fileLabel}}
                    <span class="number-span">{{typeof filesInfo === 'object' ? filesInfo.length : 0}}</span>
                </div>
            </div>
            <div class="info-container">
                <div v-show="currentTab === 'errors'" class="errors-container">
                    <div class="errors-content">
                        <div class="err-msg-div">
                            <i class="bk-drag-icon bk-drag-exclamation-fill"></i>
                            <span>{{errorsInfo.msg}}</span>
                        </div>
                        <div class="err-tb-div">
                            {{errorsInfo.tb}}
                        </div>
                    </div>
                    
                </div>
                <div v-show="currentTab === 'files'" class="files-container">
                    <empty-status style="width: 100%;" v-if="!currentFile.code_content" :part="false" :empty-text="emptyFileTips"></empty-status>
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
                                height="calc(100vh - 136px)"
                                read-only
                                :value="currentFile.code_content || ''"
                                :options="{ language: 'python' }">
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
                errorLabel: window.i18n.t('错误信息'),
                fileLabel: window.i18n.t('生成的文件'),
                emptyFileTips: window.i18n.t('当前节点没有文件生成')
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
                    tb: this.node?.property?.exception?.tb || window.i18n.t('暂无堆栈消息')
                }
            },
            filesInfo () {
                return this.node?.content?.result?.code || []
            },
            currentFile () {
                return this.filesInfo[this.fileIndex] || {}
            }
        },
        methods: {
            initData () {
                this.currentTab = this.node?.status === 'fail' ? 'errors' : 'files'
            }
        }
    }
</script>

<style lang="postcss" scoped>
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
        height: calc(100vh - 136px);
        position: relative;
        .errors-container {
            height: 100%;
            margin: 16px 24px;
            .errors-content {
                background: #FFEDED;
                border: 1px solid #FFD2D2;
                border-radius: 2px;
                padding: 8px 16px 12px;
                color: #63656E;
                .err-msg-div {
                    display: flex;
                    align-items: center;
                    margin-bottom: 10px;
                    line-height: 22px;
                    i {
                        color: #EA3636;
                        margin-right: 12px;
                    }
                }
                .err-tb-div {
                    background-color: #FFF;
                    border-radius: 2px;
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
            }
        }
    }
</style>