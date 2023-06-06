import cssModule from './bk-error.css?module'
import { h } from 'bk-lesscode-render'

export default {
    data () {
        return {
            message: ''
        }
    },
    mounted () {
        this.message = this.$route.meta.message
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'bk-exception',
            class: cssModule['exception-wrap-item'],
            props: {
                type: 500
            },
            children: [
                h({
                    component: 'div',
                    children: [
                        self.message
                    ]
                })
            ]
        })
    }
}
