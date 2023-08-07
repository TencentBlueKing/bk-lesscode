import cssModule from '../area.postcss?module'
import { h, ref, onBeforeUnmount, onMounted } from 'bk-lesscode-render'
import { useStore } from '@/store'
import { useRoute } from '@/router'
import getHeaderHeight from '../common/mobile-header-height'
import simulatorMobile from '../common/simulator-mobile/simulator-mobile'
import emitter from 'tiny-emitter/instance'

export default {
    setup () {
        const store = useStore()
        const route = useRoute()
        const pageSize = ref({})
        const source = ref({})

        const { height: headerHeight } = getHeaderHeight()

        const projectId = route.params.projectId

        /**
         * Update the preview URL based on the current page and project version.
         *
         * @return {void}
         */
        const updatePreviewUrl = () => {
            // Get the layout path and route path from the pageRoute getter
            const layoutPath = store.getters['page/pageRoute'].layoutPath
            const routePath = store.getters['page/pageRoute'].path

            // Concatenate the layout path and route path to get the page path
            const pagePath = `${layoutPath}${layoutPath.endsWith('/') ? '' : '/'}${routePath}`

            // Get the current version id from the currentVersionId getter
            const versionId = store.getters['projectVersion/currentVersionId']

            // Build the path string based on the version id and platform
            let pathStr = `${versionId ? `/version/${versionId}` : ''}`
            pathStr += '/platform/MOBILE'

            // Build the preview URL using the location origin, project id, path string, and page path
            source.value = `${location.origin}/preview/project/${projectId}${pathStr}${pagePath}`
        }

        const calcPageSize = () => {
            const { height, width } = store.getters['page/pageSize']
            pageSize.value = {
                width,
                height: parseInt(height + headerHeight.value)
            }
        }

        emitter.on('update-canvas-size', calcPageSize)
        emitter.on('update-preview-src', updatePreviewUrl)
        onMounted(() => {
            updatePreviewUrl()
        })
        onBeforeUnmount(() => {
            emitter.off('update-canvas-size', calcPageSize)
            emitter.off('update-preview-src', updatePreviewUrl)
        })

        calcPageSize()

        return {
            pageSize,
            source
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: cssModule['area-wrapper'],
            children: [
                h({
                    component: 'div',
                    class: cssModule['title'],
                    children: [
                        h({
                            component: 'span',
                            class: cssModule['title-text'],
                            children: [
                                '效果预览'
                            ]
                        })
                    ]
                }),
                h({
                    component: simulatorMobile,
                    props: {
                        pageSize: self.pageSize,
                        source: self.source
                    }
                })
            ]
        })
    }
}
