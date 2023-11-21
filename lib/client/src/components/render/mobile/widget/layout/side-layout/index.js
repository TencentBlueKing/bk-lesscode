import { h, ref, framework, watch } from 'bk-lesscode-render'
import useComponentAction from '../../../../hooks/component-action-use'
import cssModule from './index.postcss?module'
import store from '@/store'

/**
 * 根据提供的Vue版本获取侧边菜单属性。Vue3与Vue2的v-model语法糖不同
 *
 * @param {object} context - 上下文对象。
 * @return {object} 侧边菜单属性对象。
 */
const getSideMenuProps = (context) => {
    return framework === 'vue3' ? {
        props: {
            modelValue: context.activeIndex
        },
        on: {
            'update:modelValue': (val) => {
                context.activeIndex.value = val
            }
        }
    } : {
        props: {
            activeKey: context.activeIndex,
            value: context.activeIndex
        },
        on: {
            'input': (val) => {
                context.activeIndex.value = val
            }
        }
    }
}

export default {
    setup () {
        const layoutName = 'mobileSideMenu'
        const { isSelectedRef, componentClickHandler, curTemplateData } = useComponentAction(false, layoutName, 'MOBILE')
        const activeIndex = ref(0)

        watch(
            curTemplateData,
            (val) => {
                const menuList = val?.menuList
                const { id: pageId } = store.getters['page/pageDetail']
                if (menuList) {
                    menuList.forEach((menu, index) => {
                        if (+menu.pageId === +pageId) {
                            activeIndex.value = index
                            console.log('====', activeIndex.value)
                        }
                    })
                }
            }, {
                deep: true,
                immediate: true
            }
        )
        
        return {
            isTabbarSelected: isSelectedRef,
            componentClickHandler,
            curTemplateData,
            activeIndex
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: [cssModule['mobile-sidebar-layout-wrapper'], cssModule['mobile-layout-wrapper'], 'bk-lesscode-mobile-layout-wrapper'],
            ref: 'layout',
            children: [
                h({
                    component: 'van-sidebar',
                    ...getSideMenuProps(self),
                    children: [
                        h({
                            component: 'div',
                            class: [cssModule['sidebar-item-wrapper'], { selected: self.isTabbarSelected }],
                            on: {
                                click: self.componentClickHandler
                            },
                            children: self.curTemplateData?.menuList?.map((menu) => {
                                return h({
                                    component: 'van-sidebar-item',
                                    key: menu.id,
                                    class: cssModule['van-sidebar-item'],
                                    props: {
                                        replace: true,
                                        title: menu.name,
                                        to: menu.fullPath,
                                        dot: menu.dot,
                                        badge: menu.badge,
                                        disabled: menu.disabled
                                    }
                                })
                            })
                        })
                    ]
                }),
                h({
                    component: 'div',
                    class: cssModule['sidebar-edit-area-wrapper'],
                    children: typeof this.$slots.default === 'function' ? this.$slots.default() : this.$slots.default
                })
            ]
        })
    }
}
