/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default function (component, afterInstall) {
    component.install = (Vue, options = {}) => {
        const props = component.props || {}
        Object.keys(options).forEach(key => {
            if (props.hasOwnProperty(key)) {
                if (typeof props[key] === 'function' || props[key] instanceof Array) {
                    props[key] = {
                        type: props[key],
                        default: options[key]
                    }
                } else {
                    props[key].default = options[key]
                }
            }
        })

        component.name = options.namespace ? component.name.replace('bk', options.namespace) : component.name

        Vue.component(component.name, component)

        typeof afterInstall === 'function' && afterInstall(Vue, options)
    }
}
