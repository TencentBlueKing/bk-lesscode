import cssModule from './row.postcss?module'
import { h } from 'bk-lesscode-render'

export default {
    name: 'render-row',
    inheritAttrs: false,
    props: {
        // 栅格间距，单位 px，左右平分
        gutter: {
            type: Number,
            default: 0
        },
        // 栅格容器的左右外边距
        marginHorizontal: {
            type: Number,
            default: 1
        },
        // 栅格容器的上下外边距
        marginVertical: {
            type: Number,
            default: 1
        },
        // 控制 row 是否使用 flex 布局
        // flex 可帮助撑开 bk-col 的高度，避免复杂的 dom 计算
        flex: {
            type: Boolean,
            default: true
        }
    },
    data () {
        return {
            renderCols: 0,
            renderGutter: this.gutter,
            renderFlex: this.flex
        }
    },
    watch: {
        flex: {
            handler (newVal) {
                this.renderFlex = newVal
            },
            immediate: true
        },
        gutter: {
            handler (newVal) {
                this.renderGutter = newVal
            },
            immediate: true
        }
    },
    render (render) {
        h.init(render)

        return h({
            component: 'div',
            class: cssModule['row'],
            attrs: {
                role: 'render-row'
            },
            children: this.$slots.default
        })
    }
}
