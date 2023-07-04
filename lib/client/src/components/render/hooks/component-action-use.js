// import { computed, ref, watch } from '@vue/composition-api'
import LC from '@/element-materials/core'
import {
    onMounted,
    ref,
    computed,
    onBeforeUnmount,
    nextTick
} from 'bk-lesscode-render'
import {
    useStore
} from '@/store'
import {
    bus
} from '@/common/bus'
import {
    unitFilter
} from 'shared/util.js'
import {
    addEventListener,
    removeEventListener
} from '@/common/watcher'
import {
    NOTICE_TYPE
} from '../common/constant'

export default function useComponentAction (isComponentSelected = false, layoutName = '', platform = 'PC') {
    const container = platform === 'PC' ? '.lesscode-editor-layout .container-content' : '#drawTarget .target-drag-area'
    const store = useStore()
    const isSelectedRef = ref(isComponentSelected)
    const layout = ref(platform === 'pc' ? 'left-right' : 'mobile-empty')

    const curTemplateData = computed(() => store.getters['drag/curTemplateData'])

    /** 取消所有组件的选中状态 */
    const unselectComponent = () => {
        const activeNode = LC.getActiveNode()
        if (activeNode) {
            activeNode.activeClear()
        }
        document.body.querySelectorAll('.component-wrapper').forEach($el => {
            $el.classList.remove('selected')
        })
    }

    /** 面板点击回调，更新当前激活的组件，以更新右侧配置面板 */
    const componentClickHandler = () => {
        unselectComponent()
        isSelectedRef.value = true
        store.commit('drag/setCurTemplateData', {
            ...store.getters['drag/curTemplateData'],
            panelActive: layoutName
        })
    }

    const applyPageSetting = () => {
        nextTick(() => {
            const pageStyle = LC.pageStyle
            const $pageContentTarget = document.querySelector(container)
            $pageContentTarget && Object.keys(pageStyle).forEach(key => {
                if (key !== 'min-width') {
                    $pageContentTarget.style[key] = unitFilter(pageStyle[key]) || ''
                }
            })
            // min-width 属性需要加到导航的整体宽度上
            if (pageStyle['min-width']) {
                const $layoutTarget = document.querySelector('.lesscode-editor-layout')
                if ($layoutTarget) {
                    $layoutTarget.style['min-width'] = unitFilter(pageStyle['min-width']) || ''
                }
            }
        })
    }

    /** 监测layout改变时，更新curTemplateData */
    const handleLayoutChange = () => {
        const {
            showName,
            layoutType,
            layoutContent = {}
        } = store.getters['layout/pageLayout']

        store.commit('drag/setCurTemplateData', {
            showName,
            layoutType,
            ...layoutContent
        })
        layout.value = layoutType
        applyPageSetting()
    }

    /**
     * @desc 更新模板配置
     * @param { Object } payload
     */
    const handleTemplateChange = (payload) => {
        const {
            logo,
            siteName,
            menuList,
            topMenuList,
            renderProps,
            themConfig,
            theme
        } = payload
        store.commit('drag/setCurTemplateData', {
            ...store.getters['drag/curTemplateData'],
            logo,
            siteName,
            menuList,
            topMenuList,
            renderProps,
            themConfig,
            theme
        })
    }

    const activeCallback = () => {
        isSelectedRef.value = false
        document.body.querySelectorAll('.component-wrapper').forEach($el => {
            $el.classList.remove('selected')
        })
    }

    onMounted(() => {
        unselectComponent()
        /** 事件绑定 */
        bus.$on('on-template-change', handleTemplateChange)
        
        LC.addEventListener('active', activeCallback)
        LC.addEventListener('setPageStyle', applyPageSetting)
        addEventListener(NOTICE_TYPE.LAYOUT_CHANGE, handleLayoutChange, { immediate: true })
    })

    onBeforeUnmount(() => {
        bus.$off('on-template-change', handleTemplateChange)
        LC.removeEventListener('active', activeCallback)
        LC.removeEventListener('setPageStyle', applyPageSetting)
        removeEventListener(NOTICE_TYPE.LAYOUT_CHANGE, handleLayoutChange)
    })

    return {
        isSelectedRef,
        curTemplateData,
        layout,
        unselectComponent,
        componentClickHandler
    }
}
