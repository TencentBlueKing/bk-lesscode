<template>
    <section class="parent-node" @click="openSlider">
        <span :class="['status-color', node.status]"></span>
        <span :class="['status-icon', node.status]">
            <svg v-if="node.status === 'running'" aria-hidden="true" width="16" height="16" class="loading-icon">
                <use xlink:href="#bk-drag-loading-2"></use>
            </svg>
            <i v-else-if="node.type === 'story'" class="bk-drag-icon bk-drag-builder status-i"></i>
            <i v-else class="bk-drag-icon bk-drag-info status-i"></i>
        </span>
        <span class="node-name"
            v-bk-tooltips="{
                content: node.name,
                maxWidth: 300,
                placements: ['top'],
                delay: [100, 0]
            }"
        >
            {{ node.name }}
        </span>
        <span class="node-icons">
            <i
                class="bk-drag-icon bk-drag-edit node-icon"
                v-if="(node.status !== 'running' && node.status !== 'pending') && finalNodeTypes.indexOf(node.id) === -1"
                v-bk-tooltips="{
                    content: editontent,
                    placements: ['top']
                }"
                @click.stop="showDialog"
            ></i>
            <i
                class="bk-drag-icon bk-drag-refresh-line node-icon"
                style="font-size: 14px;margin-left: 4px;"
                v-if="node.status === 'fail'"
                v-bk-tooltips="{
                    content: '重试',
                    placements: ['top']
                }"
                @click.stop="patchRetry"
            ></i>
            <i
                class="bk-drag-icon bk-drag-jump-link node-icon"
                style="font-size: 14px;margin-left: 4px;"
                v-if="node.url"
                @click.stop="toLink(node.url)"
            ></i>
        </span>
        <bk-dialog
            v-model="showEdit"
            :width="360"
            :show-footer="false"
            :close-icon="false"
        >
            <bk-input type="textarea" v-model="inputStr"></bk-input>
            <section class="dialog-footer">
                <bk-button theme="primary" :disabled="isExecuting" @click="handleEdit">{{ confirmMessage }}</bk-button>
                <bk-button @click="showEdit = false">{{ cancelMessage }}</bk-button>
            </section>
        </bk-dialog>
    </section>
</template>

<script>
    import { finalNodeTypes } from './common'
    export default {
        inject: ['getNode'],
        data () {
            return {
                finalNodeTypes,
                inputStr: '',
                editontent: window.i18n.t('编辑'),
                confirmMessage: window.i18n.t('保存并执行'),
                cancelMessage: window.i18n.t('取消'),
                node: {
                    id: '',
                    status: '',
                    name: ''
                },
                showEdit: false
            }
        },
        computed: {
            isExecuting () {
                return this.$store.state.saasBackend?.isExecuting || false
            },
            saasBuilderList () {
                return this.$store.state.saasBackend?.saasBuilderList || []
            }
        },
        mounted () {
            const node = this.getNode()
            this.node = node.getData()
            node.on('change:data', ({ current }) => {
                this.node = current
            })
        },
        methods: {
            showDialog () {
                console.log(this.node)
                this.showEdit = true
                this.inputStr = this.node?.name
            },
            openSlider () {
                if (this.node?.status === 'fail' || this.node?.status === 'success') {
                    this.$store.commit('saasBackend/setStateProperty', { key: 'currentNode', value: JSON.parse(JSON.stringify(this.node)) })
                    this.$store.commit('saasBackend/setStateProperty', { key: 'showSlider', value: true })
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
                    this.showEdit = false
                } catch (err) {
                    console.error(err)
                }
            },
            async patchRetry () {
                const data = {
                    app_name: this.node?.app_name,
                    uuid: this.node?.session_id || this.node?.saas_builder,
                    retry: true
                }
                await this.$store.dispatch('saasBackend/execModuleStory', data)
                this.$store.commit('saasBackend/setStateProperty', { key: 'needUpdate', value: true })
            },
            toLink (url) {
                window.open(url, '_blank')
            }
        }
    }
</script>

<style lang="postcss" scoped>
.parent-node {
    height: 100%;
    width: 100%;
    background-color: #fff;
    box-shadow: 0 2px 4px 0 #1919290d;
    border-radius: 4px;
    display: flex;
    justify-items: center;
    align-items: center;
    cursor: pointer;
}
.status-color {
    height: 100%;
    width: 4px;
    border-radius: 4px 0 0 4px;
    &.success {
        background: #1CAB88;
    }
    &.fail {
        background: #EA3636;
    }
    &.running {
        background: #3A84FF;
    }
}
.status-icon {
    margin: 0 12px;
    height: 36px;
    width: 36px;
    border-radius: 4px;
    background: #F5F7FA;
    padding: 10px;
    &.success {
        background: #E8FFF5;
        color: #1CAB88;
    }
    &.fail {
        background: #FFEEEE;
        color: #EA3636;
    }
    &.running {
        background: #F5F7FA;
        color: #3A84FF;
    }
    .status-i {
        font-size: 15px;
    }
    .loading-icon {
        fill: #3a84ff;
        animation: icon-loading 1.5s linear infinite;
    }
}
.node-name {
    /* flex: 1; */
    width: 160px;
    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 这里是超出几行省略 */
    overflow: hidden;
}
.node-icons {
    display: flex;
    align-items: center;
    justify-self: flex-end;
    margin-right: 16px;
    .node-icon {
        font-size: 22px;
        margin-left: 2px;
        cursor: pointer;
        &:hover {
            color: #3A84FF;
        }
    }
}

.dialog-footer {
    width: 100%;
    display: flex;
    margin-top: 10px;
}
</style>
