import cssModule from './simulator-mobile.postcss?module'
import {
    h
} from 'bk-lesscode-render'
import mobileHeader from '../mobile-header/mobile-header'
import '@vant/touch-emulator' // PC端模拟移动端事件 用于预览

export default {
    props: {
        pageSize: {
            type: Object,
            default: () => ({ height: 0, width: 0 })
        },
        source: {
            type: String,
            default: ''
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: cssModule['simulator-wrapper'],
            style: {
                width: self.pageSize.width + 'px',
                height: self.pageSize.height + 'px'
            },
            children: [
                h({
                    component: 'div',
                    class: cssModule['device-phone-frame'],
                    children: [
                        h({
                            component: 'div',
                            class: cssModule['device-phone']
                        })
                    ]
                }),
                h({
                    component: 'div',
                    class: cssModule['simulator-preview'],
                    style: {
                        width: self.pageSize.width + 'px',
                        height: self.pageSize.height + 'px'
                    },
                    children: [
                        h({
                            component: mobileHeader
                        }),
                        h({
                            component: 'iframe',
                            attrs: {
                                width: '100%',
                                height: '100%',
                                src: self.source
                            },
                            style: {
                                border: 'none'
                            }
                        })
                    ]
                })
            ]
        })
    }
}
