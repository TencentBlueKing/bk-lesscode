<template>
    <div class="desc">
        <div class="content">
            <viewer :initial-value="value || field.value"></viewer>
        </div>
    </div>
</template>
<script>
    import { Viewer } from '@toast-ui/vue-editor'
    import '@toast-ui/editor/dist/toastui-editor.css'
    export default {
        name: 'Description',
        components: {
            Viewer
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            value: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            }
        }
    }
</script>
<style lang="postcss" scoped>
.desc {
  .content {
    padding: 8px;
    font-size: 14px;
    color: #63656e;
    background: #f5f7fa;
    white-space: pre-line;
  }
}
</style>
