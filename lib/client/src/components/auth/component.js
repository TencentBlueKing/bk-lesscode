/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import { permissionDialog } from '@/common/bkmagic'

import './style.css'

export default {
    props: {
        permission: {
            type: [Boolean, String],
            default: ''
        },
        // ACTION_ID
        auth: {
            type: String,
            required: true
        },
        // 没有 resourceId 时，说明没有关联资源
        resourceId: {
            type: [
                Number, String
            ]
        }
    },
    data () {
        return {
            hasPermission: false
        }
    },
    computed: {
        showRaw () {
            if (this.permission) {
                return true
            }
            if (this.hasPermission) {
                return true
            }
            return false
        }
    },
    watch: {
        resourceId (resourceId) {
            if (!resourceId) {
                return
            }
            this.checkPermission()
        }
    },
    created () {
        this.checkPermission()
        this.authResult = {}
    },
    methods: {
        /**
         * @desc 主动鉴权，指定资源和资源权限
        */
        async fetchPermission () {
            try {
                const resData = await this.$store.dispatch('iam/check', {
                    data: {
                        action: this.auth,
                        resourceId: this.resourceId
                    }
                })
                this.hasPermission = resData.pass
                this.authResult = resData
            } catch (e) {
                console.error(e)
            }
        },
        /**
         * @desc 判断预鉴权逻辑
        */
        checkPermission () {
            if (this.permission === '' && this.auth) {
                this.fetchPermission()
            }
        },
        /**
         * @desc 无权限时弹框提示资源权限申请
        */
        handleCheckPermission (e) {
            this.$emit('before-show-permission-dialog', e)
            permissionDialog({
                action: this.auth,
                resourceId: this.resourceId
            }, this.authResult)
            this.$emit('after-show-permission-dialog', e)
        }
    },

    render (h) {
        if (this.showRaw) {
            if (this.$slots.default) {
                return this.$slots.default[0]
            }
            // 多个 slot 嵌套时，拿不到 default，需要指明具名 slot
            if (this.$slots.allow) {
                return this.$slots.allow[0]
            }
        }
        if (this.$slots.forbid) {
            const cls = {
                'component-permission-disabled': true
            }
            const customContainerCls = (this.$slots.forbid[0] || {}).data.attrs['custom-forbid-container-cls']
            if (customContainerCls) {
                cls[customContainerCls] = true
            }
            return h('div', {
                class: cls,
                on: {
                    click: this.handleCheckPermission
                },
                directives: [
                    {
                        name: 'cursor'
                    }
                ]
            }, this.$slots.forbid)
        }
        return this._e() // eslint-disable-line no-underscore-dangle
    }
}
