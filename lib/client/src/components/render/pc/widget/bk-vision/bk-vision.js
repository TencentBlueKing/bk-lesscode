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

import { h } from 'bk-lesscode-render'
import LC from '@/element-materials/core'
import { uuid, debounce } from 'shared/util'

export default {
    name: 'widget-bk-vision',
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object
        },
        uid: {
            type: String
        }
    },
    data () {
        return {
            visionApp: {},
            renderId: '',
            apiPrefix: '/api/bkvision/',
            cdnPrefix: 'https://staticfile.qq.com/bkvision/pbb9b207ba200407982a9bd3d3f2895d4/latest/'
        }
    },
    computed: {
        compUid () {
            return this.uid || this.componentData?.prop?.uid
        },
        dataInfo () {
            return {
                apiPrefix: '/api/bkvision/'
                // waterMark: { content: this.componentData?.watchMark || 'bk-lesscode' }
            }
        }
    },
    watch: {
        compUid (val) {
            console.log('compUid change', val)
            this.debounceInit()
        }
    },
    created () {
        this.renderId = uuid(6)
        LC.addEventListener('update', this.updateCallback)
    },
    mounted () {
        this.debounceInit = debounce(this.initPanel)
        if (!window.BkVisionSDK) {
            console.log('load sdk')
            this.loadSdk()
        } else {
            console.log('bkvision sdk exist')
            this.initPanel()
        }
    },
    beforeDestroy () {
        LC.removeEventListener('update', this.updateCallback)
    },
    methods: {
        updateCallback ({ target }) {
            if (target.componentId === this.componentData?.componentId) {
                this.$forceUpdate()
                this.debounceInit()
            }
        },
        async loadSdk () {
            const link = document.createElement('link')
            link.href = 'https://staticfile.qq.com/bkvision/pbb9b207ba200407982a9bd3d3f2895d4/3c3de519287048dcb4c5a03d47ebf33f/main.css'
            link.rel = 'stylesheet'
            document.body.append(link)
            await this.loadScript('main.js')
            this.initPanel()
        },
        loadScript (file) {
            return new Promise((resolve, reject) => {
                const url = this.cdnPrefix + file
                const script = document.createElement('script')
                script.src = url
                document.body.append(script)
                script.onload = () => {
                    resolve()
                }
            })
        },
        async initPanel () {
            const compUid = this.compUid
            console.log('init panel', compUid)
            if (window.BkVisionSDK) {
                try {
                    if (this.visionApp && Object.keys(this.visionApp).length) {
                        this.visionApp?.unmount()
                    }
                } catch (error) {
                    console.error(error?.message || error, 'unmount bk-vision error')
                }
                    
                this.visionApp = compUid && await window.BkVisionSDK.init(`.dashboard-${this.renderId}`, compUid, this.dataInfo)
                console.log(this.visionApp, 'after init', compUid)
            } else {
                console.error('sdk 加载异常')
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: 'lesscode-bk-vision-container',
            children: [
                !self.compUid ? h({
                    component: 'bk-exception',
                    class: 'exception-wrap-item exception-part exception-gray',
                    props: {
                        type: '404',
                        scene: 'part'
                    }
                })
                : h({
                    component: 'div',
                    class: `dashboard-${self.renderId}`
                })
            ]
        })
    }
}
