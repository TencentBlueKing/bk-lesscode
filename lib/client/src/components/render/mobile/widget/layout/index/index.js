import { h } from 'bk-lesscode-render'
import tabBar from '../tab-bar/tab-bar'
import emptyLayout from '../empty-layout/empty-layout'
import store from '@/store'

const componentMap = {
    'mobile-bottom': tabBar,
    'mobile-empty': emptyLayout
}
export default {
    components: {
        tabBar
    },
    computed: {
        pageLayout () {
            return store.getters['layout/pageLayout']
        },
        component () {
            const type = this.pageLayout?.layoutType
            if (!componentMap[type]) {
                return emptyLayout
            }
            return componentMap[type]
        }
    },
    render (render) {
        h.init(render)

        return h({
            component: this.component,
            children: this.$slots.default
        })
    }
}
