import cssModule from './grid.postcss?module'
import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import ResolveComponent from '../../resolve-component/resolve-component'

export default {
    name: 'render-grid',
    components: {
        ResolveComponent
    },
    props: {
        componentData: {
            type: Object,
            default: () => ({})
        }
    },
    provide () {
        return {
            renderGrid: this
        }
    },
    data () {
        return {
            isColumnEmpty: true,
            isShowActiveBtn: false
        }
    },
    created () {
        this.spanTotalNumsMemo = 0
        this.updateChildColumn()

        LC.addEventListener('update', this.updateCallback)
        LC.addEventListener('active', this.activeCallback)
        LC.addEventListener('activeClear', this.activeClearCallback)
    },
    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallback)
        LC.removeEventListener('active', this.activeCallback)
        LC.removeEventListener('activeClear', this.activeClearCallback)
    },
    methods: {
        /**
         * @desc grid本身更新或者子组件column更新时都需要重新执行
         * @param { Object } event
         */
        updateCallback (event) {
            if (event.target.componentId === this.componentData.componentId
                || (
                    event.target.type === 'render-column'
                    && event.target.parentNode.componentId === this.componentData.componentId
                )) {
                this.$forceUpdate()
                this.updateChildColumn()
            }
        },
        /**
         * @desc 子组件column选中时需要给grid的tips
         */
        activeCallback (event) {
            this.isShowActiveBtn = event.target.parentNode === this.componentData
        },
        activeClearCallback () {
            this.isShowActiveBtn = false
            this.$forceUpdate()
        },
        /**
         * @desc gird有更新需要同步计算colum的样式
         */
        updateChildColumn () {
            const columnNodeList = this.componentData.children

            // 直接子组件column是否有拖入组件
            this.isColumnEmpty = true
            columnNodeList.forEach(node => {
                if (node.children.length > 0) {
                    this.isColumnEmpty = false
                }
            })
            // 计算每个column的宽度
            const spanTotalNums = columnNodeList.reduce((result, columnNode) => {
                return result + columnNode.prop.span
            }, 0)
            if (this.spanTotalNumsMemo === spanTotalNums) {
                return
            }
            
            this.spanTotalNumsMemo = spanTotalNums
            columnNodeList.forEach(node => {
                const renderWidth = `${Number((node.prop.span / spanTotalNums * 100).toFixed(4))}%`
                   
                if (node.style.width !== renderWidth) {
                    node.setStyle('width', renderWidth)
                }
            })
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: cssModule['grid'],
            children: self.componentData.slot.default.map((slotComponentData) => h({
                component: ResolveComponent,
                class: cssModule['col'],
                key: slotComponentData.renderKey,
                props: {
                    componentData: slotComponentData
                }
            }))
        })
    }
}
