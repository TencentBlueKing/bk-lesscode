import {
    h,
    version
} from 'bk-lesscode-render'

export default {
    props: {
        children: Array,
        icon: String,
        id: String,
        title: String
    },

    methods: {
        handleOpen () {
            this.$refs.item?.handleOpen?.()
        }
    },

    render (render) {
        h.init(render)

        const hasChild = this.children?.length > 0

        // 渲染Vue2导航子菜单
        if (version === 2) {
            return h({
                component: 'bk-navigation-menu-item',
                ref: 'item',
                props: {
                    hasChild,
                    icon: this.icon,
                    id: this.id
                },
                children: [
                    this.title,
                    ...this.children.map(childrenItem => h({
                        component: 'bk-navigation-menu-item',
                        slot: 'child',
                        key: childrenItem.id,
                        props: {
                            id: childrenItem.pageCode
                        },
                        children: [
                            childrenItem.name
                        ]
                    }))
                ]
            })
        }
        // 渲染 vue3
        const renderIconSlot = (icon) => {
            if (!icon) return ''
            return h({
                component: 'i',
                class: icon
            })
        }
        const renderMenuItem = (key, title, icon) => {
            return h({
                component: 'bk-menu-item',
                props: {
                    key
                },
                slots: {
                    icon: () => renderIconSlot(icon),
                    default: () => title
                }
            })
        }
        if (hasChild) {
            return h({
                component: 'bk-submenu',
                props: {
                    key: this.id,
                    title: this.title
                },
                slots: {
                    icon: renderIconSlot(this.icon),
                    default: () => this.children.map(childrenItem => renderMenuItem(childrenItem.pageCode, childrenItem.name))
                }
            })
        }
        // 单个 menu-item
        return renderMenuItem(this.id, this.title, this.icon)
    }
}
