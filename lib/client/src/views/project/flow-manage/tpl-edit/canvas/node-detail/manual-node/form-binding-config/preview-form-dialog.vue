<template>
    <bk-dialog
        class="preview-form-dialog"
        :title="$t('表单预览')"
        header-position="left"
        width="912"
        render-directive="if"
        :position="{ top: 100 }"
        :value="show"
        :auto-close="false"
        :mask-close="false"
        @cancel="emit('close')">
        <div v-bkloading="{ loading }" class="dialog-content">
            <FormContainerRenderComp v-if="!loading" :fields="fields" />
        </div>
        <div class="dialog-footer" slot="footer">
            <bk-button @click="emit('close')">{{ $t('关闭') }}</bk-button>
        </div>
    </bk-dialog>
</template>
<script>
    import { defineComponent, ref, watch } from 'vue'
    import { useStore } from '@/store' 
    import FormContainerRenderComp from './form-container-render-comp'

    export default defineComponent({
        name: 'PreviewFormDialog',
        components: {
            FormContainerRenderComp
        },
        props: {
            id: {
                type: Number,
                default: 0
            },
            show: {
                type: Boolean,
                default: false
            }
        },
        setup(props, { emit }) {
            const store = useStore()

            const fields = ref([])
            const loading = ref(false)

            watch(() => props.show, (val) => {
                if (val && props.id) {
                    getFormDetail()
                }
            })

            const getFormDetail = async () => {
                loading.value = true
                const res = await store.dispatch('nocode/form/formDetail', { formId: props.id })
                fields.value = JSON.parse(res.content || '[]')
                loading.value = false
            }

            return { fields, loading, emit }
        }
    })
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    .dialog-content {
        padding: 0 24px 24px;
        min-height: 420px;
        max-height: 500px;
        overflow: auto;
        @mixin scroller;
    }
</style>
<style lang="postcss">
    .preview-form-dialog {
        .bk-dialog-body {
            padding-left: 0;
            padding-right: 0;
        }
    }
</style>
