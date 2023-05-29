import cssModule from './mobile-header.postcss?module'
import {
    h
} from 'bk-lesscode-render'
import headerHeight from '../mobile-header-height'

export default {
    setup () {
        const { height, time } = headerHeight()
        return {
            height,
            time
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderHeaderLeft = () => {
            return h({
                component: 'div',
                class: cssModule['header-left'],
                children: [
                    h({
                        component: 'span',
                        class: 'bk-drag-cellular-connection bk-drag-icon bk-drag mr5'
                    }),
                    h({
                        component: 'span',
                        class: 'mr5',
                        children: [
                            'iPhone'
                        ]
                    }),
                    h({
                        component: 'span',
                        class: 'mr5',
                        children: [
                            '5G'
                        ]
                    })
                ]
            })
        }

        const renderHeaderMid = () => {
            return h({
                component: 'div',
                class: cssModule['header-mid'],
                children: [
                    self.time
                ]
            })
        }

        const renderHeaderRight = () => {
            return h({
                component: 'div',
                class: cssModule['header-right'],
                children: [
                    h({
                        component: 'span',
                        children: ['100%']
                    }),
                    h({
                        component: 'span',
                        class: 'bk-drag-battery bk-drag-icon bk-drag ml5'
                    })
                ]
            })
        }

        return h({
            component: 'div',
            class: cssModule['phone-header'],
            style: {
                height: self.height + 'px'
            },
            children: [
                renderHeaderLeft(),
                renderHeaderMid(),
                renderHeaderRight()
            ]
        })
    }
}
