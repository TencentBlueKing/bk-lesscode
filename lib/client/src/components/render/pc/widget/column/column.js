import cssModule from './column.postcss?module'
import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import Draggable from '../../components/draggable/draggable'
import ResolveComponent from '../../resolve-component/resolve-component'

export default {
    name: 'render-col',
    components: {
        Draggable,
        ResolveComponent
    },
    inheritAttrs: false,
    inject: ['renderGrid'],
    props: {
        componentData: {
            type: Object,
            default: () => ({})
        }
    },
    computed: {
        defaultMargin () {
            return LC.platform === 'PC' ? '10px' : '20rpx'
        }
    },
    created () {
        LC.addEventListener('appendChild', this.nodeCallback)
        LC.addEventListener('moveChild', this.nodeCallback)
        LC.addEventListener('insertAfter', this.nodeCallback)
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
                setTimeout(() => {
                    this.autoType(event.child)
                }, 20)
            }
        },
        /**
         * @desc 自动排版子组件
         */
        autoType (childNode) {
            if (this._isDestroyed || !childNode || childNode.isInteractiveComponent) {
                return
            }
            const {
                top: boxTop,
                left: boxLeft
            } = this.$refs.draggable.$el.getBoundingClientRect()
            const $childEl = childNode.$elm
            const {
                top: componentTop,
                left: componentLeft
            } = $childEl.getBoundingClientRect()
            const styles = {}
            if (componentTop > boxTop + 3) {
                styles['marginTop'] = '8px'
            }
            if (componentLeft > boxLeft + 3) {
                styles['marginLeft'] = '8px'
            }
            if (Object.keys(styles).length > 0) {
                childNode.setStyle(styles)
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: Draggable,
            ref: 'draggable',
            attrs: {
                'data-empty-content': self.$t('请拖入组件')
            },
            class: {
                [cssModule['column']]: true,
                [cssModule['render-grid-empty']]: self.renderGrid.isColumnEmpty,
                [cssModule['empty']]: self.componentData.children.length < 1
            },
            props: {
                sort: true,
                list: self.componentData.slot.default,
                componentData: self.componentData,
                group: {
                    name: 'component',
                    pull: true,
                    put: [
                        'layout',
                        'component'
                    ]
                }
            },
            children: self.componentData.slot.default.map(slotComponentData => h({
                component: ResolveComponent,
                ref: 'component',
                key: slotComponentData.renderKey,
                props: {
                    componentData: slotComponentData
                }
            }))
        })
    }
}
