<template>
    <div :class="$style['area-wrapper']">
        <div :class="$style['title']">
            <span :class="$style['title-text']">效果预览</span>
        </div>
        <div :class="$style['simulator-wrapper']" :style="{ width: pageSize.width + 'px', height: pageSize.height + 'px' }">
            <div :class="$style['device-phone-frame']">
                <div :class="$style['device-phone']"></div>
            </div>
            <div :class="$style['simulator-preview']" :style="{ width: pageSize.width + 'px', height: pageSize.height + 'px' }">
                <div :class="$style['simulator-header']">
                    <span></span>
                </div>
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
    import { computed } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'

    export default {
        setup () {
            const store = useStore()
            const route = useRoute()

            const projectId = route.params.projectId
            const pagePath = `${store.getters['page/pageRoute'].layoutPath}${store.getters['page/pageRoute'].layoutPath.endsWith('/') ? '' : '/'}${store.getters['page/pageRoute'].path}`
            const versionId = store.getters['projectVersion/currentVersionId']

            let pathStr = `${versionId ? `/version/${versionId}` : ''}`
            pathStr += '/platform/MOBILE'

            const pageSize = computed(() => store.getters['page/pageSize'])

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
