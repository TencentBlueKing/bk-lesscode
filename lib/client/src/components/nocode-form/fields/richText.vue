<template>
    <div class="rich-text">
        <rich-text-editor :value="val" :disabled="disabled" @change="change" :is-full-screen="isFullScreen">
        </rich-text-editor>
    </div>
</template>
<script>
    import RichTextEditor from '../components/richTextEditor.vue'

    export default {
        name: 'RichText',
        components: {
            RichTextEditor
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
            },
            isFullScreen: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                val: this.value

            }
        },
        watch: {
            value (val) {
                this.val = val
            }
        },
        methods: {
            change (val) {
                this.$emit('change', val)
            }
        }
    }
</script>
<style lang="postcss" scoped>
.rich-text{
  position: relative;
}
.full-screen{
  position: absolute;
  top: 0;
  right: 0;
  color: #333;
  height: 28px;
  font-size: 13px;
  z-index: 99;
}
</style>
