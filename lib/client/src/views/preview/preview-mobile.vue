<template>
    <div class="area-wrapper">
        <div class="simulator-wrapper" :style="{ width: width + 'px', height: height + 'px' }">
            <div class="device-phone-frame">
                <div class="device-phone"></div>
            </div>
            <div class="simulator-preview" :style="{ width: width + 'px', height: height + 'px' }">
                <mobileHeader />
                <iframe width="100%"
                    height="100%"
                    style="border: none"
                    :src="source"
                >
                </iframe>
            </div>
        </div>
    </div>
</template>

<script>
    import { useRoute } from '@/router'
    import mobileHeader from '@/components/render/mobile/common/mobile-header.vue'

    export default {
        components: {
            mobileHeader
        },
        setup () {
            const route = useRoute()
            const width = '375'
            const height = '812'

            const projectId = route.params.projectId
            const pagePath = route.query.pagePath || '/mobile'
            const versionId = route.query.version

            let pathStr = `${versionId ? `/version/${versionId}` : ''}`
            pathStr += '/platform/MOBILE'

            return {
                width,
                height,
                source: `${location.origin}/preview/project/${projectId}${pathStr}${pagePath}`
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import './../../components/render/mobile/area.scss';

    .area-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
</style>
