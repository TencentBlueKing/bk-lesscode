<template>
    <div :class="$style['simulator-wrapper']" :style="{ width: pageSize.width + 'px', height: pageSize.height + 'px' }">
        <div :class="$style['device-phone-frame']">
            <div :class="$style['device-phone']"></div>
        </div>
        <div :class="$style['simulator-preview']" :style="{ width: pageSize.width + 'px', height: pageSize.height + 'px' }">
            <mobileHeader />
            <iframe width="100%"
                height="100%"
                style="border: none"
                :src="source"
            >
            </iframe>
        </div>
    </div>
</template>

<script>
    import mobileHeader from './mobile-header.vue'
    import '@vant/touch-emulator' // PC端模拟移动端事件 用于预览
    
    export default {
        components: {
            mobileHeader
        },
        props: {
            pageSize: {
                type: Object,
                default: () => ({ height: 0, width: 0 })
            },
            source: {
                type: String,
                default: ''
            }
        }
    }
</script>

<style lang="postcss" module>
    @import './simulator-mobile.scss';
</style>
