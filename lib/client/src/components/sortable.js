import Sortable from 'sortablejs'
import { h } from 'bk-lesscode-render'

/**
 * 基于 Sortable 排序组件
 * 可用于 vue2 或者 vue3
 */
export default {
    props: {
        list: {
            type: Array
        },
        options: {
            type: Object
        }
    },

    emits: ['choose', 'unchoose', 'start', 'end', 'add', 'update', 'sort', 'remove', 'filter', 'move', 'clone', 'change'],

    data () {
        return {
            renderList: []
        }
    },

    watch: {
        list: {
            handler () {
                this.renderList = this.list
            },
            immediate: true
        }
    },

    mounted () {
        this.$nextTick(() => {
            Sortable.create(this.$el, {
                onChoose: (event) => this.triggerEvent('choose', event),
                onUnchoose: (event) => this.triggerEvent('unchoose', event),
                onEnd: (event) => this.triggerEvent('end', event),
                onSort: (event) => this.triggerEvent('sort', event),
                onFilter: (event) => this.triggerEvent('filter', event),
                onMove: (event) => this.triggerEvent('move', event),
                onClone: (event) => this.triggerEvent('clone', event),
                onStart: (event) => this.handleStart(event),
                onAdd: (event) => this.handleAdd(event),
                onUpdate: (event) => this.handleUpdate(event),
                onRemove: (event) => this.handleRemove(event),
                ...this.options
            })
        })
    },

    methods: {
        triggerEvent (name, arg) {
            this.$emit(name, arg)
        },
        handleStart (event) {
            const dragItem = event.item
            const index = Array.from(this.$el.children).findIndex(child => child === dragItem)
            dragItem._underlying_vm_ = this.renderList[index]
        },
        handleAdd (event) {
            const element = event.item._underlying_vm_
            this.renderList.splice(event.newIndex, 0, element)
            const added = { element, newIndex: event.newIndex }
            this.triggerEvent('change', { added })
            this.triggerEvent('add', event)
        },
        handleUpdate (event) {
            const oldIndex = event.oldIndex
            const newIndex = event.newIndex
            // 先移除当前节点
            const [element] = this.renderList.splice(oldIndex, 1)
            // 插入
            this.renderList.splice(newIndex, 0, element)
            const moved = { element, oldIndex, newIndex }
            this.triggerEvent('change', { moved })
        },
        handleRemove (event) {
            const element = event.item._underlying_vm_
            const oldIndex = event.oldIndex
            this.renderList.splice(oldIndex, 1)
            const removed = { element, oldIndex }
            this.triggerEvent('change', { removed })
            this.triggerEvent('remove', event)
        }
    },

    render (render) {
        h.init(render)

        return h({
            component: 'div',
            children: this.$slots.default
        })
    }
}
