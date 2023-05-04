<template>
    <div class="area-wrapper">
        <simulatorMobile :page-size="pageSize" :source="source" />
    </div>
</template>

<script>
    import { useRoute } from '@/router'
    import simulatorMobile from '@/components/render/mobile/common/simulator-mobile/simulator-mobile'
    import getHeaderHeight from '@/components/render/mobile/common/mobile-header-height'

    export default {
        components: {
            simulatorMobile
        },
        setup () {
            const route = useRoute()
            const width = 375
            const height = 812
            const { height: headerHeight } = getHeaderHeight()

            const pageSize = {
                height: parseInt(height + headerHeight.value),
                width
            }

            const projectId = route.params.projectId
            const pagePath = route.query.pagePath || '/mobile'
            const versionId = route.query.version

            let pathStr = `${versionId ? `/version/${versionId}` : ''}`
            pathStr += '/platform/MOBILE'

            return {
                pageSize,
                source: `${location.origin}/preview/project/${projectId}${pathStr}${pagePath}`
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import './../../components/render/mobile/area.postcss';

    .area-wrapper {
        display: flex;
        justify-content: center;
        margin-top: 20px;
    }
</style>
