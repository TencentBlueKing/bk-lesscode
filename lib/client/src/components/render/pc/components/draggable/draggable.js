import draggableCssModule from './draggable.postcss?module'
import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import { setMousedown } from '../../resolve-component/resolve-component'
import sortable from '@/components/sortable'
import getRoot from '@/element-materials/core/static/get-root'
import clearCanvas from '@/element-materials/core/static/reset'
import store from '@/store'

export default {
    name: 'render-draggable',
    props: {
        list: {
            type: Array,
            required: false,
            default: null
        },
        componentData: {
            type: Object,
            required: true
        },
        ghostClass: {
            type: String
        },
        group: {
            type: Object,
            required: true
        },
        forceFallback: {
            type: Boolean
        }
    },
    inject: {
        attachToInteractiveComponent: {
            value: 'attachToInteractiveComponent',
            default: false
        }
    },
    emits: ['choose', 'unchoose', 'start', 'end', 'add', 'sort', 'change'],
    data () {
        return {
            dragGroup: this.group,
            styles: {}
        }
    },
    created () {
        LC.addEventListener('removeChild', this.removeChildCallback)
        LC.addEventListener('toggleInteractive', this.dragableCheck)
    },
    mounted () {
        // setTimeout(() => {
        //     this.$refs.draggable.computeIndexes?.()
        // })
    },
    beforeDestroy () {
        LC.removeEventListener('removeChild', this.removeChildCallback)
        LC.removeEventListener('toggleInteractive', this.dragableCheck)
    },
    methods: {
        /**
         * 交互式组件状态更新
         * @description 当交互式组件激活时，不属于交互式组件的drag area不可拖动
         *  只有关闭后，才可以继续拖拽
         */
        dragableCheck (event) {
            if (event.interactiveShow
                && !this.attachToInteractiveComponent) {
                this.dragGroup = Object.freeze({
                    pull: false,
                    put: false
                })
            } else {
                this.dragGroup = this.group
            }
        },
        removeChildCallback (event) {
            if (event.child.interactiveShow) {
                this.dragGroup = this.group
            }
        },
        /**
         * @desc 拖动选中
         * @param { Object } dragEvent
         */
        handleChoose (event) {
            const {
                height
            } = this.$refs.draggable.$el.getBoundingClientRect()
            this.styles = {
                height: `${height}px`
            }
            this.$emit('choose', event)
        },
        handleUnchoose (event) {
            this.styles = {}
            this.$emit('unchoose', event)
        },
        /**
         * @desc 开始拖拽
         * @param { Object } dragEvent
         */
        handleStart (event) {
            this.$emit('start', event)
            LC.triggerEventListener('componentDragStart', {
                type: 'componentDragStart'
            })
            // LC.triggerEventListener('componentMouserleave')
            // const activeNode = LC.getActiveNode()
            // if (activeNode) {
            //     activeNode.activeClear()
            // }
        },
        /**
         * @desc 结束拖拽
         * @param { Object } dragEvent
         */
        handleEnd (event) {
            this.styles = {}
            setMousedown(false)
            LC.triggerEventListener('componentDragEnd', {
                type: 'componentDragEnd'
            })
            this.$emit('end', event)
        },
        /**
         * @desc 添加组件
         * @param { Object } dragEvent
         */
        handleAdd (event) {
            // fix: vue-draggable 内部索引不更新的问题
            // this.$refs.draggable.computeIndexes()
            setMousedown(false)
            this.$emit('add', event)
        },
        handleSort (event) {
            this.$emit('sort', event)
        },
        /**
         * @desc 拖动更新
         * @param { Object } dragEvent
         */
        handleChange (event) {
            let operationNode = null
            const triggerEvent = {
                target: this.componentData,
                type: '',
                child: null
            }
            if (event.added) {
                operationNode = event.added.element
                triggerEvent.type = 'appendChild'
                // 拖动组件需要重置会影响排版的样式
                operationNode.setStyle({
                    position: '',
                    top: '',
                    right: '',
                    bottom: '',
                    left: '',
                    zIndex: '',
                    marginTop: '',
                    marginRight: '',
                    marginBottom: '',
                    marginLeft: ''
                })
                setTimeout(() => {
                    // 新加的组件默认选中
                    operationNode.active()
                }, 100)
            } else if (event.removed) {
                operationNode = event.removed.element
                triggerEvent.type = 'removeChild'
            } else if (event.moved) {
                operationNode = event.moved.element
                triggerEvent.type = 'moveChild'
            }
            
            triggerEvent.child = operationNode
            LC.triggerEventListener(triggerEvent.type, triggerEvent)
            LC.triggerEventListener('update', triggerEvent)
            // fix: vue-draggable 内部索引不更新的问题
            // this.$refs.draggable.computeIndexes()
            this.$emit('change', event)

            /** 优化H5使用体验，当H5插入到非root节点时，进行相关提示 */
            if (triggerEvent.child.type === 'h5-container' && triggerEvent.target.type !== 'root') {
                const root = getRoot()
                const updateH5Layout = () => {
                    root.appendChild(triggerEvent.child)
                }
                clearCanvas(
                    window.i18n.t('H5容器应在根节点上'),
                    window.i18n.t('H5容器默认占满全屏，与其他容器不兼容，是否自动清空其他容器，仅保留H5容器'),
                    updateH5Layout)
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: sortable,
            ref: 'draggable',
            class: draggableCssModule['drag'],
            style: self.styles,
            props: {
                list: self.list,
                options: {
                    group: self.dragGroup,
                    chosenClass: draggableCssModule['chosen'],
                    ghostClass: self.ghostClass || (store.state.Language === 'en' ? draggableCssModule['en-ghost'] : draggableCssModule['ghost']),
                    filter: '[data-render-drag="disabled"]',
                    forceFallback: self.forceFallback
                }
            },
            on: {
                choose: self.handleChoose,
                unchoose: self.handleUnchoose,
                start: self.handleStart,
                end: self.handleEnd,
                add: self.handleAdd,
                sort: self.handleSort,
                change: self.handleChange,
                ...self.$listeners
            },
            children: self.$slots.default
        })
    }
}
