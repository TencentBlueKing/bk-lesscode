import cssModule from './free-layout.postcss?module'
import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import DragLine from '../../../common/drag-line'
import Drag from '../../../common/drag'
import Draggable from '../../components/draggable/draggable'
import ResolveComponent from '../../resolve-component/resolve-component'
import { unitFilter } from 'shared/util.js'
import { autoStyle } from '@/common/util.js'

export default {
    name: 'free-layout',
    props: {
        componentData: {
            type: Object,
            default: () => ({})
        }
    },
    created () {
        this.dragLine = null
        this.drag = null

        this.mountedPosition = {
            top: 0,
            left: 0
        }

        LC.addEventListener('appendChild', this.nodeCallback)
        LC.addEventListener('moveChild', this.nodeCallback)
        LC.addEventListener('insertAfter', this.nodeCallback)
    },
    mounted () {
        // 进入画布，画布中有自由布局组件会调整内部组件的位置更新，需要重置false
        // 拖拽自由布局组件，触发setStyle方法  会通知 decorator.js 文件 notify
        setTimeout(() => {
            LC.triggerEventListener('updateCanvas', false)
        })
    },
    beforeDestroy () {
        LC.removeEventListener('appendChild', this.nodeCallback)
        LC.removeEventListener('moveChild', this.nodeCallback)
        LC.removeEventListener('insertAfter', this.nodeCallback)
    },
    methods: {
        nodeCallback (event) {
            if (event.target.componentId === this.componentData.componentId) {
                this.$forceUpdate()
            }
        },
        /**
         * @desc 拖动元素
         * @param { Node } childNode 子元素对应的节点数据
         */
        doDrag (childNode) {
            if (!this.dragLine) {
                this.dragLine = new DragLine({
                    container: this.$el
                })
            }

            const dragEle = this.$refs[childNode.componentId].$el

            this.drag = new Drag(dragEle, {
                container: dragEle.parentNode
            })

            this.dragLine.setContainer(dragEle.parentNode)

            let isMoveing = false

            this.drag.on('move', () => {
                // fix: 自由布局选中时，直接按住其中的组件然后拖动，之后再松开鼠标，自由布局不会选中的问题
                LC.getActiveNode() && LC.getActiveNode().activeClear()

                if (!isMoveing) {
                    LC.triggerEventListener('componentMouserleave')
                    childNode.activeClear()
                }
                isMoveing = true
                this.dragLine.check(this.drag.$elem, '[role="component-root"]')
            }).on('end', () => {
                this.dragLine.uncheck()
                const left = autoStyle(childNode, 'left', parseFloat(this.drag.$elem.style.left), true)
                const top = autoStyle(childNode, 'top', parseFloat(this.drag.$elem.style.top), true)

                childNode.setStyle({
                    left: left,
                    top: top
                })
                childNode.active()
                isMoveing = false
            })
        },
        /**
         * @desc 子元素被添加时记录鼠标位置
         * @param { Object } event
         */
        handleAdd (event) {
            const {
                pageX,
                pageY
            } = event.originalEvent

            this.mountedPosition = {
                top: pageY,
                left: pageX
            }
        },
        /**
         * @desc组件 wrapper mounted 事件回调
         * @param { Node } childNode 子元素对应的节点数据
         */
        handleComponentMounted (childNode) {
            const $elem = this.$refs[childNode.componentId].$el

            this.doDrag(childNode)

            // setTimeout 保证 drag add 事件已经处理完毕
            setTimeout(() => {
                const freeLayoutContainer = this.$refs[this.componentData.componentId]
                if (!freeLayoutContainer) {
                    return
                }
                const {
                    offsetWidth: componentWidth,
                    offsetHeight: componentHeight
                } = $elem

                const {
                    top: containerTop,
                    right: containerRight,
                    bottom: containerBottom,
                    left: containerLeft
                } = freeLayoutContainer.getBoundingClientRect()

                const {
                    top: originalTop,
                    left: originalLeft
                } = this.mountedPosition

                let top = 0
                let left = 0
                const borderWidth = 2 // border占用了2px
                // 组件默认不能超过容器范围
                // top 位置计算

                if (childNode.style.top) {
                    top = unitFilter(childNode.style.top)
                } else {
                    if (originalTop + componentHeight > containerBottom) {
                        top = containerBottom - containerTop - componentHeight
                    } else {
                        top = originalTop - containerTop - 15
                    }
                    top = autoStyle(childNode, 'top', Math.max(top, 10), true)
                }
                // left 位置计算
                if (childNode.style.left) {
                    left = unitFilter(childNode.style.left)
                } else {
                    if (originalLeft + componentWidth + borderWidth > containerRight) {
                        left = containerRight - containerLeft - componentWidth - borderWidth
                    } else {
                        // originLeft是鼠标的PageX,即距离document左上角的横坐标；
                        // 如果是鼠标拖入的组件，这个值一定比containerLeft大，calculateLeft的计算则是合适的值;
                        // 但是当组件是粘贴进去的，没有鼠标位置，left为0，计算出为负值，显然是不合适的
                        const calculateLeft = originalLeft - containerLeft - 15
                        left = calculateLeft < 0 ? 0 : calculateLeft
                    }
                    left = autoStyle(childNode, 'left', left, true)
                }

                childNode.setStyle({
                    position: 'absolute',
                    top,
                    left
                })
            })
        },

        /**
         * @desc组件 组件 wrapper mousedown 事件回调
         * @param { Node } childNode 子元素对应的节点数据
         * @param { Object } event
         */
        handleComponentMousedown (childNode, event) {
            event.stopPropagation()
            event.preventDefault()
            setTimeout(() => {
                this.doDrag(childNode)
            })
        },
        /**
         * @desc 当 freelayout 内部组件变化时，需要计算所有组件高度，保证 freelayout 在编辑状态尺寸自适应
         */
        handleComponentUpdate () {

        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            ref: self.componentData.componentId,
            attrs: {
                'data-empty-content': self.$t('请拖入组件')
            },
            class: {
                [cssModule['free-layout']]: true,
                [cssModule['empty']]: self.componentData.children.length < 1
            },
            style: self.componentData.style,
            children: [
                h({
                    component: Draggable,
                    class: cssModule['wrapper'],
                    style: {
                        height: self.componentData.style.height
                    },
                    props: {
                        componentData: self.componentData,
                        list: self.componentData.slot.default,
                        ghostClass: cssModule['drag-ghost'],
                        forceFallback: false,
                        group: {
                            pull: false,
                            put: [
                                'component'
                            ]
                        }
                    },
                    on: {
                        add: self.handleAdd
                    },
                    children: self.componentData.slot.default.map((slotData) => h({
                        component: ResolveComponent,
                        ref: slotData.componentId,
                        key: slotData.renderKey,
                        props: {
                            componentData: slotData,
                            attachToFreelayout: true
                        },
                        on: {
                            'component-mounted': () => self.handleComponentMounted(slotData),
                            'component-mousedown': (event) => self.handleComponentMousedown(slotData, event),
                            'component-update': () => self.handleComponentUpdate()
                        }
                    }))
                })
            ]
        })
    }
}
