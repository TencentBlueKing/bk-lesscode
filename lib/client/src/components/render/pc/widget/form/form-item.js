import cssModule from './form-item.postcss?module'
import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import ResolveComponent from '../../resolve-component/resolve-component'

export default {
    name: 'widget-form-item',
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object,
            default: () => ({})
        },
        formType: {
            type: String,
            default: ''
        }
    },
    computed: {
        isInlineLayout () {
            return this.formType === 'inline'
        }
    },
    created () {
        LC.addEventListener('update', this.updateCallback)
        LC.addEventListener('rollback', this.rollbackCallback)
    },
    mounted () {
        this.componentData.mounted(this.$refs.root)
    },
    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallback)
        LC.removeEventListener('rollback', this.rollbackCallback)
    },
    methods: {
        updateCallback ({ target }) {
            if (target.componentId === this.componentData.componentId) {
                this.$forceUpdate()
            }
        },
        rollbackCallback () {
            this.componentData.mounted(this.$refs.root)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            ref: 'root',
            class: {
                [cssModule['form-item']]: true,
                [cssModule['inline']]: self.isInlineLayout
            },
            children: [
                h({
                    component: 'bk-form-item',
                    props: self.componentData.prop,
                    children: self.componentData.slot.default.map((componentData) => {
                        return h({
                            component: ResolveComponent,
                            key: componentData.componentId,
                            props: {
                                componentData
                            }
                        })
                    })
                })
            ]
        })
    }
}
