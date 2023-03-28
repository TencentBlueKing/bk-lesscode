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
        <bk-button
            v-bk-tooltips="buttons.length > 9 ? $t('按钮数量已达上限') : $t('添加按钮')"
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
                if (this.activeNode) {
                    return this.pageConfig[this.activeNode]?.buttons || []
                }
                return this.pageConfig.buttons || []
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
            getProperties (button) {
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
                    name: this.$t('按钮'),
                    props: {},
                    events: { click: { enable: false, name: '' } },
                    perms: []
                }
                if (buttons.length === 0) {
                    button.props.theme = { val: 'primary' } // 第一个按钮主题默认值primary
                }
                buttons.push(button)
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
    .create-btn {
        padding: 0;
    }
</style>
