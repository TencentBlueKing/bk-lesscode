import html2canvas from 'html2canvas'
import { ref, computed } from '@vue/composition-api'
import { useStore } from '@/store'
import { useRoute } from '@/router'
import previewErrorImg from '@/images/preview-error.png'

export default () => {
    const store = useStore()
    const route = useRoute()

    const versionId = computed(() => store.getters['projectVersion/currentVersionId'])

    const isLoading = ref(false)

    const submit = () => {
        isLoading.value = true
        const elm = document.querySelector('.lesscode-editor-layout')
        return html2canvas(elm)
            .then(async (canvas) => {
                const imgData = canvas.toDataURL('image/png')
                return store.dispatch('page/update', {
                    data: {
                        projectId: route.params.projectId,
                        versionId: versionId.value,
                        pageData: {
                            id: parseInt(route.params.pageId),
                            previewImg: imgData || previewErrorImg
                        }
                    }
                })
            })
            .finally(() => {
                isLoading.value = false
            })
    }
    return [
        isLoading,
        submit
    ]
}
