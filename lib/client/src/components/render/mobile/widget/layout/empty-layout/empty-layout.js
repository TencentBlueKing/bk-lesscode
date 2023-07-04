import cssModule from './empty-layout.postcss?module'
import { h } from 'bk-lesscode-render'
import useComponentAction from '../../../../hooks/component-action-use'
export default {
    setup () {
        const layoutName = 'mobileEmptyLayout'
        const pageSetting = useComponentAction(false, layoutName, 'MOBILE')
        return {
            pageSetting
        }
    },
    render (render) {
        h.init(render)

        return h({
            component: 'div',
            class: [cssModule['mobile-empty-layout-wrapper'], cssModule['mobile-layout-wrapper'], 'bk-lesscode-mobile-layout-wrapper'],
            ref: 'layout',
            children: this.$slots.default
        })
    }
}
