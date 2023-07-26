<template>
    <section class="ai-content">
        <ul class="ai-messages">
            <render-message
                v-for="(message, index) in messages"
                :key="index.content"
                :message="message"
                class="ai-message"
            />
        </ul>

        <section
            class="ai-operation"
            v-bk-tooltips="{
                content: $t('内容正在执行中，请执行完成后再输入'),
                disabled: !isLoading
            }"
        >
            <bk-input
                size="large"
                class="ai-operation-input"
                :disabled="isLoading"
                v-model="content"
                @enter="handleUserInput"
            ></bk-input>
            <bk-button
                size="large"
                theme="primary"
                class="ai-operation-button"
                :disabled="isLoading"
                @click="handleUserInput"
            >
                <i class="bk-drag-icon bk-drag-fasong"></i>
                {{ $t('发送') }}
            </bk-button>
        </section>
    </section>
</template>
<script>
    import { useStore } from '@/store'
    import { ref, onBeforeMount } from '@vue/composition-api'
    import LC from '@/element-materials/core'
    import { isEmpty } from 'shared/util'
    import RenderMessage from './message.vue'

    export default {
        components: {
            RenderMessage
        },

        setup () {
            const store = useStore()

            const messages = ref([])
            const content = ref('')
            const isLoading = ref(false)

            const pushMessage = (type, content, status) => {
                const message = {
                    type,
                    content,
                    status
                }
                messages.value.push(message)
                return message
            }

            // 获取当前操作的节点
            const getNode = (data) => {
                return isEmpty(data.target) ? LC.getRoot() : LC.getNodeById(data.target)
            }

            // 新增子节点
            const handleCreateNode = (data) => {
                const parentNode = getNode(data)
                // 补齐 bk-
                if (!data.content.type.startsWith('bk-')) {
                    data.content.type = 'bk-' + data.content.type
                }
                const node = LC.createNodeFromData(data.content)
                parentNode.appendChild(node)
                return node
            }

            // 编辑节点
            const handleEditNode = (data) => {
                const node = getNode(data)
                LC.editNode(node, data.content)
            }

            // 删除节点
            const handleDeleteNode = (data) => {
                const node = getNode(data)
                node.parentNode.removeChild(node)
            }

            // 在前面插入节点
            const handleInsertBefore = (data) => {
                const referenceNode = getNode(data)
                const node = LC.createNodeFromData(data.content)
                referenceNode.parentNode.insertBefore(node, referenceNode)
            }

            // 在后面插入节点
            const handleInsertAfter = (data) => {
                const referenceNode = getNode(data)
                const node = LC.createNodeFromData(data.content)
                referenceNode.parentNode.insertAfter(node, referenceNode)
            }

            const handleUserInput = () => {
                // 记录输入的数据
                const userInput = content.value
                pushMessage('user', userInput)
                // 清除input
                content.value = ''
                // 调用接口
                isLoading.value = true
                // 返回loading message
                const message = pushMessage('ai', '正在努力生成中，请稍等', 'loading')
                store
                    .dispatch(
                        'ai/generatePage',
                        {
                            content: userInput
                        }
                    )
                    .then((res) => {
                        try {
                            const datas = JSON.parse(res)
                            message.content = ''
                            datas.forEach((data) => {
                                switch (data.type) {
                                    case 'create':
                                        const node = handleCreateNode(data)
                                        message.content = `已为您新增 id 为【${node.componentId}】的【${data.content.type}】组件`
                                        message.status = 'success'
                                        break
                                    case 'edit':
                                        handleEditNode(data)
                                        message.content = `已为您修改【${data.target}】组件`
                                        message.status = 'success'
                                        break
                                    case 'delete':
                                        handleDeleteNode(data)
                                        message.content = `已为您删除【${data.target}】组件`
                                        message.status = 'success'
                                        break
                                    case 'insert-before':
                                        handleInsertBefore(data)
                                        message.content = `已为您在组件【${data.target}】前插入【${data.content.type}】组件`
                                        message.status = 'success'
                                        break
                                    case 'insert-after':
                                        handleInsertAfter(data)
                                        message.content = `已为您在组件【${data.target}】后插入【${data.content.type}】组件`
                                        message.status = 'success'
                                        break
                                    default:
                                        throw new Error()
                                }
                            })
                        } catch (error) {
                            message.content = '非常抱歉执行失败，我不太明白你描述的是什么，你可以尝试通过以下方式修改描述：\n  1. 请帮我添加一个名称为“新建”的按钮\n  2. 为组件“class_01”添加背景色“#ffffff”\n更多的详情，可以查看“使用文档”'
                            message.status = 'error'
                        }
                    })
                    .catch((error) => {
                        message.content = error.message
                        message.status = 'error'
                    })
                    .finally(() => {
                        isLoading.value = false
                    })
            }

            const clearMessage = () => {
                messages.value = []
            }

            onBeforeMount(() => {
                pushMessage('ai', 'Hi，我是小鲸，我可以帮你实现添加组件，函数生成等复杂功能，你可以尝试说帮我先增一个按钮')
            })

            return {
                messages,
                content,
                isLoading,
                handleUserInput,
                clearMessage
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    .ai-content {
        flex: 1;
        height: calc(100% - 48px);
    }
    .ai-messages {
        height: calc(100% - 64px);
        overflow-y: auto;
        @mixin scroller;
        padding: 16px 16px 0 16px;
        .ai-message {
            margin-bottom: 16px;
        }
    }
    .ai-operation {
        background: #FFFFFF;
        height: 64px;
        padding: 12px;
        display: flex;
        align-items: center;
    }
    .ai-operation-input {
        margin-right: 7px;
        /deep/ .bk-form-input {
            border-color: transparent;
            background: #F5F7FA;
            border-radius: 2px;
            color: #63656E;
        }
    }
    .ai-operation-button {
        padding: 0 3px 0 0 !important;
        min-width: 84px;
    }
</style>
