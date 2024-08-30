<template>
    <section class="render-header">
        <span class="header-title">{{ currentModule.moduleCode }}</span>

        <section class="header-input">
            <section
                :style="{
                    '--text-height': textHeight + 'px',
                    'width': '100%',
                    'max-width': '920px',
                    'margin-right': '8px',
                    'z-index': 2
                }"
            >
                <bk-input
                    name="storyInput"
                    ref="inputRef"
                    class="send-input"
                    type="textarea"
                    row="2"
                    :placeholder="$t('请输入应用需求，系统将自动生成应用框架及需求代码，并部署至开发调试环境')"
                    :native-attributes="{ autofocus: 'autofocus' }"
                    v-model="userInput"
                ></bk-input>
            </section>
            <bk-button
                theme="primary"
                :disabled="!userInput || isExecuting || isLocked"
                :loading="isLoading"
                @click="handleGenerate"
            >
                {{ $t('添加需求') }}
            </bk-button>
        </section>
    </section>
</template>

<script>
    import { ref, computed, watch, onMounted, onBeforeUnmount } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { uuid } from 'shared/util'
    import useResourceLock from '@/common/use-resource-lock'

    export default {
        props: {
            currentModule: {
                type: Object,
                default: () => ({})
            },
            projectId: {
                required:  true
            }
        },

        setup (props) {
            const store = useStore()
            
            const userInput = ref('')
            const textHeight = ref(54)
            const isLoading = ref(false)

            const {
                check: canvasLockCheck,
                notify: canvasLockNotify,
                update: canvaseLockUpdate,
                release: canvasLockRelase,
                destroy: canvasLockDestroy
            } = useResourceLock()

            const isLocked = ref(false)

            let lockInfo = {}

            const lockParams = computed(() => {
                return {
                    tableName: 'saas-backend',
                    resourceId: props.currentModule?.id
                }
            })

            const isExecuting = computed(() => {
                return store.getters['saasBackend/getIsExecuting']
            })

            watch(
                () => props.currentModule,
                (val, oldVal) => {
                    if (oldVal?.id) {
                        canvasLockRelase({
                            tableName: 'saas-backend',
                            resourceId: oldVal?.id 
                        })
                    }
                    userInput.value = ''
                    handleLock()
                }
            )

            onMounted(() => {
                handleLock()
            })

            window.addEventListener('unload', handleReleaseLock)

            // 组件卸载释放页面的编辑权
            onBeforeUnmount(() => {
                handleReleaseLock()
            })

            const handleReleaseLock = () => {
                canvasLockRelase(lockParams.value)
            }

            const handleLock = () => {
                canvasLockDestroy()
                // 检测页面的可编辑状态
                canvasLockCheck(lockParams.value)
                    .then(data => {
                        if (data.isLock) {
                            lockInfo = data
                            isLocked.value = true
                            store.commit('saasBackend/setStateProperty', { key: 'isCanvasLocked', value: true })
                            canvasLockNotify({
                                type: 'lock',
                                ...data
                            })
                        } else {
                            isLocked.value = false
                            store.commit('saasBackend/setStateProperty', { key: 'isCanvasLocked', value: false })
                            canvaseLockUpdate(lockParams.value)
                        }
                    }
                )
            }

            const handleChangeTextHeight = () => {
                const lines = userInput.value.split(/\r?\n/)
                let height = 22 + lines.length * 16
                if (height >= 460) {
                    height = 200
                }
                textHeight.value = height
            }

            const handleGenerate = async () => {
                isLoading.value = true

                try {
                    const params = {
                        moduleId: props.currentModule?.id,
                        appCode: props.currentModule?.appCode?.replaceAll('-', '_'),
                        moduleCode: props.currentModule?.moduleCode?.replaceAll('-', '_'),
                        app_name: props.currentModule?.moduleCode?.replaceAll('-', '_'),
                        story: userInput.value,
                        uuid: `${props.currentModule?.moduleCode}_${uuid(8)}`,
                        projectId: props.projectId
                    }
                    const item = await store.dispatch('saasBackend/createModuleStory', params)
                    if (item.id) {
                        userInput.value = ''
                        store.commit('saasBackend/setStateProperty', { key: 'needUpdate', value: true })
                    }
                } catch (err) {
                    console.error(err)
                } finally {
                    isLoading.value = false
                }
            }

            watch(
                () => userInput.value,
                handleChangeTextHeight
            )

            return {
                userInput,
                textHeight,
                isLoading,
                isExecuting,
                isLocked,
                handleGenerate
            }
        }
    }
</script>

<style lang="postcss" scoped>
.render-header {
    width: 100%;
    height: 146px;
    background: #FFFFFF;
    border: 1px solid #DCDEE5;
    padding: 18px 24px 24px;
}
.header-title {
    font-weight: 700;
    font-size: 14px;
    line-height: 22px;
    color: #313238;
}
.header-input {
    display: flex;
    align-items: flex-start;
    margin-top: 26px;
}

.send-input {
  flex-direction: row;
  >>> textarea {
    font-size: 14px;
    line-height: 16px;
    height: var(--text-height);
    min-height: 54px;
    padding: 11px 38px 10px 11px;
    resize: none !important;
    color: #63656e;
    &::-webkit-scrollbar {
      width: 4px;
      height: 4px;
    }

    &::-webkit-scrollbar-thumb {
      height: 5px;
      border-radius: 3px;
      background-color: #dcdee5;
    }
    &::placeholder {
      line-height: 16px;
    }
  }
}
</style>
