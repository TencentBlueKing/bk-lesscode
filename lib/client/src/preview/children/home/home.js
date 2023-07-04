import {
    h
} from 'bk-lesscode-render'

export default {
    name: 'Home',

    render (render) {
        h.init(render)

        return h({
            component: 'router-view'
        })
    }
}
