import cssModule from './tab-bar.postcss?module'
import { h } from 'bk-lesscode-render'
import useComponentAction from '../../../../hooks/component-action-use'

export default {
    setup () {
        const layoutName = 'mobileBottomMenu'
        const { isSelectedRef, componentClickHandler, curTemplateData } = useComponentAction(false, layoutName, 'MOBILE')
        return {
            isTabbarSelected: isSelectedRef,
            componentClickHandler,
            curTemplateData
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: [cssModule['mobile-tabbar-layout-wrapper'], cssModule['mobile-layout-wrapper'], 'bk-lesscode-mobile-layout-wrapper'],
            ref: 'layout',
            children: [
                typeof this.$slots.default === 'function' ? this.$slots.default() : this.$slots.default,
                h({
                    component: 'van-tabbar',
                    props: {
                        route: true
                    },
                    children: [
                        h({
                            component: 'div',
                            class: cssModule['tabbar-item-wrapper'],
                            on: {
                                click: self.componentClickHandler
                            },
                            children: self.curTemplateData?.menuList?.map((menu) => {
                                return h({
                                    component: 'van-tabbar-item',
                                    key: menu.id,
                                    class: cssModule['van-tabbar-item'],
                                    props: {
                                        replace: true,
                                        to: menu.fullPath,
                                        icon: menu.icon
                                    },
                                    children: [
                                        menu.name
                                    ]
                                })
                            })
                        })
                    ]
                })
            ]
        })
    }
}
