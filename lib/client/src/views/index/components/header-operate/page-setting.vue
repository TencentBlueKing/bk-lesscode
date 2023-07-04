<template>
    <div class="setting-btn" v-bk-tooltips="{ content: showTips, maxWidth: 400 }" @click="handleShowPageSetting">
        <i class="bk-drag-icon bk-drag-setting"></i>
    </div>
</template>

<script>
    import { defineComponent, computed } from '@vue/composition-api'
    import { useStore } from '@/store'
    import LC from '@/element-materials/core'
    import { bus } from '@/common/bus'

    export default defineComponent({
        setup () {
            const store = useStore()

            const pageDetail = computed(() => store.getters['page/pageDetail'])
            
            // 清空当前选中的组件跟设置导航不可见
            function handleShowPageSetting () {
                if (!pageDetail.value?.nocodeType) {
                    // 自定义页面
                    const activeNode = LC.getActiveNode()
                    if (activeNode) {
                        activeNode.activeClear()
                    }
                } else {
                    // 表单类型页面跟自定义管理页
                    bus.$emit('clearCurFormField')
                    store.commit('nocode/dataManage/setSelectedComp')
                }
                
                // 取消选中导航属性面板
                store.commit('drag/setCurTemplateData', {
                    ...store.getters['drag/curTemplateData'],
                    panelActive: ''
                })
            }

            return {
                showTips: window.i18n.t('配置面板显示页面配置'),
                handleShowPageSetting
            }
        }
    })
</script>
