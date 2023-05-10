<template>
    <div class="lesscode-bk-vision-container" :id="renderId">
        <bk-exception v-if="!uid" class="exception-wrap-item exception-part exception-gray" type="404" scene="part">
            <span>{{$t('请先配置uid')}}</span>
        </bk-exception>
        <div v-else :id="`dashboard-${renderId}`" />
    </div>
</template>

<script>
    import { uuid, debounce } from 'shared/util'

    export default {
        name: 'widget-bk-vision',
        props: {
            uid: {
                type: String,
                default: ''
            },
            waterMark: {
                type: String
            },
            isFullScroll: {
                type: Boolean,
                default: true
            },
            isShowTools: {
                type: Boolean,
                default: true
            },
            isShowRefresh: {
                type: Boolean,
                default: true
            },
            isShowTimeRange: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                // visionApp: {},
                renderId: '',
                apiPrefix: '/api/bkvision/',
                cdnPrefix: 'https://staticfile.qq.com/bkvision/p8e3a7f52d95c45d795cb6f90955f2800/latest/'
            }
        },
        computed: {
            dataInfo () {
                return {
                    apiPrefix: '/api/bkvision/'
                    // waterMark: { content: this.watchMark || 'bk-lesscode' },
                    // isFullScroll: this.isFullScroll,
                    // isShowTools: this.isShowTools,
                    // isShowRefresh: this.isShowRefresh,
                    // isShowTimeRange: this.isShowTimeRange
                }
            }

        },
        watch: {
            uid (val) {
                this.debounceInit()
            },
            waterMark () {
                this.debounceRender()
            },
            isShowTools () {
                this.debounceRender()
            },
            isShowRefresh () {
                this.debounceRender()
            },
            isShowTimeRange () {
                this.debounceRender()
            }
        },
        created () {
            this.renderId = uuid(6)
        },
        mounted () {
            this.debounceInit = debounce(this.initPanel)
            this.debounceRender = debounce(this.renderPanel)
            if (!window.BkVisionSDK) {
                this.loadSdk()
            } else {
                console.log('bkvision sdk exist')
                this.initPanel()
            }
        },
        methods: {
            async loadSdk () {
                const link = document.createElement('link')
                link.href = 'https://staticfile.qq.com/bkvision/p8e3a7f52d95c45d795cb6f90955f2800/3c3de519287048dcb4c5a03d47ebf33f/main.css'
                link.rel = 'stylesheet'
                document.body.append(link)
                await this.loadScript('chunk-vendors.js')
                await this.loadScript('chunk-bk-magic-vue.js')
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
                        console.log('sdk load', file)
                        resolve()
                    }
                })
            },
            async initPanel () {
                if (window.BkVisionSDK) {
                    this.visionApp = this.uid && window.BkVisionSDK.init(`#dashboard-${this.renderId}`, this.uid, this.dataInfo)
                } else {
                    console.error('sdk 加载异常')
                }
            },
            renderPanel () {
                // console.log('rerender')
                // if (window.BkVisionSDK && this.visionApp) {
                //     console.log('render', this.visionApp)
                //     this.visionApp?.update()
                // } else {
                //     console.error('sdk 加载异常')
                //     this.initPanel()
                // }
            }
        }
    }
</script>

<style lang="postcss">
    .lesscode-bk-vision-container {
        pointer-events: all !important;
        * {
            pointer-events: all !important;
        }
    }
</style>
