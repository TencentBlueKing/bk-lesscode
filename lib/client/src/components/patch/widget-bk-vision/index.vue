<template>
    <div class="lesscode-bk-vision-container" :id="renderId">
        <bk-exception v-if="!uid" class="exception-wrap-item exception-part exception-gray" type="404" scene="part">
            <span>请先配置uid</span>
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
                    apiPrefix: '/api/bkvision/',
                    waterMark: { content: this.watchMark || 'bk-lesscode' },
                    isFullScroll: this.isFullScroll,
                    isShowTools: this.isShowTools,
                    isShowRefresh: this.isShowRefresh,
                    isShowTimeRange: this.isShowTimeRange
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
                // const link = document.createElement('link')
                // const script = document.createElement('script')
                // link.href = 'https://staticfile.qq.com/bkvision/p0964a9106c32428b99e3260d0fc63088/latest/main.css'
                // link.rel = 'stylesheet'
                // document.body.append(link)
                // script.src = 'https://staticfile.qq.com/bkvision/p0964a9106c32428b99e3260d0fc63088/latest/main.js'
                // document.body.append(script)
                // script.onload = () => {
                //     console.log('sdk load')
                //     this.initPanel()
                // }
                // const link = document.createElement('link')
                // link.href = `${this.cdnPrefix}main.css`
                // link.rel = 'stylesheet'
                // document.body.append(link)
                // await Promise.all([
                //     // this.loadScript('chunk-vendors.js'),
                //     // this.loadScript('chunk-bk-magic-vue.js'),
                //     this.loadScript('main.js')
                // ])
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
                console.log(window.BkVisionSDK, 22356)
                if (window.BkVisionSDK) {
                    console.log(this.uid, 'uid', `#dashboard-${this.renderId}`)
                    this.visionApp = this.uid && window.BkVisionSDK.init(`#dashboard-${this.renderId}`, this.uid, this.dataInfo)
                    console.log(this.visionApp, 332112)
                } else {
                    console.error('sdk 加载异常')
                }
            },
            renderPanel () {
                console.log('rerender')
                if (window.BkVisionSDK && this.visionApp) {
                    console.log('render', this.visionApp)
                    this.visionApp?.update()
                } else {
                    console.error('sdk 加载异常')
                    this.initPanel()
                }
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
