<template>
    <div :class="['deploy-status-type', extCls]" v-if="deployingInfo.name && deployingInfo.status">
        <div class="deploy-lastStepSate">
            <round-loading ext-cls="deploy-timeline-loading" v-if="deployingInfo.status === 'pending'" />
            <i class="bk-drag-icon bk-drag-close-circle-fill icon-failed icon-size"
                v-if="deployingInfo.status === 'failed'"></i>
            <i class="bk-drag-icon bk-drag-check-circle-fill icon-successful icon-size"
                v-if="deployingInfo.status === 'successful'"></i>
            <span>{{ deployingInfo.name }}</span>
        </div>
        <div class="deploy-view-operate">
            <i v-if="content" v-bk-tooltips="{ boundary: 'window', content: $t('复制') }" class="bk-drag-icon bk-drag-copy icon icon-copy"
                @click="handleCodeCopy"></i>
            <i v-bk-tooltips="{ boundary: 'window', content: $t('全屏') }" class="bk-icon icon-full-screen icon"
                @click="handleScreenfull"></i>
        </div>
    </div>
</template>
<script>
    import screenfull from 'screenfull'
    import roundLoading from './deploy-timeline/round-loading'
    export default {
        components: {
            roundLoading
        },
        props: {
            extCls: {
                type: String,
                default: ''
            },
            deployingInfo: {
                type: Object,
                default: () => {
                    return {
                        name: '',
                        status: ''
                    }
                }
            },
            screenfullClassName: {
                type: String
            },
            content: {
                type: String
            }
        },
        data () {
            return {}
        },
        methods: {
            handleScreenfull () {
                const el = document.querySelector(this.screenfullClassName)
                if (!screenfull.isEnabled) {
                    this.$bkMessage({
                        message: this.$t('浏览器不支持全屏'),
                        theme: 'error'
                    })
                    return false
                }
                screenfull.request(el)
            },
            handleCodeCopy () {
                const code = this.content
                const el = document.createElement('textarea')
                el.value = code
                el.setAttribute('readonly', '')
                el.style.position = 'absolute'
                el.style.left = '-9999px'
                document.body.appendChild(el)
                const selected = document.getSelection().rangeCount > 0 ? document.getSelection().getRangeAt(0) : false
                el.select()
                document.execCommand('copy')
                document.body.removeChild(el)
                if (selected) {
                    document.getSelection().removeAllRanges()
                    document.getSelection().addRange(selected)
                }
                this.$bkMessage({ theme: 'primary', message: this.$t('复制成功'), delay: 2000, dismissable: false })
            }
        }
    }
</script>
<style lang="postcss">
    .deploy-status-type {
        width: 100%;
        height: 40px;
        background: #2E2E2E;
        border-radius: 2px 2px 0 0;
        border-bottom:1px solid #1A1A1A;
        line-height: 40px;
        color: #C4C6CC;
        font-size: 14px;
        padding:0 17px;
        display: flex;
        align-items: center;
        justify-content: space-between;
            .icon {
                font-size: 12px;
                color: #979BA5
                }
            .icon-copy {
                font-size: 14px;
                margin-right: 14px;
                }
            .deploy-timeline-loading {
                line-height: 28px;
                font-size: 18px;
                margin-bottom: 2px;
            }
            .icon-size {
                font-size: 18px;
            }
            .icon-successful {
                color:#2DCB56;
            }
            .icon-failed {
                color: #EA3636;
            }
        }
</style>
