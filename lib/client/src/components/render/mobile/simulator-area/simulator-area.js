import cssModule from '../area.postcss?module'
import { h, ref, onBeforeUnmount } from 'bk-lesscode-render'
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

        const { height: headerHeight } = getHeaderHeight()

        const projectId = route.params.projectId
        const pagePath = `${store.getters['page/pageRoute'].layoutPath}${store.getters['page/pageRoute'].layoutPath.endsWith('/') ? '' : '/'}${store.getters['page/pageRoute'].path}`
        const versionId = store.getters['projectVersion/currentVersionId']

        let pathStr = `${versionId ? `/version/${versionId}` : ''}`
        pathStr += '/platform/MOBILE'

        const calcPageSize = () => {
            const { height, width } = store.getters['page/pageSize']
            pageSize.value = {
                width,
                height: parseInt(height + headerHeight.value)
            }
        }

        emitter.on('update-canvas-size', calcPageSize)
        onBeforeUnmount(() => {
            emitter.off('update-canvas-size', calcPageSize)
        })

        calcPageSize()

        return {
            pageSize,
            source: `${location.origin}/preview/project/${projectId}${pathStr}${pagePath}`
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
