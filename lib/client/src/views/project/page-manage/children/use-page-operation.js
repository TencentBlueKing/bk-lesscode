// import {
//     computed,
//     // ref,
//     getCurrentInstance,
//     onBeforeUnmount
// } from '@vue/composition-api'
// import store from '@/store'
import router from '@/router'

export default function () {
    const projectId = router?.currentRoute?.params?.projectId
    // const versionId = store.getters['projectVersion/currentVersionId']

    function handleEditPage (page) {
        if (page.nocodeType) {
            if (page.nocodeType === 'FLOW') {
                router.push({
                    name: 'flowConfig',
                    params: {
                        projectId: projectId,
                        flowId: page.flowId
                    }
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
        handleEditPage
    }
}
