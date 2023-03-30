<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<script>
    import Vue from 'vue'
    import httpVueLoader from '@/common/http-vue-loader'
    import * as swiperAni from '@/common/swiper.animate.min.js'
    import '@/css/animate.min.css'
    import mobileHeader from '@/components/render/mobile/common/mobile-header.vue'

    window.swiperAni = swiperAni
    window.previewCustomCompontensPlugin = []
    window.registerPreview = function (callback) {
        window.previewCustomCompontensPlugin.push(callback)
    }
    const LoadingComponent = Vue.component('loading-component', {
        props: {
            isLoading: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                height: window.innerHeight
            }
        },
        template: `
            <div class="loading" :style="{ height: height + 'px' }" v-bkloading="{ isLoading: true }"></div>
        `
    })
    /* eslint-disable */
    const ErrComponent = Vue.component('err-component', {
        template: '<span>err</span>'
    })
    /* eslint-enable */

    export default {
        name: 'preview',
        components: {
            LoadingComponent,
            mobileHeader
        },
        data () {
            return {
                height: 812,
                headerHeight: 30,
                mobileWidth: '375',
                isCustomComponentLoading: true,
                detail: {},
                pageType: 'preview',
                comp: 'LoadingComponent',
                isLoading: false,
                targetData: [],
                minHeight: 0,
                renderType: 'PC'
            }
        },
        computed: {
            mobileHeight () {
                return this.height + this.headerHeight
            },
            fromTemplateList () {
                return this.$route.query.type && this.$route.query.type === 'viewTemplate'
            },
            projectId () {
                return this.$route.params.projectId || ''
            },
            templateId () {
                return this.$route.params.templateId || ''
            },
            versionId () {
                return this.$route.query.v || ''
            },
            type () {
                return this.$route.query.type || ''
            }
        },
        async created () {
            console.log('preview-template')
            const script = document.createElement('script')
            script.src = `/${parseInt(this.projectId)}/component/preview-register.js?v=${this.versionId}`
            script.onload = () => {
                window.previewCustomCompontensPlugin.forEach(callback => {
                    const [config, source] = callback(Vue)
                    Vue.component(config.type, source)
                })
                this.isCustomComponentLoading = false
            }
            document.body.appendChild(script)

            if (this.type === 'nav-template') {
                try {
                    const { list } = await this.$store.dispatch('layout/getFullList', { projectId: this.projectId, versionId: this.versionId })
                    this.detail = list.filter(item => item.id === parseInt(this.templateId))[0]
                } catch (e) {
                    console.error(e)
                }
            } else {
                this.detail = await this.$store.dispatch('pageTemplate/detail', { id: this.templateId })
            }

            await this.loadFile()
        },
        mounted () {
            this.minHeight = window.innerHeight
            window.addEventListener('resize', this.resizeHandler)
        },
        destroyed () {
            window.removeEventListener('resize', this.resizeHandler)
        },
        methods: {
            async loadFile () {
                this.isLoading = true
                try {
                    if (this.type !== 'nav-template') {
                        this.targetData.push(JSON.parse(this.detail.content || {}))
                    }
                } catch (err) {
                    this.$bkMessage({
                        theme: 'error',
                        message: window.i18n.t('targetData格式错误')
                    })
                }

                try {
                    const { targetData, projectId } = this
                    let code
                    if (this.type === 'nav-template') {
                        const layoutContent = JSON.parse(this.detail.content)
                        code = await this.$store.dispatch('vueCode/getPageCode', {
                            targetData: [],
                            pageType: 'previewSingle',
                            projectId: projectId,
                            versionId: this.detail.versionId,
                            layoutContent,
                            withNav: true,
                            layoutType: this.detail.type
                        })
                    } else {
                        code = await this.$store.dispatch('vueCode/getPageCode', {
                            targetData,
                            projectId: projectId,
                            versionId: this.detail.versionId,
                            pageType: 'previewSingle',
                            fromPageCode: this.detail.fromPageCode,
                            platform: this.detail?.templateType || this.detail?.layoutType
                        })
                    }
                    this.renderType = this.detail?.templateType || this.detail?.layoutType

                    code = code.replace('export default', 'module.exports =').replace('components: { chart: ECharts },', '')
                    const res = httpVueLoader(code)
                    setTimeout(() => {
                        Vue.component('preview-page', res)
                        this.comp = 'preview-page'
                        this.isLoading = false
                    }, 300)
                } catch (err) {
                    this.$bkMessage({
                        theme: 'error',
                        message: err.message || err
                    })
                }
            },
            resizeHandler () {
                this.minHeight = window.innerHeight
            }
        },
        template: `<div v-if="!isCustomComponentLoading" :style="{ \'min-height\': minHeight + \'px\' }">
            <div v-if="renderType === 'MOBILE'" class="area-wrapper">
                <div class="simulator-wrapper" :style="{ width: mobileWidth + 'px', height: mobileHeight + 'px' }">
                    <div class="device-phone-frame">
                        <div class="device-phone"></div>
                    </div>
                    <div class="simulator-preview" :style="{ width: mobileWidth + 'px', height: mobileHeight + 'px', overflow: 'auto' }">
                        <div class="mobile-content-wrapper">
                            <mobileHeader />
                            <component :is="comp" :is-loading="isLoading"/>
                        </div>
                    </div>
                </div>
            </div>
            <component v-else :is="comp" :is-loading="isLoading"/>
        </div>`
    }
</script>

<style lang="postcss" scoped>
    .area-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 20px;
        .device-phone-frame {
            z-index: 1;
        }
        .simulator-preview {
            z-index: 0;
            position: absolute;
            .mobile-content-wrapper {
                height: 100%;
                width: 100%;
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }
        }
    }

    .simulator-wrapper {
        position: relative;
        .device-phone-frame {
            z-index: 1;
            pointer-events: none;
            position: absolute;
            height: 100%;
            width: 100%;
            padding: 5% 6.5% 5.6%;
            box-sizing: content-box;

        }
        .device-phone {
            pointer-events: none;
            width: 100%;
            height: 100%;
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-image: url(./../../images/phone.png);
            background-size: 100% 100%;
        }
        .simulator-preview {
            height: 100%;
            width: 100%;
            box-sizing: content-box;
            padding: 6% 7.0% 5.6%;
            display: flex;
            flex-direction: column;
            iframe {
                flex: 1;
            }
            &::-webkit-scrollbar {
                display: none;
            }
        }
    }
</style>
