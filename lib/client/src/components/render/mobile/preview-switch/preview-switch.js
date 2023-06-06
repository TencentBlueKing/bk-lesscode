import cssModule from './preview-switch.postcss?module'
import {
    h
} from 'bk-lesscode-render'
import LC from '@/element-materials/core'

export default {
    props: {
        value: {
            type: Boolean,
            default: true
        }
    },
    emits: ['change'],
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: cssModule['mobile-preview-switcher'],
            children: [
                h({
                    component: 'bk-switcher',
                    props: {
                        size: 'small',
                        theme: 'primary',
                        value: self.value
                    },
                    on: {
                        change (val) {
                            self.$emit('change', val)
                            const activeNode = LC.getActiveNode()
                            if (activeNode) {
                                activeNode.activeClear()
                            }
                            LC.triggerEventListener('componentMouserleave', {
                                type: 'componentMouserleave'
                            })
                            LC.triggerEventListener('mobilePreviewSwitch', val)
                        }
                    }
                })
            ]
        })
    }
}
