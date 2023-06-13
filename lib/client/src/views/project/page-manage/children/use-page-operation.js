// import {
//     computed,
//     // ref,
//     getCurrentInstance,
//     onBeforeUnmount
// } from '@vue/composition-api'
import store from '@/store'
import router from '@/router'

export default function () {
    const projectId = router?.currentRoute?.params?.projectId
    const versionId = store.getters['projectVersion/currentVersionId']

    function getPreviewUrl (page) {
        let url = ''
        const { layoutPath, path } = page
        const fullPath = `${layoutPath}${layoutPath?.endsWith('/') ? '' : '/'}${path}`
        if (page?.layoutType === 'MOBILE') {
            const versionQuery = `${versionId ? `&version=${versionId}` : ''}`
            url = `/preview-mobile/project/${projectId}?pagePath=${fullPath}&pageCode=${page?.pageCode}${versionQuery}`
        } else {
            const versionPath = `${versionId ? `/version/${versionId}` : ''}`
            url = `/preview/project/${projectId}${versionPath}${fullPath}?pageCode=${page?.pageCode}`
        }
        console.log(url, 'url')
        return url
    }

    function handlePreview (page) {
        const url = getPreviewUrl(page)
        window.open(url, '_blank')
    }

    function handleEditPage (page) {
        if (page.nocodeType) {
            if (page.nocodeType === 'FLOW') {
                router.push({
                    name: 'createTicketPageEdit',
                    params: { projectId, flowId: page.flowId, pageId: page.id }
                })
            } else {
                router.push({
                    name: 'editNocode',
                    params: {
                        projectId: projectId,
                        pageId: page.id
                    }
                })
            }
        } else {
            router.push({
                name: 'new',
                params: {
                    projectId: projectId,
                    pageId: page.id
                }
            })
        }
    }

    return {
        getPreviewUrl,
        handlePreview,
        handleEditPage
    }
}
