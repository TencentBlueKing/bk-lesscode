<template>
    <section class="table-col-actions-edit">
        <bk-button text class="detail-btn">详情</bk-button>
        <comp-box
            v-for="button in buttons.slice(0, 3)"
            class="button-wrapper"
            type="tableActions"
            :key="button.id"
            :comp="button"
            @copy="handleCopy"
            @delete="handleDelete">
            <bk-button v-bind="getProperties(button)" text>{{ button.name }}</bk-button>
        </comp-box>
        <bk-popover
            v-if="buttons.length > 3"
            ref="popover"
            ext-cls="actions-list-popover"
            placement="bottom-start"
            :tippy-options="{ theme: 'light', arrow: false, distance: 5, hideOnClick: false }"
            :on-show="popShow"
            :on-hide="popHide">
            <i :class="['bk-icon icon-more more-actions-icon', { active: isPopOpen }]" @click="$refs.popover.showHandler()"></i>
            <ul class="actions-list" slot="content">
                <li v-for="action in buttons.slice(3)" :key="action.id" class="action-item">{{ action.name }}</li>
            </ul>
        </bk-popover>
        <i v-bk-tooltips="'添加操作'" class="bk-icon icon-plus add-btn" @click.stop="handleAdd"></i>
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
        data () {
            return {
                isPopOpen: false
            }
        },
        computed: {
            ...mapState('nocode/dataManage', ['activeNode', 'selectedComp', 'pageConfig']),
            buttons () {
                return (this.activeNode ? this.pageConfig[this.activeNode].tableActions : this.pageConfig.tableActions) || [] // 兼容旧数据不存在表格操作按钮配置
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
                    name: '操作',
                    props: {
                        text: true
                    },
                    events: { click: { enable: false, name: '' } },
                    perms: []
                })
                this.updatePageConfig(buttons)
            },
            handleCopy (comp) {
                const buttons = this.buttons.slice(0)
                const copy = Object.assign({}, comp, { id: `button-${uuid(8)}` })
                const index = buttons.find(item => item.id === comp.id)
                buttons.splice(index, 0, copy)
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
                    pageConfig[this.activeNode].tableActions = buttons
                } else {
                    pageConfig.tableActions = buttons
                }
                this.$store.commit('nocode/dataManage/setPageConfig', pageConfig)
            },
            popShow () {
                this.isPopOpen = true
            },
            popHide () {
                this.isPopOpen = false
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
    .more-actions-icon {
        display: inline-block;
        height: 16px;
        width: 16px;
        color: #63656e;
        font-size: 16px;
        background: transparent;
        border-radius: 50%;
        cursor: pointer;
        &:hover,
        &.active {
            color: #3a84ff;
            background: #f5f7fa;
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
<style lang="postcss">
    .actions-list-popover .tippy-tooltip {
        padding: 0;
        .actions-list {
            padding: 5px 0;
            max-height: 138px;
            background: #ffffff;
            overflow: auto
        }
        .action-item {
            padding: 0 8px;
            min-width: 80px;
            height: 32px;
            line-height: 32px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            &:hover {
                background: #f0f1f5;
                color: #3a84ff;
                cursor: pointer;
            }
        }
    }
</style>
