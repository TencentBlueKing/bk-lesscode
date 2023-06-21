
//   Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
//   Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
//   Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
//   You may obtain a copy of the License at
//   http://opensource.org/licenses/MIT
//   Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
//   an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
//   specific language governing permissions and limitations under the License.
import indexCssModule from './index.postcss?module'
import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import Draggable from '../components/draggable/draggable'
import Layout from '../widget/layout'
import ResolveComponent, { setMousedown } from '../resolve-component/resolve-component'
import ResolveInteractiveComponent from '../resolve-interactive-component/resolve-interactive-component'
import LesscodeFocus from '../tools/lesscode-focus'
import LesscodeTools from '../tools/lesscode-tool'
import LesscodeResize from '../tools/lesscode-resize'
import LesscodeMargin from '../tools/lesscode-margin'

export default {
    name: 'render',
    provide () {
        return {
            attachToInteractiveComponent: false
        }
    },
    data () {
        return {
            isReady: LC.__isReady,
            showNotVisibleMask: false,
            invisibleComponent: ''
        }
    },
    watch: {
        showNotVisibleMask (val) {
            if (val) {
                const activeNode = LC.getActiveNode()
                this.invisibleComponent = activeNode.componentId
            }
        }
    },
    created () {
        this.componentData = LC.getRoot()
        LC.addEventListener('ready', this.readyCallback)
        LC.addEventListener('update', this.updateCallback)
        LC.addEventListener('update', this.updateLogCallback)
        LC.addEventListener('active', this.interactiveCallback)
        LC.addEventListener('active', this.activeLogCallback)
        LC.addEventListener('toggleInteractive', this.interactiveCallback)
        LC.addEventListener('appendChild', this.nodeCallback)
        LC.addEventListener('moveChild', this.nodeCallback)
        LC.addEventListener('insertAfter', this.nodeCallback)
        LC.addEventListener('removeChild', this.interactiveCallback)
        LC.addEventListener('rollback', this.rollbackCallback)
    },
    mounted () {
        this.componentData.mounted(document.querySelector('#drawTarget'))
        LC._mounted()

        document.body.addEventListener('mousedown', this.mousedownCallback)
        document.body.addEventListener('mouseup', this.mouseupCallback)
        document.body.addEventListener('click', this.resetCallback)
    },
    beforeDestroy () {
        // remove created listener
        LC.removeEventListener('ready', this.readyCallback)
        LC.removeEventListener('update', this.updateCallback)
        LC.removeEventListener('update', this.updateLogCallback)
        LC.removeEventListener('active', this.interactiveCallback)
        LC.removeEventListener('active', this.activeLogCallback)
        LC.removeEventListener('toggleInteractive', this.interactiveCallback)
        LC.removeEventListener('appendChild', this.nodeCallback)
        LC.removeEventListener('moveChild', this.nodeCallback)
        LC.removeEventListener('insertAfter', this.nodeCallback)
        LC.removeEventListener('removeChild', this.interactiveCallback)
        LC.removeEventListener('rollback', this.rollbackCallback)
        // remove mounted listener
        document.body.removeEventListener('mousedown', this.mousedownCallback)
        document.body.removeEventListener('mouseup', this.mouseupCallback)
        document.body.removeEventListener('click', this.resetCallback)
    },
    methods: {
        readyCallback () {
            this.isReady = true
        },
        updateLogCallback (event) {
            console.log('\n')
            console.log(`%c>> ${new Date().toString().slice(0, 25)}`,
                'background-color: #3A84FF; color: #fff; padding: 2px 5px; border-radius: 3px; font-weight: bold;')
            console.log(`%c组件更新%c${event.target.componentId}`,
                'padding: 2px 5px; background: #ea3636; color: #fff; border-radius: 3px 0 0 3px;',
                'padding: 2px 5px; background: #42c02e; color: #fff; border-radius: 0 3px 3px 0; font-weight: bold;',
                event)
        },
        activeLogCallback (event) {
            console.log('\n')
            console.log(`%c>> ${new Date().toString().slice(0, 25)}`,
                'background-color: #3A84FF; color: #fff; padding: 2px 5px; border-radius: 3px; font-weight: bold;')
            console.log(`%c组件选中%c${event.target.componentId}`,
                'padding: 2px 5px; background: #ff9c01; color: #fff; border-radius: 3px 0 0 3px;',
                'padding: 2px 5px; background: #42c02e; color: #fff; border-radius: 0 3px 3px 0; font-weight: bold;',
                event)
        },
        updateCallback (event) {
            if (event.target.componentId === this.componentData.componentId) {
                this.$forceUpdate()
            }
        },
        /**
         * @name interactiveCallback
         * @description 当交互式组件的状态改变，每次更新需要监测是否显示“打开交互式组件”的提示
         */
        interactiveCallback () {
            const activeNode = LC.getActiveNode()
            if (activeNode) {
                this.showNotVisibleMask = activeNode.isInteractiveComponent && !activeNode.interactiveShow
                return
            }
            this.showNotVisibleMask = false
        },
        rollbackCallback () {
            this.componentData.mounted(document.querySelector('#drawTarget'))
        },
        nodeCallback (event) {
            if (event.target.componentId === this.componentData.componentId) {
                this.$forceUpdate()
                setTimeout(() => {
                    this.autoType(event.child)
                }, 20)
            }
        },
        mousedownCallback () {
            setMousedown(true)
        },
        mouseupCallback () {
            setMousedown(false)
        },
        resetCallback () {
            LC.clearMenu()
        },
        /**
         * @desc 自动排版子组件
         */
        autoType (childNode) {
            if (this._isDestroyed || !childNode || childNode.isInteractiveComponent) {
                return
            }
            const {
                top: boxTop,
                left: boxLeft
            } = document.querySelector('.target-drag-area').getBoundingClientRect()
            const $childEl = childNode.$elm
            const {
                top: componentTop,
                left: componentLeft
            } = $childEl.getBoundingClientRect()

            const styles = {}
            // 如果被复制的组件已经有marginLeft或marginTop， 则不覆盖
            const { marginTop: childMarginTop, marginLeft: childMarginLeft } = childNode.renderStyles || {}
            if (componentTop > boxTop + 3 && !childMarginTop) {
                styles['marginTop'] = '8px'
            }
            if (componentLeft > boxLeft + 3 && !childMarginLeft) {
                styles['marginLeft'] = '8px'
            }
            if (Object.keys(styles).length > 0) {
                childNode.setStyle(styles)
            }
        },
        maskDbCLickHandler () {
            this.showNotVisibleMask = false
        },
        /**
         * @desc 鼠标右键操作面板
         */
        handleShowContextmenu (event) {
            event.stopPropagation()
            const activeNode = LC.getActiveNode()
            if (activeNode) {
                activeNode.activeClear()
            }
            LC.showMenu(event)
        },
        /**
         * @desc 鼠标离开时清除组件 hover 效果
         * @param { Boolean } name
         * @returns { Boolean }
         */
        handleMouseleave () {
            LC.triggerEventListener('componentMouserleave', {
                type: 'componentMouserleave'
            })
        },
        /**
         * @desc 画布编辑区空白区域被点击取消组件的选中状态
         * @param { Object } event
         */
        handleCanvasClick (event) {
            if (event.target.classList.contains(indexCssModule['drag-area'])) {
                const activeNode = LC.getActiveNode()
                if (activeNode) {
                    activeNode.activeClear()
                }
                LC.triggerEventListener('componentMouserleave', {
                    type: 'componentMouserleave'
                })
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderDraggable = () => {
            const nodes = [h({
                component: Draggable,
                class: `target-drag-area ${indexCssModule['drag-area']}`,
                props: {
                    componentData: self.componentData,
                    list: self.componentData.slot.default,
                    sort: true,
                    group: {
                        name: 'layout',
                        pull: true,
                        put: true
                    }
                },
                children: self.componentData?.slot?.default?.map?.((componentNode) => {
                    // root 的子组件只会是布局组件和交互式组件
                    return h({
                        component: componentNode.isInteractiveComponent ? ResolveInteractiveComponent : ResolveComponent,
                        props: {
                            componentData: componentNode
                        },
                        key: componentNode.renderKey
                    })
                })
            })]

            if (self.componentData.children.length < 1) {
                nodes.unshift(h({
                    component: 'div',
                    class: indexCssModule['empty'],
                    children: [
                        self.$t('请拖入组件')
                    ]
                }))
            }
            return nodes
        }

        const renderTools = () => {
            return [
                h({ component: LesscodeFocus }),
                h({ component: LesscodeTools }),
                h({ component: LesscodeResize }),
                h({ component: LesscodeMargin })
            ]
        }

        const renderDrawTarget = () => {
            return h({
                component: 'div',
                attrs: {
                    id: 'drawTarget'
                },
                class: {
                    [indexCssModule['canvas']]: true
                },
                on: {
                    click: self.handleCanvasClick,
                    mouseleave: self.handleMouseleave,
                    contextmenu: self.handleShowContextmenu
                },
                children: [
                    renderDraggable(),
                    ...renderTools()
                ]
            })
        }

        const renderNotVisibleMask = () => {
            return h({
                component: 'div',
                class: indexCssModule['not-visible-mask'],
                on: {
                    dblclick: self.maskDbCLickHandler
                },
                children: [
                    h({
                        component: 'p',
                        children: [
                            `该组件(${self.invisibleComponent})处于隐藏状态，请先打开`
                        ]
                    }),
                    h({
                        component: 'p',
                        props: {
                            class: 'mt20'
                        },
                        children: [
                            self.$t('双击继续操作页面其他组件')
                        ]
                    })
                ]
            })
        }

        return h({
            component: Layout,
            children: [
                renderDrawTarget(),
                self.showNotVisibleMask ? renderNotVisibleMask() : ''
            ]
        })
    }
}
