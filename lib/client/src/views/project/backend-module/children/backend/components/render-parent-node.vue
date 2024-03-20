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
                delay: [100, 0],
                disabled: finalNodeTypes.indexOf(node.id) !== -1
            }"
        >
            {{ node.name }}
        </span>
        <span class="node-icons" v-if="!isExecuting && !isCanvasLocked">
            <i
                class="bk-drag-icon bk-drag-edit node-icon hover-icon"
                v-if="(node.status !== 'running' && node.status !== 'pending') && finalNodeTypes.indexOf(node.id) === -1"
                v-bk-tooltips="{
                    content: editontent,
                    placements: ['top']
                }"
                @click.stop="showDialog"
            ></i>
            <i
                class="bk-drag-icon bk-drag-refresh-line node-icon hover-icon"
                style="font-size: 14px;margin-left: 4px;"
                v-if="node.status === 'fail'"
                v-bk-tooltips="{
                    content: '重试',
                    placements: ['top']
                }"
                @click.stop="patchRetry"
            ></i>
            <i
                v-if="node.url && node.id === 'MigrateProcessor'"
                v-bk-tooltips="{
                    content: '查看应用源码',
                    placements: ['top']
                }"
                class="bk-drag-icon bk-drag-jump-link node-icon"
                style="font-size: 14px;margin-left: 4px;"
                @click.stop="toLink(node.url)"
            ></i>
            
            <bk-dropdown-menu ext-cls="schema-api-dropdown" v-if="node.url && node.id === 'PreviewProcessor'">
                <i
                    slot="dropdown-trigger"
                    class="bk-drag-icon bk-drag-jump-link node-icon"
                    style="font-size: 14px;margin-left: 4px;"
                    @click.stop="toLink(node.url)"
                ></i>
                <ul class="bk-dropdown-list" slot="dropdown-content">
                    <template v-for="api in schemaApiList">
                        <li :title="api.desc" :key="api.path">
                            <a target="_blank" :href="`${node.url}#${api.link}`">{{api.path}}</a>
                        </li>
                    </template>
                </ul>
            </bk-dropdown-menu>
            
        </span>
    </section>
</template>

<script>
    import { finalNodeTypes } from './common'
    export default {
        inject: ['getNode'],
        data () {
            return {
                finalNodeTypes,
                editontent: window.i18n.t('编辑当前步骤需求任务描述'),
                node: {
                    id: '',
                    status: '',
                    name: ''
                }
            }
        },
        computed: {
            isExecuting () {
                return this.$store.state.saasBackend?.isExecuting || false
            },
            isCanvasLocked () {
                return this.$store.state.saasBackend?.isCanvasLocked || false
            },
            schemaApiList () {
                return this.$store.state.saasBackend?.schemaApiList || []
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
                this.$store.commit('saasBackend/setStateProperty', { key: 'currentNode', value: JSON.parse(JSON.stringify(this.node)) })
                this.$store.commit('saasBackend/setStateProperty', { key: 'showUpdateDialog', value: true })
            },
            openSlider () {
                if (this.node?.status === 'fail' || (this.node?.status === 'success' && this.node?.type === 'node')) {
                    this.$store.commit('saasBackend/setStateProperty', { key: 'currentNode', value: JSON.parse(JSON.stringify(this.node)) })
                    this.$store.commit('saasBackend/setStateProperty', { key: 'showSlider', value: true })
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
    .schema-api-dropdown {
        .bk-dropdown-content {
            .bk-dropdown-list {
                max-height: 400px;
                max-width: 500px;
            }
        }
    }
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
        &:hover {
            .hover-icon {
                display: inline;
            }
        }
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
        width: 156px;
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
        .hover-icon {
            display: none;
        }
        .node-icon {
            font-size: 22px;
            margin-left: 2px;
            cursor: pointer;
            &:hover {
                color: #3A84FF;
            }
        }
    }
</style>
