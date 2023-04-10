<template>
    <menu-item
        :item="item"
        v-bk-tooltips="{
            allowHtml: true,
            width: 530,
            distance: 10,
            trigger: 'click',
            theme: 'light',
            content: `#ai`,
            placement: 'bottom',
            boundary: 'window'
        }">
        <div style="display: none">
            <div id="ai">
                <ul class="ai-history">
                    <li
                        v-for="(history, index) in aiHistory"
                        :key="index"
                        :class="history.type"
                    >{{ history.message }}</li>
                </ul>
                <bk-input
                    v-bkloading="{ isLoading }"
                    v-model="content"
                    @enter="handleUserInput"
                ></bk-input>
            </div>
        </div>
    </menu-item>
</template>
<script>
    import MenuItem from './menu-item';
    import { useStore } from '@/store';
    import { ref } from '@vue/composition-api';
    import LC from '@/element-materials/core';
    import { isEmpty } from 'shared/util';

    export default {
        components: {
            MenuItem
        },
        setup() {
            const store = useStore();

            const aiHistory = ref([]);
            const content = ref('');
            const isLoading = ref(false);
            const item = {
                icon: 'bk-drag-icon bk-drag-rate',
                text: 'AI',
                func: () => {}
            };

            const pushMessage = (type, message) => {
                aiHistory.value.push({
                    type,
                    message
                })
            }

            // 获取当前操作的节点
            const getNode = (data) => {
                return isEmpty(data.target) ? LC.getRoot() : LC.getNodeById(data.target)
            }

            // 新增子节点
            const handleCreateNode = (data) => {
                const parentNode = getNode(data)
                const node = LC.createNodeFromData(data.content)
                parentNode.appendChild(node)
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
                const message = content.value
                pushMessage('user', message)
                // 清除input
                content.value = ''
                // 调用接口
                isLoading.value = true;
                store
                    .dispatch(
                        'ai/generatePage',
                        {
                            content: message
                        }
                    )
                    .then((res) => {
                        try {
                            const data = JSON.parse(res)
                            switch (data.type) {
                                case 'create':
                                    handleCreateNode(data)
                                    pushMessage('ai', `已为您新增【${data.content.type}】组件`)
                                    break;
                                case 'edit':
                                    handleEditNode(data)
                                    pushMessage('ai', `已为您修改【${data.target}】组件`)
                                    break;
                                case 'delete':
                                    handleDeleteNode(data)
                                    pushMessage('ai', `已为您删除【${data.target}】组件`)
                                    break;
                                case 'insert-before':
                                    handleInsertBefore(data)
                                    pushMessage('ai', `已为您在组件【${data.target}】前插入【${data.content.type}】组件`)
                                    break;
                                case 'insert-after':
                                    handleInsertAfter(data)
                                    pushMessage('ai', `已为您在组件【${data.target}】后插入【${data.content.type}】组件`)
                                    break;
                                default:
                                    pushMessage('ai', res)
                                    break;
                            }
                        } catch (error) {
                            pushMessage('ai', res)
                        }
                    })
                    .finally(() => {
                        isLoading.value = false;
                    })
            }

            return {
                aiHistory,
                content,
                isLoading,
                item,
                handleUserInput
            }
        }
    }
</script>
<style lang="postcss">
    .ai-history {
        height: 600px;
        margin-bottom: 20px;
        overflow-y: auto;
        li {
            line-height: 16px;
            font-size: 14px;
            margin: 0 5px;
        }
        .user {
            text-align: right;
        }
    }
</style>
