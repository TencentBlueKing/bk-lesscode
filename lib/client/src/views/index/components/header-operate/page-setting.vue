<template>
    <div class="setting-btn" v-bk-tooltips="{ content: showTips }" @click="handleShowPageSetting">
        <i class="bk-drag-icon bk-drag-setting-fill"></i>
    </div>
</template>

<script>
    import { defineComponent } from '@vue/composition-api'
    import { useStore } from '@/store'
    import LC from '@/element-materials/core'

    export default defineComponent({
        setup () {
            const store = useStore()
            
            // 清空当前选中的组件跟设置导航不可见
            function handleShowPageSetting () {
                const activeNode = LC.getActiveNode()
                if (activeNode) {
                    activeNode.activeClear()
                }
                store.commit('drag/setCurTemplateData', {
                    ...store.getters['drag/curTemplateData'],
                    panelActive: ''
                })
            }

            return {
                showTips: '配置面板显示页面配置',
                handleShowPageSetting
            }
        }
    })
</script>
