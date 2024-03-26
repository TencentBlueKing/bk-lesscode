<template>
    <bk-dialog
        v-model="showUpdateDialog"
        ext-cls="update-node-dialog"
        :width="620"
        :show-footer="false"
        :close-icon="false"
        @value-change="toggleDialog"
    >
        <section class="header-input">
            <section
                :style="{
                    '--text-height': textHeight + 'px',
                    'width': '100%',
                }"
            >
                <bk-input
                    ref="inputRef"
                    class="update-node-input"
                    type="textarea"
                    row="3"
                    :placeholder="$t('请修改需求或任务描述')"
                    :native-attributes="{ autofocus: 'autofocus' }"
                    v-model="inputStr"
                ></bk-input>
                <p class="info-tips">
                    {{$t('tips: 修改该需求任务后，点击“保存并执行”，系统将从该步骤开始重新执行后续所有流程')}}
                </p>
            </section>
        </section>
        <section class="dialog-footer">
            <bk-button theme="primary" :disabled="!inputStr || isExecuting" @click="handleEdit">{{ confirmMessage }}</bk-button>
            <bk-button @click="showUpdateDialog = false">{{ cancelMessage }}</bk-button>
        </section>
    </bk-dialog>
</template>

<script>
    import monaco from '@/components/monaco.vue'
    export default {
        components: {
            monaco
        },
        data () {
            return {
                inputStr: '',
                textHeight: 75,
                editontent: window.i18n.t('编辑'),
                confirmMessage: window.i18n.t('保存并执行'),
                cancelMessage: window.i18n.t('取消'),
            }
        },
        computed: {
            node () {
                return this.$store.state.saasBackend?.currentNode || {}
            },
            showUpdateDialog: {
                get () {
                    return this.$store.state.saasBackend?.showUpdateDialog
                },
                set (val) {
                    this.$store.commit('saasBackend/setStateProperty', { key: 'showUpdateDialog', value: val })
                }
            },
            isExecuting () {
                return this.$store.state.saasBackend?.isExecuting || false
            },
            saasBuilderList () {
                return this.$store.state.saasBackend?.saasBuilderList || []
            }
        },
        watch: {
            inputStr () {
                this.handleChangeTextHeight()
            }
        },
        methods: {
            handleChangeTextHeight () {
                const lines = this.inputStr.split(/\r?\n/)
                let height = 22 + lines.length * 16
                if (height >= 400) {
                    height = 400
                }
                if (height <= 76) {
                    height = 76
                }
                this.textHeight = height
            },
            toggleDialog (isShow) {
                if (isShow) {
                    this.inputStr = this.node?.name
                    setTimeout(() => {
                        this.$refs.inputRef?.focus()
                    })
                }
            },
            async handleEdit () {
                try {
                    if (this.node?.type === 'story') {
                        const data = {
                            story: this.inputStr,
                            uuid: this.node?.session_id,
                            app_name: this.node?.app_name,
                        }
                        await this.$store.dispatch('saasBackend/patchModuleStory', data)
                    } else {
                        const builderItem = this.saasBuilderList.find(item => item.session_id === this.node?.saas_builder)
                        if (builderItem) {
                            const nodes = builderItem.nodes
                            const nodeItem = nodes.find(item => item.node_id === this.node?.id)
                            const nodeIndex = nodes.findIndex(item => item.node_id === this.node?.id)
                            const itemContent = Object.assign({}, nodeItem.content, {
                                name: this.inputStr,
                                son_requirement: this.inputStr
                            })
                            Object.assign(nodeItem, { status: 'modified', content: itemContent })
                            nodes.splice(nodeIndex, 1, nodeItem)
                            builderItem.status = 'modified'
                            const data = {
                                builderDetail: builderItem,
                                uuid: builderItem.session_id,
                                story: builderItem.name,
                                app_name: this.node?.app_name

                            }
                            await this.$store.dispatch('saasBackend/updateModuleStory', data)
                        }
                    }
                    this.$store.commit('saasBackend/setStateProperty', { key: 'needUpdate', value: true })
                    this.showUpdateDialog = false
                } catch (err) {
                    console.error(err)
                }
            }
        }
    }
</script>

<style lang="postcss">
    .update-node-dialog.bk-dialog-wrapper {
        .bk-dialog-tool {
            display: none;
        }
        .bk-dialog-body {
            padding: 24px;
        }
        .dialog-footer {
            width: 100%;
            display: flex;
            margin-top: 12px;
        }
    }
</style>

<style lang="postcss" scoped>
    .update-node-dialog {
        .update-node-input {
            flex-direction: row;
            >>> textarea {
                font-size: 14px;
                line-height: 16px;
                height: var(--text-height);
                min-height: 54px;
                padding: 11px 38px 10px 11px;
                resize: none !important;
                color: #63656e;
                &::-webkit-scrollbar {
                width: 4px;
                height: 4px;
                }

                &::-webkit-scrollbar-thumb {
                height: 5px;
                border-radius: 3px;
                background-color: #dcdee5;
                }
                &::placeholder {
                line-height: 16px;
                }
            }
        }
        .info-tips {
            font-size: 12px;
            color: #979BA5;
        }
    }
</style>