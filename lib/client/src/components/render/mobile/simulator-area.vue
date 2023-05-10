<template>
    <div :class="$style['area-wrapper']">
        <div :class="$style['title']">
            <span :class="$style['title-text']">{{ $t('效果预览') }}</span>
        </div>
        <simulatorMobile :page-size="pageSize" :source="source" />
    </div>
</template>

<script>
    import { computed } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import getHeaderHeight from './common/mobile-header-height'
    import simulatorMobile from './common/simulator-mobile.vue'

    export default {
        components: {
            simulatorMobile
        },
        setup () {
            const store = useStore()
            const route = useRoute()

            const { height: headerHeight } = getHeaderHeight()

            const projectId = route.params.projectId
            const pagePath = `${store.getters['page/pageRoute'].layoutPath}${store.getters['page/pageRoute'].layoutPath.endsWith('/') ? '' : '/'}${store.getters['page/pageRoute'].path}`
            const versionId = store.getters['projectVersion/currentVersionId']

            let pathStr = `${versionId ? `/version/${versionId}` : ''}`
            pathStr += '/platform/MOBILE'

            const pageSize = computed(() => {
                const { height, width } = store.getters['page/pageSize']
                return {
                    width,
                    height: parseInt(height + headerHeight.value)
                }
            })

            return {
                pageSize,
                source: `${location.origin}/preview/project/${projectId}${pathStr}${pagePath}`
            }
        }
    }
</script>

<style lang="postcss" module>
    @import './area.scss';
</style>
