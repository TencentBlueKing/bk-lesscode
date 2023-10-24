import { h } from 'bk-lesscode-render'

export default {
    name: 'widget-data-manage-container',
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object,
            required: true
        }
    },
    data () {
        return {}
    },
    methods: {},
    render (render) {
        h.init(render)

        return h({
            component: 'div',
            children: ['数据管理容器']
        })
    }
}
