import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import './index.postcss'

export default {
    name: 'element-box',
    props: {
        elementData: {
            type: Object,
            default: () => ({})
        }
    },
    data () {
        return {
            selected: false,
            activePositionStyle: {
                position: 'absolute',
                top: '-22px',
                left: 0
            }
        }
    },
    mounted () {
        this.setSelected()
        LC.addEventListener('activeElementUpdate', this.setSelected)
    },
    beforeDestroy () {
        LC.removeEventListener('activeElementUpdate', this.setSelected)
    },
    methods: {
        setSelected () {
            const activeElement = LC.getActiveElement()
            if (!activeElement) {
                this.selected = false
                return
            }

            const { componentData, elementData } = activeElement
            const selected = elementData.id === this.elementData.id
            if (selected) {
                this.selected = true
                this.$nextTick(() => {
                    if (this.$refs.elementBox) {
                        const toolsWrapperEl = this.$refs.elementBox.querySelector('.tools-wrapper')
                        const { left } = this.$refs.elementBox.getBoundingClientRect()
                        const { right: containerRight } = componentData.$elm.getBoundingClientRect()
                        const { width } = toolsWrapperEl.getBoundingClientRect()
                        if ((left + width) >= containerRight - 24) {
                            this.activePositionStyle.right = 0
                            this.activePositionStyle.left = 'auto'
                        } else {
                            this.activePositionStyle.left = 0
                            this.activePositionStyle.right = 'auto'
                        }
                    }
                })
            } else {
                this.selected = false
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderTools = () => {
            return h({
                component: 'div',
                class: 'tools-wrapper',
                style: self.activePositionStyle,
                children: [
                    h({
                        component: 'span',
                        class: 'ele-id',
                        children: this.elementData.id
                    }),
                    h({
                        component: 'span',
                        class: 'tool-btn',
                        on: { click: () => {
                            self.$emit('copy')
                        } },
                        children: [h({ component: 'i', class: 'bk-icon icon-copy' })]
                    }),
                    h({
                        component: 'span',
                        class: 'tool-btn',
                        on: { click: () => {
                            self.$emit('del')
                        } },
                        children: [h({ component: 'i', class: 'bk-drag-icon bk-drag-shanchu' })]
                    })
                ]
            })
        }

        const renderElement = () => {
            return h({
                component: 'div',
                class: 'element-wrapper',
                children: this.$slots.default
            })
        }

        return h({
            component: 'div',
            ref: 'elementBox',
            class: ['element-box', { selected: this.selected }],
            on: {
                click: (e) => {
                    e.stopPropagation()
                    self.$emit('click')
                }
            },
            children: [
                this.selected ? renderTools() : null,
                renderElement()
            ]
        })
    }
}
