import cssModule from './resolve-component.postcss?module'
import _ from 'lodash'
import LC from '@/element-materials/core'
import RenderComponent from '../render-component'
import RenderSlot from '../render-slot'
import { h } from 'bk-lesscode-render'

const getRenderStyleDisplayValue = display => {
    switch (display) {
        case 'flex':
        case 'grid':
        case 'block':
            return 'block'
        case 'inline-flex':
        case 'inline-grid':
        case 'inline-block':
            return 'inline-block'
        case 'inline':
            return 'inline'
        // 默认按块级元素处理
        default:
            return 'block'
    }
}

const isNumberValue = value => {
    return /^[-]?\d/.test(value)
}

// 记录 mousedown 状态
// mousedown时不响应mousemove
let isMousedown = false

export const setMousedown = value => {
    isMousedown = value
}

const safeStyles = {
    // fix: 影响子元素排版
    display: 'block',
    'padding': '',
    'padding-top': '',
    'padding-right': '',
    'padding-bottom': '',
    'padding-left': '',
    'line-height': '',
    'letter-spacing': '',
    'word-spacing': '',
    'text-align': '',
    'text-decoration': '',
    'text-indent': '',
    'text-overflow': '',
    'text-rendering': '',
    'text-size-adjust': '',
    'text-shadow': '',
    'text-transform': '',
    'word-break': '',
    'word-wrap': '',
    'white-space': '',
    // fix: 父子元素效果叠加
    'background': '',
    'background-attachment': '',
    'background-color': '',
    'background-image': '',
    'background-position': '',
    'background-repeat': '',
    'background-size': '',
    'border': '',
    'border-image': '',
    'border-collapse': '',
    'border-color': '',
    'border-top': '',
    'border-right': '',
    'border-bottom': '',
    'border-left': '',
    'border-top-color': '',
    'border-right-color': '',
    'border-bottom-color': '',
    'border-left-color': '',
    'border-spacing': '',
    'border-style': '',
    'border-top-style': '',
    'border-right-style': '',
    'border-bottom-style': '',
    'border-left-style': '',
    'border-width': '',
    'border-top-width': '',
    'border-right-width': '',
    'border-bottom-width': '',
    'border-left-width': '',
    'border-radius': '',
    'border-top-right-radius': '',
    'border-bottom-right-radius': '',
    'border-bottom-left-radius': '',
    'border-top-left-radius': '',
    'border-radius-topright': '',
    'border-radius-bottomright': '',
    'border-radius-bottomleft': '',
    'border-radius-topleft': '',
    opacity: ''
}

export default {
    name: 'resolve-component',
    components: {
        RenderComponent,
        RenderSlot
    },
    emits: ['component-update', 'component-mounted', 'component-mousedown'],
    props: {
        componentData: {
            type: Object,
            required: true
        },
        attachToFreelayout: {
            type: Boolean,
            default: false
        }
    },
    data () {
        return {
            bindAttrsAlign: {},
            // 默认会继承组件的 style 配置，如果直接继承有些样式会造成排版问题需要重置
            safeStyles: Object.assign({}, safeStyles),
            // 百分比宽度时需要修正相对父级的值
            fixPercentStyleWidth: false,
            // 百分比高度时需要修正相对父级的值
            fixPercentStyleHeight: false
        }
    },
    computed: {
        /**
         * @desc 为了达到编辑区渲染排版效果而创建的一些影子组件
         * @returns { Boolean }
         */
        isShadowComponent () {
            const shadowComMap = {
                'free-layout': true,
                'render-block': true,
                'render-grid': true,
                'h5-container': true,
                'h5-page': true,
                'render-column': true,
                'widget-form': true,
                'widget-form-item': true,
                'widget-tab': true,
                'resolve-component': true
            }
            return shadowComMap[this.componentData.type] || false
        },

        isHtmlElement () {
            const htmlElementMap = {
                'p': true,
                'span': true,
                'i': true,
                'img': true,
                'pre': true
            }
            return htmlElementMap[this.componentData.type] || false
        }
    },
    created () {
        // 优先获取组件的 material Config 缓存起来，
        // 后续需要使用直接使用这个不在从 componentData.material 获取
        this.material = this.componentData.material
        LC.addEventListener('update', this.updateCallback)
        LC.addEventListener('rollback', this.rollbackCallback)
    },
    mounted () {
        this.safeStylesOfDisplay()
        this.safeStyleOfWidth()
        this.safeStyleOfHeight()
        this.safeStyleOfLineHeight()
        this.setDefaultStyleWithAttachToFreelayout()
        this.updateAlign()
        this.componentData.mounted(this.$refs.componentRoot)
        this.$emit('component-mounted')
    },
    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallback)
        LC.removeEventListener('rollback', this.rollbackCallback)
        setMousedown(false)
        // 销毁时如果组件被激活，取消激活状态
        if (this.componentData.isActived) {
            this.componentData.activeClear()
        }
    },
    methods: {
        // 编辑更新
        updateCallback (event) {
            if (event.target.componentId === this.componentData.componentId) {
                this.safeStylesOfDisplay()
                this.safeStyleOfWidth()
                this.safeStyleOfHeight()
                this.safeStyleOfLineHeight()
                this.updateAlign()
                this.$forceUpdate()
                this.$emit('component-update')
            }
        },
        rollbackCallback () {
            this.componentData.mounted(this.$refs.componentRoot)
        },
        /**
         * @desc 保证组件的 display 配置和渲染正确
         */
        safeStylesOfDisplay () {
            if (this.isShadowComponent) {
                return
            }

            // 优先使用自定义配置的 display
            const customDisplay = this.componentData.style.display
            if (customDisplay) {
                this.safeStyles = Object.assign({}, this.safeStyles, {
                    display: getRenderStyleDisplayValue(customDisplay)
                })
                return
            }

            // 兼容异步组件 bk-custom-icon
            if (['bk-custom-icon'].includes(this.componentData.type)) {
                this.safeStyles = Object.assign({}, this.safeStyles, {
                    display: 'inline-block'
                })
                return
            }

            this.$nextTick(() => {
                // 因为异步任务执行的时机问题，此时可能组件已经被销毁
                if (!this.$refs.componentRoot) {
                    return
                }

                // 继承组件渲染结果的 display
                const $baseComponentEl = this.$refs.componentRoot.querySelector('[lesscode-base-component]')
                if ($baseComponentEl) {
                    const {
                        display
                    } = window.getComputedStyle($baseComponentEl)
                    this.safeStyles = Object.assign({}, this.safeStyles, {
                        display: getRenderStyleDisplayValue(display)
                    })
                }
            })
        },
        /**
         * @desc 保证组件的 width 渲染正确
         *
         * 某些组件可能是通过 prop 配置 width 而不是直接配置 css 的 width
         */
        safeStyleOfWidth () {
            if (this.isShadowComponent) {
                return
            }
            const componentDataStyle = this.componentData.style
            // 绝对定位并且同时设置了left、right
            if (
                componentDataStyle.position === 'absolute'
                && isNumberValue(componentDataStyle.left)
                && isNumberValue(componentDataStyle.right)) {
                this.safeStyles = Object.assign({}, this.safeStyles, {
                    width: componentDataStyle.width
                })
                this.fixPercentStyleWidth = true
                return
            }
            // 优先使用自定义配置的 width
            if (_.has(componentDataStyle, 'width')) {
                this.safeStyles = Object.assign({}, this.safeStyles, {
                    width: componentDataStyle.width
                })
                this.fixPercentStyleWidth = /%$/.test(componentDataStyle.width)
                return
            }

            this.$nextTick(() => {
                // 因为异步任务执行的时机问题，此时可能组件已经被销毁
                if (!this.$refs.componentRoot) {
                    return
                }
                const $baseComponentEl = this.$refs.componentRoot
                    .querySelector('[lesscode-base-component]')
                if ($baseComponentEl) {
                    const styleWidth = $baseComponentEl.style.width
                    if (styleWidth) {
                        this.safeStyles = Object.assign({}, this.safeStyles, {
                            width: styleWidth
                        })
                    }
                    this.fixPercentStyleWidth = /%$/.test(styleWidth)
                }
            })
        },
        /**
         * @desc 保证组件的 height 渲染正确
         *
         * 某些组件可能是通过 prop 配置 height 而不是直接配置 css 的 height
         */
        safeStyleOfHeight () {
            if (this.isShadowComponent) {
                return
            }
            const componentDataStyle = this.componentData.style
            // 绝对定位并且同时设置了top、bottom
            if (
                componentDataStyle.position === 'absolute'
                && isNumberValue(componentDataStyle.top)
                && isNumberValue(componentDataStyle.bottom)) {
                this.safeStyles = Object.assign({}, this.safeStyles, {
                    height: componentDataStyle.height
                })
                this.fixPercentStyleHeight = true
                return
            }
            // 优先使用自定义配置的 height
            if (_.has(this.componentData.style, 'height')) {
                this.safeStyles = Object.assign({}, this.safeStyles, {
                    height: componentDataStyle.height
                })
                this.fixPercentStyleHeight = /%$/.test(componentDataStyle.height)
                return
            }

            this.$nextTick(() => {
                // 因为异步任务执行的时机问题，此时可能组件已经被销毁
                if (!this.$refs.componentRoot) {
                    return
                }
                const $baseComponentEl = this.$refs.componentRoot
                    .querySelector('[lesscode-base-component]')
                if ($baseComponentEl) {
                    const styleHeight = $baseComponentEl.style.height
                    if (styleHeight) {
                        this.safeStyles = Object.assign({}, this.safeStyles, {
                            height: styleHeight
                        })
                    }
                    this.fixPercentStyleHeight = /%$/.test(styleHeight)
                }
            })
        },
        /**
         * @desc 保证组件的 line-height 渲染正确
         *
         * 渲染实际组件时会包裹一层 div 导致 line-height 与预览页面效果不一致
         */
        safeStyleOfLineHeight () {
            if (this.isShadowComponent) {
                return
            }
            const componentDataStyle = this.componentData.style

            // 优先使用自定义配置的 line-height
            if (_.has(componentDataStyle, 'line-height')
                && componentDataStyle['line-height'] !== '') {
                this.safeStyles = Object.assign({}, this.safeStyles, {
                    'line-height': componentDataStyle['line-height']
                })
                return
            }

            this.$nextTick(() => {
                // 因为异步任务执行的时机问题，此时可能组件已经被销毁
                if (!this.$refs.componentRoot) {
                    return
                }
                const $baseComponentEl = this.$refs.componentRoot
                    .querySelector('[lesscode-base-component]')
                if ($baseComponentEl) {
                    const styleLineHeight = document.defaultView.getComputedStyle($baseComponentEl).lineHeight
                    if (styleLineHeight) {
                        this.safeStyles = Object.assign({}, this.safeStyles, {
                            'line-height': styleLineHeight
                        })
                    }
                }
            })
        },
        /**
         * @desc 当组件在 freelayout 布局中时需要设置一些默认样式
         */
        setDefaultStyleWithAttachToFreelayout () {
            if (this.componentData._isMounted
                || !this.attachToFreelayout) {
                return
            }
            this.componentData.setStyle('position', 'absolute')
            let maxZIndex = 0
            this.componentData.parentNode.children.forEach(childrenNode => {
                maxZIndex = Math.max(maxZIndex, ~~childrenNode.style['z-index'])
            })
            this.componentData.setStyle('z-index', maxZIndex)
            const defaultStyle = {
                width: {
                    'bk-tag-input': '200px',
                    'bk-slider': '200px',
                    'bk-select': '200px',
                    'bk-member-selector': '400px',
                    'bk-cascade': '200px',
                    'bk-process': '600px',
                    'bk-steps': '500px',
                    'bk-divider': '500px',
                    'van-slider': '50%',
                    'van-cell': '100%',
                    'van-datetime-picker': '100%',
                    'van-picker': '100%',
                    'van-nav-bar': '100%',
                    'van-steps': '100%',
                    'van-tabs': '100%',
                    'van-skeleton': '100%',
                    'van-progress': '100%',
                    'van-notice-bar': '100%',
                    'van-divider': '100%'

                },
                pointerEvents: {
                    'bk-badge': 'none'
                },
                left: {
                    'van-cell': '0px',
                    'van-nav-bar': '0px',
                    'van-datetime-picker': '0px',
                    'van-picker': '0px',
                    'van-tabs': '0px',
                    'van-steps': '0px',
                    'van-skeleton': '0px',
                    'van-progress': '0px',
                    'van-notice-bar': '0px',
                    'van-divider': '0px'
                }
            }
            Object.keys(defaultStyle).forEach(styleName => {
                if (defaultStyle[styleName].hasOwnProperty(this.componentData.type)) {
                    this.componentData.setStyle(styleName, defaultStyle[styleName][this.componentData.type])
                }
            })
        },
        updateAlign () {
            this.bindAttrsAlign = {}
            if (this.componentData.align.horizontal) {
                this.bindAttrsAlign[this.componentData.align.horizontal] = ''
            }
            if (this.componentData.align.vertical) {
                this.bindAttrsAlign[this.componentData.align.vertical] = ''
            }
        },
        /**
         * @desc 组件点击事件回调
         */
        handleClick (event) {
            event.stopPropagation()
            LC.clearMenu()
            if (!this.componentData.isActived) {
                this.componentData.active()
            }
        },
        handleDBClick (event) {
            event.stopPropagation()
            LC.triggerEventListener('componentDbclick', {
                type: 'componentDbclick',
                target: this.componentData
            })
        },
        /**
         * @desc 记录鼠标按下状态，抛出 component-mousedown 事件
         * @param {Object} event 事件对象
         */
        handleMousedown (event) {
            event.stopPropagation()
            setMousedown(true)
            this.$emit('component-mousedown', event)
        },
        /**
         * @desc 切换鼠标按下状态
         */
        handleMouseup () {
            setMousedown(false)
        },
        /**
         * @desc 组件 wrapper mousemove 事件回调
         * @param { Object } event
         *
         * 如果鼠标是按下状态不执行 hover 的逻辑
         */
        handleMousemove (event) {
            // fix: 在自由布局中同样监听 mouseover 事件
            // 鼠标 hover 效果和自由布局拖动效果有点冲突
            if (isMousedown) {
                return
            }
            event.stopImmediatePropagation()
            event.stopPropagation()
            event.preventDefault()
            LC.triggerEventListener('componentHover', {
                type: 'componentHover',
                target: this.componentData
            })
        },
        /**
         * @desc 鼠标右键——选中组件、弹出菜单
         * @param { Object } event
         */
        handleShowContextmenu (event) {
            event.stopPropagation()
            this.componentData.active()
            LC.showMenu(event)
        }
    },
    render (render) {
        h.init(render)
        const self = this
        return h({
            component: 'div',
            ref: 'componentRoot',
            class: {
                [cssModule['component']]: true,
                [cssModule['component-root']]: true,
                [cssModule['precent-width']]: self.fixPercentStyleWidth,
                [cssModule['precent-height']]: self.fixPercentStyleHeight,
                'bk-layout-custom-component-wrapper': self.componentData.isCustomComponent
            },
            style: Object.assign({}, self.componentData.style, self.safeStyles),
            props: {
                list: self.list
            },
            on: {
                mousedown: self.handleMousedown,
                mousemove: self.handleMousemove,
                mouseup: self.handleMouseup,
                click: self.handleClick,
                dblclick: self.handleDBClick,
                contextmenu: self.handleShowContextmenu
            },
            attrs: {
                role: 'component-root',
                [self.componentData.componentId]: '',
                ...self.bindAttrsAlign
            },
            children: [
                h({
                    component: RenderComponent,
                    ref: self.componentData.componentId,
                    props: {
                        componentData: self.componentData
                    }
                })
            ]
        })
    }
}
