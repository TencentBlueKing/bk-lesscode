<template>
    <div class="rich-text-editor">
        <viewer v-if="preview || disabled" :initial-value="value"></viewer>
        <editor
            v-else
            ref="editor"
            initial-edit-type="wysiwyg"
            :options="defaultOptions"
            :initial-value="value"
            @fullscreen="handleFullScreen"
            @blur="onEditorChange">
        </editor>
    </div>
</template>
<script>
    import { Editor, Viewer } from '@toast-ui/vue-editor'
    import '@toast-ui/editor/dist/toastui-editor.css'

    export default {
        name: 'RichTextEditor',
        components: {
            Editor,
            Viewer
        },
        props: {
            preview: {
                type: Boolean,
                default: false
            },
            value: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                defaultOptions: {
                    toolbarItems: [
                        ['heading', 'bold', 'italic', 'strike'],
                        ['hr', 'quote'],
                        ['ul', 'ol', 'task', 'indent', 'outdent'],
                        ['table', 'image', 'link'],
                        ['code', 'codeblock'],
                        [{
                            el: this.createLastButton(),
                            command: 'fullScreen',
                            tooltip: '全屏'
                        }]
                    ],
                    autofocus: false
                }
            }
        },
        watch: {
            value (val) {
                if (this.$refs.editor) {
                    this.$refs.editor.invoke('setHTML', val)
                    console.log()
                }
            }
        },
        methods: {
            createLastButton () {
                const button = document.createElement('button')
                button.className = 'toastui-editor-toolbar-icons last'
                button.style.backgroundImage = 'none'
                button.style.margin = '0'
                button.innerHTML = '<i class="icon bk-drag-icon bk-drag-filliscreen-line full-screen"></i>'
                // if (this.$refs.editor) {
                const that = this
                button.addEventListener('click', () => {
                    that.$emit('fullscreen')
                })
                // }
                return button
            },
            onEditorChange () {
                const value = this.$refs.editor.invoke('getHTML')
                console.log(value)
                this.$emit('change', value)
            },
            handleFullScreen () {
                console.log('handleFullScreen')
            }
        }
    }
</script>
