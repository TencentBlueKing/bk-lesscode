import cssModule from './404.css?module'
import {
    h
} from 'bk-lesscode-render'

export default {
    computed: {
        pageRoute () {
            const pageCode = this.$route.query.pageCode // '' | undefined | code
            const pageRoute = this.$store.state['projectPageRouteList'].find(item => item.pageCode === pageCode)
            return pageRoute || { pageCode }
        }
    },
    render (render) {
        h.init(render)

        const renderChildren = () => {
            const children = []
            if (this.pageRoute.pageName) {
                children.push(h({
                    component: 'span',
                    children: [
                        `未找到页面，请检查页面“${this.pageRoute.pageName}”的路由配置`
                    ]
                }))
            } else if (this.pageRoute.pageCode === '') {
                children.push(h({
                    component: 'span',
                    children: [
                        '未找到应用首页，建议将地址“/”配置为应用默认首页'
                    ]
                }))
            } else if (!this.pageRoute.pageCode) {
                children.push(h({
                    component: 'span',
                    children: [
                        '未找到页面'
                    ]
                }))
            }
        }

        return h({
            component: 'bk-exception',
            class: cssModule['exception-wrap-item'],
            props: {
                type: '404'
            },
            children: renderChildren()
        })
    }
}
