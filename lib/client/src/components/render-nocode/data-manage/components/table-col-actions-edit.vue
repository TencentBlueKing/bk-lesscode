<template>
    <section class="table-col-actions-edit">
        <comp-box
            v-for="button in buttons"
            class="button-wrapper"
            type="tableActions"
            :key="button.id"
            :comp="button"
            @copy="handleCopy"
            @delete="handleDelete">
            <bk-button v-bind="getProperties(button)" text>{{ button.name }}</bk-button>
        </comp-box>
        <i v-bk-tooltips="$t('添加操作')" class="bk-icon icon-plus add-btn" @click.stop="handleAdd"></i>
    </section>
</template>
<script>
    import { mapState, mapMutations } from 'vuex'
    import { cloneDeep } from 'lodash'
    import { uuid } from '@/common/util'
    import CompBox from './comp-box.vue'

    export default {
        name: 'TableColActionsEdit',
        components: {
            CompBox
        },
        computed: {
            ...mapState('nocode/dataManage', ['activeNode', 'selectedComp', 'pageConfig']),
            buttons () {
                if (this.activeNode) {
                    return this.pageConfig[this.activeNode]?.tableActions || []
                }
                return this.pageConfig.tableActions || []
            }
        },
        methods: {
            ...mapMutations('nocode/dataManage', ['setPageConfig']),
            getProperties (button) {
                const props = {}
                Object.keys(button.props).forEach(key => {
                    props[key] = button.props[key].val
                })
                return props
            },
            handleAdd () {
                const buttons = this.buttons.slice(0)
                buttons.push({
                    id: `Button-${uuid(8)}`,
                    name: this.$t('操作'),
                    props: {},
                    events: { click: { enable: false, name: '' } },
                    perms: []
                })
                this.updatePageConfig(buttons)
            },
            handleCopy (comp) {
                const buttons = this.buttons.slice(0)
                const copy = Object.assign({}, comp, { id: `button-${uuid(8)}` })
                const index = buttons.findIndex(item => item.id === comp.id)
                buttons.splice(index + 1, 0, copy)
                this.updatePageConfig(buttons)
            },
            handleDelete (comp) {
                const buttons = this.buttons.filter(item => item.id !== comp.id)
                if (this.selectedComp.data.id === comp.id) {
                    this.$store.commit('nocode/dataManage/setSelectedComp')
                }
                this.updatePageConfig(buttons)
            },
            updatePageConfig (buttons) {
                const pageConfig = cloneDeep(this.pageConfig)
                if (this.activeNode) {
                    if (!this.pageConfig[this.activeNode]) {
                        pageConfig[this.activeNode] = {}
                    }
                    pageConfig[this.activeNode].tableActions = buttons
                } else {
                    pageConfig.tableActions = buttons
                }
                this.$store.commit('nocode/dataManage/setPageConfig', pageConfig)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .table-col-actions-edit {
        display: flex;
        align-items: center;
    }
    .bk-button-text {
        margin-left: 8px;
        padding: 4px 8px;
        &:first-of-type {
            margin-left: 0;
        }
        &:hover {
            background: #f5f7fa;
            border-radius: 2px;
        }
    }
    .add-btn {
        margin-left: 4px;
        padding: 4px 0;
        font-size: 16px;
        color: #3a84ff;
        cursor: pointer;
        &:hover {
            color: #1768ef;
        }
    }
</style>
