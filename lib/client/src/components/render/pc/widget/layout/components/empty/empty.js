import {
    h
} from 'bk-lesscode-render'

export default {
    render (render) {
        h.init(render)

        return h({
            component: 'div',
            class: 'lesscode-layout-empty',
            children: [
                h({
                    component: 'div',
                    class: 'container-content',
                    children: this.$slots.default
                })
            ]
        })
    }
}
