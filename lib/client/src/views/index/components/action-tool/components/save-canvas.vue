<template>
    <menu-item
        v-bkloading="{ isLoading }"
        :item="item"
        :class="{
            disabled: isLocked
        }" />
</template>
<script>
    import {
        ref,
        onBeforeUnmount,
        getCurrentInstance
    } from 'vue'
    import MenuItem from './menu-item'
    import useSave from './common/use-save'
    import usePreviewImg from './common/use-preview-img'
    import useCanvaseLock from './common/use-canvas-lock'

    export default {
        components: {
            MenuItem
        },
        
        setup () {
            const currentInstance = getCurrentInstance()
            const [isLoading, handleSave] = useSave()
            const [, handleUpdatePreiviewImg] = usePreviewImg()
            const {
                check: canvasLockCheck,
                notify: canvasLockNotify,
                update: canvaseLockUpdate,
                relase: canvasLockRelase
            } = useCanvaseLock()

            const isLocked = ref(true)

            let lockInfo = {}

            // 检测页面的可编辑状态
            canvasLockCheck()
                .then(data => {
                    if (data.isLock) {
                        lockInfo = data
                        isLocked.value = true
                        canvasLockNotify({
                            type: 'lock',
                            ...data
                        })
                    } else {
                        isLocked.value = false
                        canvaseLockUpdate()
                    }
                })
            /**
             * @desc 保存页面
             *
             * 保存页面数据，更新页面预览图
             */
            const handleSubmit = async () => {
                if (isLocked.value) {
                    currentInstance.proxy.$bkMessage({
                        message: window.i18n.t('画布正在被 {0} 编辑无法保存', [lockInfo.activeUser]),
                        theme: 'warning'
                    })
                    return
                }
                await handleSave()
                await handleUpdatePreiviewImg()
            }

            window.addEventListener('unload', canvasLockRelase)

            // 组件卸载释放页面的编辑权
            onBeforeUnmount(() => {
                canvasLockRelase()
            })
            
            return {
                isLoading,
                isLocked,
                item: {
                    icon: 'bk-drag-icon bk-drag-save',
                    text: window.i18n.t('保存'),
                    func: handleSubmit
                }
            }
        }
    }
</script>
