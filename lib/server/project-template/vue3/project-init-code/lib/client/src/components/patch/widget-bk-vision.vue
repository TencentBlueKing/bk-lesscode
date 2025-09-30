<template>
    <div class="lesscode-bk-vision-container" :id="renderId">
        <bk-exception v-if="!uid" class="exception-wrap-item exception-part exception-gray" type="404" scene="part">
            <span>{{ $t('请先配置uid') }}</span>
        </bk-exception>
        <div v-else :id="`dashboard-${renderId}`" />
    </div>
</template>

<script>
    import { uuid } from 'shared/util'

    export default {
        name: 'widget-bk-vision',
        props: {
            uid: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                visionApp: {},
                apiPrefix: `${process.env.BK_AJAX_URL_PREFIX}/bkvision/`,
                cdnPrefix: 'https://staticfile.qq.com/bkvision/pbb9b207ba200407982a9bd3d3f2895d4/latest/'
            }
        },
        created () {
            this.renderId = uuid(6)
        },
        mounted () {
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
                if (window.BkVisionSDK) {
                    try {
                        if (this.visionApp && Object.keys(this.visionApp).length) {
                            this.visionApp?.unmount()
                        }
                    } catch (error) {
                        console.error(error?.message || error, 'unmount bk-vision error')
                    }
                        
                    this.visionApp = this.uid && await window.BkVisionSDK.init(`#dashboard-${this.renderId}`, this.uid, {
                        apiPrefix: this.apiPrefix
                    })
                    console.log(this.visionApp, 'after init', this.uid)
                } else {
                    console.error('sdk 加载异常')
                }
            }
        }
    }
</script>
