import cssModule from './resolve-interactive-component.postcss?module'
import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import ResolveComponent from '../resolve-component/resolve-component'

export default {
    name: 'resolve-interactive-component',
    provide () {
        return {
            attachToInteractiveComponent: true
        }
    },
    props: {
        componentData: {
            type: Object,
            required: true
        }
    },
    created () {
        LC.addEventListener('update', this.updateCallback)
        LC.addEventListener('toggleInteractive', this.updateCallback)
        
        // 新拖入的交互式组件默认要显示出来
        if (!this.componentData._isMounted) {
            setTimeout(() => {
                this.componentData.toggleInteractive(true)
            })
        }
    },
    mounted () {
        if (!this.componentData._isMounted) {
            this.componentData.active()
        }
    },
    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallback)
        LC.removeEventListener('toggleInteractive', this.updateCallback)
    },
    methods: {
        updateCallback (event) {
            if (event.target.componentId === this.componentData.componentId) {
                this.$forceUpdate()
            }
        }
    },
    render (render) {
        h.init(render)
        const self = this

        return h({
            component: 'div',
            class: {
                [cssModule['interactive']]: true,
                [cssModule['hidden']]: !self.componentData.interactiveShow
            },
            attrs: {
                role: 'interactive-root',
                'data-render-drag': 'disabled'
            },
            children: [
                h({
                    component: ResolveComponent,
                    key: self.componentData.renderKey,
                    props: {
                        componentData: self.componentData
                    }
                })
            ]
        })
    }
}
