<template>
    <div class="rich-text-editor">
        <viewer v-if="preview || disabled" :initial-value="value"></viewer>
        <editor v-else
            ref="editor"
            class="fullscreen-wrapper"
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
    import { api as fullscreen } from 'vue-fullscreen'
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
            },
            isFullScreen: {
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
                        ['code', 'codeblock']
                    ],
                    autofocus: false
                },
                fullscreen: false
            }
        },
        watch: {
            value (val) {
                if (this.$refs.editor) {
                    this.$refs.editor.invoke('setHTML', val)
                }
            }
        },
        created () {
            if (this.isFullScreen) {
                this.defaultOptions.toolbarItems.push([{
                    el: this.createLastButton(),
                    command: 'fullScreen',
                    tooltip: '全屏'
                }])
            }
        },
        methods: {
            createLastButton () {
                const button = document.createElement('button')
                button.className = 'toastui-editor-toolbar-icons last'
                button.style.backgroundImage = 'none'
                button.style.margin = '0'
                button.innerHTML = '<i class="icon bk-drag-icon bk-drag-filliscreen-line full-screen" id="fill-screen"></i>'
                    + '<i class="icon bk-drag-icon bk-drag-full-screen" id="full-screen" style="display: none"></i>'
                const that = this
                button.addEventListener('click', () => {
                    that.toggle()
                })
                return button
            },
            onEditorChange () {
                const value = this.$refs.editor.invoke('getHTML')
                this.$emit('change', value)
            },
            handleFullScreen () {
                this.toggle()
            },
            async toggle () {
                await fullscreen.toggle(this.$el.querySelector('.fullscreen-wrapper'), {
                    teleport: this.teleport,
                    pageOnly: false,
                    fullscreenClass: 'full-screen-rich-text',
                    callback: (isFullscreen) => {
                        if (isFullscreen) {
                            document.getElementById('fill-screen').style = 'display:none'
                            document.getElementById('full-screen').style = 'display:block'
                        } else {
                            document.getElementById('fill-screen').style = 'display:block'
                            document.getElementById('full-screen').style = 'display:none'
                        }
                        this.fullscreen = isFullscreen
                    }
                })
                this.fullscreen = fullscreen.isFullscreen
            }
        }
    }
</script>
<style lang="postcss">
#fill-screen{
  font-weight: bold;
  font-size: 16px;
}
#full-screen{
    font-weight: bold;
    font-size: 16px;
}
</style>
