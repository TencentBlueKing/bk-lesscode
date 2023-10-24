<template>
    <bk-button theme="primary" :loading="isLoading" @click="handleSubmit">{{$t('保存')}}</bk-button>
</template>
<script>
    import {
        ref,
        onBeforeUnmount,
        getCurrentInstance
    } from '@vue/composition-api'
    import useSave from './common/use-save'
    import useSaveFormContainer from './common/use-save-form-container' // 表单容器数据源为新建表时需要，创建或更新form表
    import usePreviewImg from './common/use-preview-img'
    import useCanvaseLock from './common/use-canvas-lock'

    export default {
        setup () {
            const currentInstance = getCurrentInstance()
            const { isFormContainerPending, saveFormContainers } = useSaveFormContainer()
            const [isSavePending, handleSave] = useSave()
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
                await saveFormContainers()
                await handleSave()
                await handleUpdatePreiviewImg()
            }

            window.addEventListener('unload', canvasLockRelase)

            // 组件卸载释放页面的编辑权
            onBeforeUnmount(() => {
                canvasLockRelase()
            })
            
            return {
                isLoading: isFormContainerPending || isSavePending,
                isLocked,
                handleSubmit
            }
        }
    }
</script>
