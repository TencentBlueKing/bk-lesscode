<template>
    <div class="area-wrapper">
        <div id="preview-mobile"></div>
    </div>
</template>

<script>
    import { useRoute } from '@/router'
    import simulatorMobile from '@/components/render/mobile/common/simulator-mobile/simulator-mobile'
    import getHeaderHeight from '@/components/render/mobile/common/mobile-header-height'
    import {
        init,
        render
    } from 'bk-lesscode-render'
    import { i18nConfig } from '@/locales/i18n.js'

    export default {
        components: {
            simulatorMobile
        },
        setup () {
            const route = useRoute()
            // 初始化单例
            init(route.query.framework)
            const width = 375
            const height = 812
            const { height: headerHeight } = getHeaderHeight()

            const pageSize = {
                height: parseInt(height + headerHeight.value),
                width
            }

            const projectId = route.params.projectId
            const pagePath = route.query.pagePath || ''
            const versionId = route.query.version
            const pageId = route.query.pageId || ''

            let pathStr = `${versionId ? `/version/${versionId}` : ''}`
            pathStr += '/platform/MOBILE'

            return {
                pageSize,
                source: `${location.origin}/preview/project/${projectId}${pathStr}${pagePath}?pageId=${pageId}`
            }
        },

        mounted () {
            render({
                component: simulatorMobile,
                props: {
                    pageSize: this.pageSize,
                    source: this.source
                },
                selector: '#preview-mobile',
                i18nConfig
            })
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
