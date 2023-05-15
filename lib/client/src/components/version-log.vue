<template>
    <bk-dialog
        class="component-version-log-dialog"
        :title="dialogTitle"
        :value="isShow"
        @cancel="handleCancel"
        quick-close
        :width="860"
        header-position="left">
        <mavon-editor :value="localValue" :external-link="false" :editable="false" :subfield="false" :toolbars-flag="false" default-open="preview" />
        <div slot="footer">
            <bk-button @click="handleCancel">{{ $t('关闭') }}</bk-button>
        </div>
    </bk-dialog>
</template>
<script>
    export default {
        name: '',
        props: {
            isShow: {
                type: Boolean,
                default: false
            },
            title: {
                type: String
            },
            data: {
                type: Object,
                default: () => ({})
            }
        },
        computed: {
            localValue () {
                return this.data.versionLog || ''
            },
            dialogTitle () {
                if (this.title) {
                    return this.title
                }
                return this.$t('{0}  {1}版本日志', [this.data.name, this.data.version])
            }
        },
        methods: {
            handleCancel () {
                this.$emit('update:isShow', false)
            }
        }
    }
</script>
<style lang="postcss">
    .component-version-log-dialog {
        .markdown-body{
            max-height: 460px;
            box-shadow: none !important;
            .v-show-content {
                padding: 0 !important;
                background: #fff !important;
            }
        }
    }
</style>
