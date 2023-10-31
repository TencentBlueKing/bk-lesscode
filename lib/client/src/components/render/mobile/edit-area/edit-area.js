import cssModule from '../area.postcss?module'
import {
    ref,
    framework,
    h,
    onMounted
} from 'bk-lesscode-render'
import layout from '../widget/layout/index/index'
import render from '../../pc/index'
import getModelInfo from '../common/model'
import previewSwitch from '../preview-switch/preview-switch'
/* eslint import/no-webpack-loader-syntax: off */
import vanStyle from '!!raw-loader!vant/lib/index.css'
import vant3Style from '!!raw-loader!shared/page-code/style/vant3.style.css'
import { injectCss, removeVantStyle } from 'shared/util'

export default {
    setup (props) {
        const { canvasSize, model, modelList } = getModelInfo()

        const { preview } = ref(props)
        const isShowModeList = ref(false)

        onMounted(() => {
            removeVantStyle()
            injectCss(framework === 'vue3' ? vant3Style : vanStyle)
        })

        return {
            canvasSize,
            model,
            modelList,
            preview,
            isShowModeList
        }
    },
    render (renderMethod) {
        h.init(renderMethod)

        const self = this

        const renderDropDownTrigger = () => {
            return h({
                component: 'div',
                slot: 'dropdown-trigger',
                class: cssModule['dropdown-text'],
                children: [
                    h({
                        component: 'span',
                        on: {
                            click () {
                                self.isShowModeList = true
                            }
                        },
                        children: [
                            self.model,
                            h({
                                component: 'i',
                                class: 'bk-icon icon-down-shape'
                            })
                        ]
                    })
                ]
            })
        }

        const renderDropDownV3 = () => {
            return h({
                component: 'bk-dropdown',
                props: {
                    trigger: 'click',
                    isShow: self.isShowModeList
                },
                slots: {
                    default () {
                        return renderDropDownTrigger()
                    },
                    content () {
                        return h({
                            component: 'bk-dropdown-menu',
                            children: self.modelList.map((item) => {
                                return h({
                                    component: 'bk-dropdown-item',
                                    key: item.key,
                                    class: {
                                        [cssModule.active]: item.key === self.model
                                    },
                                    on: {
                                        click () {
                                            self.isShowModeList = false
                                            self.model = item.key
                                        }
                                    },
                                    children: [
                                        item.text
                                    ]
                                })
                            })
                        })
                    }
                }
            })
        }

        const renderDropDownV2 = () => {
            return h({
                component: 'bk-dropdown-menu',
                props: {
                    trigger: 'click'
                },
                class: 'mobile-edit-area-dropdown',
                slots: {
                    'dropdown-trigger' () {
                        return renderDropDownTrigger()
                    },
                    'dropdown-content' () {
                        return h({
                            component: 'ul',
                            slot: 'dropdown-content',
                            class: cssModule['bk-dropdown-list'],
                            children: self.modelList.map((item) => {
                                return h({
                                    component: 'li',
                                    key: item.key,
                                    class: {
                                        [cssModule.active]: item.key === self.model
                                    },
                                    on: {
                                        click () {
                                            self.model = item.key
                                        }
                                    },
                                    children: [
                                        h({
                                            component: 'span',
                                            class: cssModule['list-item-text'],
                                            children: [
                                                item.text
                                            ]
                                        })
                                    ]
                                })
                            })
                        })
                    }
                }
            })
        }

        const renderPreviewSwitch = () => {
            return h({
                component: previewSwitch,
                props: {
                    value: self.preview
                },
                on: {
                    change (val) {
                        self.preview = val
                    }
                }
            })
        }

        const renderTool = () => {
            return h({
                component: 'div',
                class: cssModule['title'],
                children: [
                    h({
                        component: 'span',
                        class: cssModule['title-text'],
                        children: [
                            self.$t('编辑区')
                        ]
                    }),
                    h({
                        component: 'div',
                        class: cssModule['edit-button'],
                        children: [
                            framework === 'vue2' ? renderDropDownV2() : renderDropDownV3(),
                            renderPreviewSwitch()
                        ]
                    })
                ]
            })
        }

        const renderDraw = () => {
            return h({
                component: 'div',
                attrs: {
                    id: 'lesscodeMobileDraw'
                },
                class: cssModule['edit-area'],
                style: {
                    width: self.canvasSize.width + 'px',
                    height: self.canvasSize.height + 'px'
                },
                children: [
                    h({
                        component: layout,
                        children: [
                            h({
                                component: render
                            })
                        ]
                    })
                ]
            })
        }

        return h({
            component: 'div',
            class: cssModule['area-wrapper'],
            attrs: {
                id: 'mobileDrawContent'
            },
            children: [
                renderTool(),
                renderDraw()
            ]
        })
    }
}
