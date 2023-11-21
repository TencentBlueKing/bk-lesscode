<template>
    <section class="rich-text-value-editor">
        <bk-button text class="setting-btn" theme="primary" @click="openDialog">{{ $t('前往设置') }}</bk-button>
        <bk-dialog
            :value="showDialog"
            theme="primary"
            :title="$t('内容配置')"
            header-position="left"
            :auto-close="false"
            :width="960"
            :mask-close="false"
            @confirm="handleConfirm"
            @cancel="handleCancel">
            <section ref="richTextRef" class="rich-text-container"></section>
        </bk-dialog>
    </section>
</template>
<script>
import Editor from '@toast-ui/editor'
import '@toast-ui/editor/dist/toastui-editor.css'

export default {
    name: 'rich-text-value-editor',
    props: {
        disabled: Boolean,
        value: {
            type: String,
            default: ''
        }
    },
    data () {
        return {
            showDialog: false,
            instance: null
        }
    },
    beforeDestroy () {
        this.destroy()
    },
    methods: {
        openDialog () {
            this.showDialog = true
            this.initEditor()
        },
        initEditor () {
            this.instance = new Editor({
                el: this.$refs.richTextRef,
                initialValue: this.value,
                height: '400px',
                previewStyle: 'vertical',
                initialEditType: 'wysiwyg'
            })
        },
        handleConfirm () {
            const content = this.instance.getHTML()
            this.showDialog = false
            this.$emit('change', content)
            this.destroy()
        },
        handleCancel () {
            this.showDialog = false
            this.destroy()
        },
        destroy () {
            if (this.instance) {
                this.instance.destroy()
                this.instance = null
            }
        }
    }
}
</script>
<style lang="postcss" scoped>
    .setting-btn {
        padding: 0;
        font-size: 12px;
    }
</style>
