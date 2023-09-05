import { h } from 'bk-lesscode-render'
import tabBar from '../tab-bar/tab-bar'
import sideBar from '../side-layout'
import emptyLayout from '../empty-layout/empty-layout'
import useComponentAction from '../../../../hooks/component-action-use'

const componentMap = {
    'mobile-bottom': tabBar,
    'mobile-empty': emptyLayout,
    'mobile-side': sideBar
}
export default {
    components: {
        tabBar,
        emptyLayout,
        sideBar
    },
    setup () {
        const { layout } = useComponentAction(false, '', 'MOBILE')
        return {
            layout
        }
    },
    computed: {
        component () {
            return componentMap[this.layout] || emptyLayout
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
