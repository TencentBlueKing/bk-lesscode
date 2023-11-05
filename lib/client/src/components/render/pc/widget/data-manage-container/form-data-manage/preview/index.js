import { h } from 'bk-lesscode-render'

export default {
    name: 'widget-data-manage-container-preview',
    render (render) {
        h.init(render)

        return h({
            component: 'div',
            children: '数据管理页预览'
        })
    }
}
