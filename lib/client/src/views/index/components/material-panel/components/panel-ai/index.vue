<template>
    <render-modal
        @clear="handleClear"
        @close="handlerClose"
    >
        <render-content ref="content" :is-show-ai="isShowAi" />
    </render-modal>
</template>
<script>
    import { ref } from 'vue'
    import RenderModal from './components/modal.vue'
    import RenderContent from './components/content.vue'

    export default {
        components: {
            RenderModal,
            RenderContent
        },

        emits: ['close'],
        props: { isShowAi: Boolean },
        setup (_, { emit }) {
            const content = ref(null)

            const handleClear = () => {
                content.value.clearMessage()
            }

            const handlerClose = () => {
                emit('close')
            }

            return {
                content,
                handleClear,
                handlerClose
            }
        }
    }
</script>
