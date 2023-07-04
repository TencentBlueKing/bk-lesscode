import { ref, reactive, watch, computed } from 'bk-lesscode-render'
import { list } from './model-list'
import { useStore } from '@/store'
import LC from '@/element-materials/core'
import emitter from 'tiny-emitter/instance'

export default function () {
    const store = useStore()

    const model = ref('iPhone 11 Pro')
    const modelList = reactive(list)
    const canvasSize = ref({})

    // 当前机型的信息
    const activeModelInfo = computed(() => {
        const currentModel = modelList.find(item => item.key === model.value)
        return /\((\d+\s?x\s?\d+)\)/.exec(currentModel.text)
    })

    // 当前机型的分辨率 例: 375 x 812
    const currentResolution = computed(() => {
        const resolution = (modelList.length && activeModelInfo.value[1])
              || ''
        return resolution
    })

    /** 画布尺寸变化时，同步修改画布内h5-page的高度，h5-page高度需要始终沾满全屏 */
    const syncH5PageHeight = (height) => {
        const h5Pages = LC.getNodesByType('h5-page')
        h5Pages.forEach(page => {
            page.setStyle('height', height)
        })
    }

    // 画布尺寸<T> { width: xx, height:xx }
    watch(
        () => model.value,
        () => {
            const size = JSON.parse(JSON.stringify(store.getters['page/pageSize']))
            if (activeModelInfo && modelList.length) {
                size.width = parseInt(activeModelInfo.value[1].split('x')[0])
                size.height = parseInt(activeModelInfo.value[1].split('x')[1])

                // 满屏幕为20rem，以此设置root的字体大小，移动端响应式
                document.documentElement.style.fontSize = `${size.width / 20}px`
            }
            store.commit('page/setPageSize', size)
            syncH5PageHeight(`${size.height}px`)
            emitter.emit('update-canvas-size', size)
            canvasSize.value = size
        },
        {
            immediate: true
        }
    )

    return {
        model,
        currentResolution,
        canvasSize,
        modelList
    }
}
