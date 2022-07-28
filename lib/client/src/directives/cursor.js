// /*
//  * Tencent is pleased to support the open source community by making 蓝鲸 available.
//  * Copyright (C) 2017-2022 THL A29 Limited, a Tencent company. All rights reserved.
//  * Licensed under the MIT License (the "License"); you may not use this file except
//  * in compliance with the License. You may obtain a copy of the License at
//  * http://opensource.org/licenses/MIT
//  * Unless required by applicable law or agreed to in writing, software distributed under
//  * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND,
//  * either express or implied. See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// /**
//  * 无权限按钮加锁样式
//  */

// const requestFrame = window.requestAnimationFrame
//     || window.mozRequestAnimationFrame
//     || window.webkitRequestAnimationFrame
//     || function (fn) {
//         return window.setTimeout(fn, 20)
//     }

// const cancelFrame = window.cancelAnimationFrame
//     || window.mozCancelAnimationFrame
//     || window.webkitCancelAnimationFrame
//     || window.clearTimeout

// const addEventListener = (el) => {
//     el.addEventListener('mouseenter', mouseenter)
//     el.addEventListener('mousemove', mousemove)
//     el.addEventListener('mouseleave', mouseleave)
//     el.addEventListener('click', click)
// }
// const removeEventListener = (el) => {
//     el.removeEventListener('mouseenter', mouseenter)
//     el.removeEventListener('mousemove', mousemove)
//     el.removeEventListener('mouseleave', mouseleave)
//     el.removeEventListener('click', click)
// }

// const options = {
//     x: 12,
//     y: 0,
//     width: 16,
//     height: 16,
//     zIndex: 100000,
//     cursor: 'pointer',
//     className: 'v-cursor',
//     activeClass: 'v-cursor-active'
// }

// const mouseenter = (event) => {
//     const el = event.currentTarget
//     const data = el.__cursor__
//     if (data.active) {
//         el.style.cursor = data.cursor
//         proxy.style.display = 'block'
//         el.classList.add(data.activeClass)
//         updateProxyPosition(event)
//     }
// }

// const mousemove = (event) => {
//     const el = event.currentTarget
//     const data = el.__cursor__
//     if (data.active) {
//         updateProxyPosition(event)
//     }
// }

// const mouseleave = (event) => {
//     const el = event.currentTarget
//     const data = el.__cursor__
//     el.style.cursor = ''
//     proxy.style.display = 'none'
//     el.classList.remove(data.activeClass)
// }

// const click = (event) => {
//     const el = event.currentTarget
//     const data = el.__cursor__
//     if (!data.active) {
//         return false
//     }
//     const callback = data.onclick
//     if (typeof callback === 'function') {
//         callback(data)
//     }
//     const { globalCallback } = data
//     if (typeof globalCallback === 'function') {
//         globalCallback(data)
//     }
// }

// let proxy = null
// let frameId = null

// const createProxy = () => {
//     proxy = document.createElement('span')
//     proxy.style.position = 'fixed'
//     proxy.style.pointerEvents = 'none'
//     proxy.style.zIndex = options.zIndex
//     proxy.style.width = `${options.width}px`
//     proxy.style.height = `${options.height}px`
//     proxy.classList.add(options.className)
//     document.body.append(proxy)
// }

// const updateProxyPosition = (event) => {
//     const el = event.currentTarget
//     const data = el.__cursor__
//     if (frameId) {
//         cancelFrame(frameId)
//     }
//     frameId = requestFrame(() => {
//         proxy.style.left = `${event.clientX + data.x}px`
//         proxy.style.top = `${event.clientY + data.y}px`
//     })
// }

// const setChildrenEvents = (target, pointerEvents) => {
//     Array.prototype.forEach.call(target.children, (child) => {
//         child.style.pointerEvents = pointerEvents
//     })
// }

// const cursor = {
//     inserted (el, binding) {
//         if (!proxy) {
//             createProxy()
//         }
//         const data = { ...options }
//         if (typeof binding.value !== 'object') {
//             data.active = binding.value
//         } else {
//             Object.assign(data, binding.value)
//         }
//         const target = data.selector ? el.querySelector(data.selector) : el
//         if (target) {
//             el.__cursor_target__ = target
//             target.__cursor__ = data
//             addEventListener(target)
//             const pointerEvents = data.active ? 'none' : ''
//             setChildrenEvents(target, pointerEvents)
//         }
//     },
//     update (el, binding) {
//         const data = { ...options }
//         if (typeof binding.value !== 'object') {
//             data.active = binding.value
//         } else {
//             Object.assign(data, binding.value)
//         }
//         let target = el.__cursor_target__
//         if (!target) {
//             target = el.querySelector(data.selector)
//             if (target) {
//                 el.__cursor_target__ = target
//                 target.__cursor__ = data
//                 addEventListener(target)
//                 const pointerEvents = data.active ? 'none' : ''
//                 setChildrenEvents(target, pointerEvents)
//             }
//         } else {
//             Object.assign(target.__cursor__, data)
//             const pointerEvents = data.active ? 'none' : ''
//             setChildrenEvents(target, pointerEvents)
//         }
//     },
//     unbind (el) {
//         const target = el.__cursor_target__
//         removeEventListener(target)
//     }
// }

// export default {
//     install: Vue => Vue.directive('cursor', cursor),
//     directive: cursor,
//     setOptions: (customOptions) => {
//         Object.assign(options, customOptions)
//     }
// }

/*
 * Tencent is pleased to support the open source community by making BK-JOB蓝鲸智云作业平台 available.
 *
 * Copyright (C) 2021 THL A29 Limited, a Tencent company.  All rights reserved.
 *
 * BK-JOB蓝鲸智云作业平台 is licensed under the MIT License.
 *
 * License for BK-JOB蓝鲸智云作业平台:
 *
 * ---------------------------------------------------
 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
 * documentation files (the "Software"), to deal in the Software without restriction, including without limitation
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and
 * to permit persons to whom the Software is furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of
 * the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO
 * THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
*/

/* eslint-disable no-param-reassign */

const DEFAULT_OPTIONS = {
    active: true,
    offset: [
        12, 0
    ],
    cls: 'cursor-element'
}

const init = function (el, binding) {
    el.mouseEnterHandler = function () {
        const element = document.createElement('div')
        element.id = 'directive-ele'
        element.style.position = 'absolute'
        element.style.zIndex = '999999'
        element.style.width = '18px'
        element.style.height = '18px'
        el.element = element
        document.body.appendChild(element)

        element.classList.add(binding.value.cls || DEFAULT_OPTIONS.cls)
        el.addEventListener('mousemove', el.mouseMoveHandler)
    }
    el.mouseMoveHandler = function (event) {
        const { pageX, pageY } = event
        const elLeft = pageX + DEFAULT_OPTIONS.offset[0]
        const elTop = pageY + DEFAULT_OPTIONS.offset[1]
        el.element.style.left = `${elLeft}px`
        el.element.style.top = `${elTop}px`
    }
    el.mouseLeaveHandler = function (event) {
        el.element && el.element.remove()
        el.element = null
        el.removeEventListener('mousemove', el.mouseMoveHandler)
    }
    if (binding.value.active) {
        el.addEventListener('mouseenter', el.mouseEnterHandler)
        el.addEventListener('mouseleave', el.mouseLeaveHandler)
    }
}

const destroy = function (el) {
    el.element && el.element.remove()
    el.element = null
    el.removeEventListener('mouseenter', el.mouseEnterHandler)
    el.removeEventListener('mousemove', el.mouseMoveHandler)
    el.removeEventListener('mouseleave', el.mouseLeaveHandler)
}

export default {
    install (Vue) {
        Vue.directive('cursor', {
            bind (el, binding) {
                binding.value = Object.assign({}, DEFAULT_OPTIONS, binding.value)
                init(el, binding)
            },
            update (el, binding) {
                binding.value = Object.assign({}, DEFAULT_OPTIONS, binding.value)
                destroy(el)
                init(el, binding)
            },
            unbind (el) {
                destroy(el)
            }
        })
    }
}
