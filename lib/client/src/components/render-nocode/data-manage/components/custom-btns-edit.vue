<template>
    <section class="custom-btns-edit">
        <comp-box
            v-for="(button, index) in buttons"
            class="button-wrapper"
            type="buttons"
            :key="button.id"
            :comp="button"
            @copy="handleCopy"
            @delete="handleDelete">
            <bk-button v-bind="getProperties(button, index)">
                {{ button.name }}
            </bk-button>
        </comp-box>
        <!-- <bk-dropdown-menu
            v-if="buttons.length > 4"
            ref="dropdown"
            @show="isDropdownShow = true"
            @hide="isDropdownShow = false">
            <div class="more-buttons-trigger" slot="dropdown-trigger">
                更多
                <i :class="['bk-icon icon-angle-down angle-icon', { 'active': isDropdownShow }]"></i>
            </div>
            <ul class="more-btns-list" slot="dropdown-content">
                <li v-for="button in buttons.slice(4)" :key="button.id" class="button-item">{{ button.name }}</li>
            </ul>
        </bk-dropdown-menu> -->
        <bk-button
            v-bk-tooltips="buttons.length > 9 ? '按钮数量已达上限' : '添加按钮'"
            ext-cls="create-btn"
            icon="plus"
            :disabled="buttons.length > 9"
            @click.stop="handleAdd">
        </bk-button>
    </section>
</template>
<script>
    import { mapState } from 'vuex'
    import { cloneDeep } from 'lodash'
    import { uuid } from '@/common/util'
    import CompBox from './comp-box.vue'

    export default {
        name: 'CustomBtnsEdit',
        components: {
            CompBox
        },
        data () {
            return {
                isDropdownShow: false
            }
        },
        computed: {
            ...mapState('nocode/dataManage', ['activeNode', 'selectedComp', 'pageConfig']),
            buttons () {
                return (this.activeNode ? this.pageConfig[this.activeNode].buttons : this.pageConfig.buttons) || [] // 兼容旧数据不存在按钮配置
            }
        },
        methods: {
            openDropDown () {
                if (this.buttons.length > 4) {
                    this.$nextTick(() => {
                        this.$refs.dropdown.show()
                    })
                }
            },
            getProperties (button, index) {
                const props = {}
                Object.keys(button.props).forEach(key => {
                    props[key] = button.props[key].val
                })
                return props
            },
            handleAdd () {
                const buttons = this.buttons.slice(0)
                const button = {
                    id: `Button-${uuid(8)}`,
                    name: '按钮',
                    props: {},
                    events: { click: { enable: false, name: '' } },
                    perms: []
                }
                if (buttons.length === 0) {
                    button.props.theme = 'primary' // 第一个按钮主题默认值primary
                }
                buttons.push(button)
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
                    pageConfig[this.activeNode].buttons = buttons
                } else {
                    pageConfig.buttons = buttons
                }
                this.$store.commit('nocode/dataManage/setPageConfig', pageConfig)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .custom-btns-edit {
        display: flex;
        align-items: center;
    }
    .button-wrapper {
        margin-right: 8px;
    }
    .more-buttons-trigger {
        margin-right: 8px;
        padding: 0 8px 0 16px;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        color: #63656e;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        cursor: pointer;
        .angle-icon {
            display: inline-block;
            font-size: 20px;
            transition: transform .3s cubic-bezier(.4, 0, .2, 1);
            &.active {
                transform: rotate(-180deg);
            }
        }
    }
    .more-btns-list {
        .button-item {
            padding: 0 16px;
            height: 32px;
            line-height: 32px;
            font-size: 14px;
            color: #63656e;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
                background: #f0f1f5;
            }
        }
    }
    .create-btn {
        padding: 0;
    }
</style>
