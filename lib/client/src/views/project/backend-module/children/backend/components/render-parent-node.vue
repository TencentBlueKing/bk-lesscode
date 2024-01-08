<template>
    <section class="parent-node">
        <span :class="['status-color', node.status]"></span>
        <span :class="['status-icon', node.status]">
            <svg v-if="node.status === 'running'" aria-hidden="true" width="16" height="16" class="loading-icon">
                <use xlink:href="#bk-drag-loading-2"></use>
            </svg>
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
        <i
            class="bk-drag-icon bk-drag-edit tail-icon"
            v-bk-tooltips="{
                content,
                placements: ['top']
            }"
            @click="showDialog"
        ></i>
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
    export default {
        inject: ['getNode'],
        data () {
            return {
                inputStr: '',
                content: window.i18n.t('编辑需求'),
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
                this.showEdit = true
                this.inputStr = this.node?.name
            },
            async handleEdit () {
                try {
                    if (this.node?.type === 'story') {
                        const data = {
                            story: this.inputStr,
                            uuid: this.node?.session_id
                        }
                        await this.$store.dispatch('saasBackend/patchModuleStory', data)
                        this.$store.commit('saasBackend/setStateProperty', { key: 'needUpdate', value: true })
                        this.showEdit = false
                    }
                } catch (err) {
                    console.error(err)
                }
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
    margin: 0 16px 0 12px;
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
    width: 150px;
    word-break: break-all;
    text-overflow: ellipsis;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2; /* 这里是超出几行省略 */
    overflow: hidden;
}
.tail-icon {
    margin-right: 18px;
    font-size: 20px;
    cursor: pointer;
}
.dialog-footer {
    width: 100%;
    display: flex;
    margin-top: 10px;
}
</style>
