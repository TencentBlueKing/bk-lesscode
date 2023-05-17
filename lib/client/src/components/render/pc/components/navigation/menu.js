import {
    h,
    framework
} from 'bk-lesscode-render'

export default {
    props: {
        defaultActive: String,
        themeColorProps: Object,
        openedKeys: Array
    },

    render (render) {
        h.init(render)

        if (framework === 'vue2') {
            return h({
                component: 'bk-navigation-menu',
                props: {
                    uniqueOpened: false,
                    toggleActive: true,
                    defaultActive: this.defaultActive,
                    ...this.themeColorProps
                },
                children: this.$slots.default
            })
        }
        return h({
            component: 'bk-menu',
            props: {
                uniqueOpen: false,
                activeKey: this.defaultActive,
                openedKeys: this.openedKeys
            },
            children: this.$slots.default
        })
    }
}
