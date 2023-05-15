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
        @cancel="$emit('close')">
        <div class="dialog-content">
            <nocode-form :fields="fields"></nocode-form>
        </div>
        <div class="dialog-footer" slot="footer">
            <bk-button @click="$emit('close')">{{ $t('关闭') }}</bk-button>
        </div>
    </bk-dialog>
</template>
<script>
    import NocodeForm from '@/components/flow-form-comp/form/index.vue'

    export default {
        name: 'PreviewFormDialog',
        components: {
            NocodeForm
        },
        props: {
            show: Boolean,
            fields: {
                type: Array,
                default: () => []
            }
        }
    }
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
