import {
    h,
    framework
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
        },

        renderVue2 () {
            return h({
                component: 'bk-navigation-menu-item',
                ref: 'item',
                props: {
                    hasChild: this.children?.length > 0,
                    icon: this.icon,
                    id: this.id
                },
                children: [
                    this.title,
                    ...this.children?.map?.(childrenItem => h({
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
        },

        renderVue3 () {
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
            // 多个子节点
            if (this.children?.length > 0) {
                return h({
                    component: 'bk-submenu',
                    props: {
                        key: this.id,
                        title: this.title
                    },
                    slots: {
                        icon: renderIconSlot(this.icon),
                        default: () => this.children?.map?.(childrenItem => renderMenuItem(childrenItem.pageCode, childrenItem.name))
                    }
                })
            }
            // 单个 menu-item
            return renderMenuItem(this.id, this.title, this.icon)
        }
    },

    render (render) {
        h.init(render)
        if (framework === 'vue2') {
            return this.renderVue2()
        } else {
            return this.renderVue3()
        }
    }
}
