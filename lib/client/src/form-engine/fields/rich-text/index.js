import { h } from 'bk-lesscode-render'
import Editor from '@toast-ui/editor'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor.css'

export default {
    name: 'bkform-engine-rich-text',
    props: {
        fieldData: {
            type: Object,
            default: () => ({})
        },
        value: {
            type: String,
            default: ''
        },
        disabled: Boolean
    },
    data () {
        return {
            instance: null
        }
    },
    watch: {
        value (val) {
            this.instance.setHTML(val)
        },
        disabled () {
            this.render()
        }
    },
    mounted () {
        this.render()
    },
    beforeDestroy () {
        if (this.instance) {
            this.instance.destroy()
        }
    },
    methods: {
        render () {
            if (this.instance) {
                this.instance.destroy()
            }
            if (this.disabled) {
                this.initViewer()
            } else {
                this.initEditor()
            }
        },
        initEditor () {
            const self = this
            this.instance = new Editor({
                el: this.$refs.richTextRef,
                initialValue: this.value,
                height: '400px',
                previewStyle: 'vertical',
                initialEditType: 'wysiwyg',
                hideModeSwitch: true,
                autofocus: false,
                events: {
                    blur: (val) => {
                        const content = val === 'wysiwyg' ? self.instance.getHTML() : self.instance.getValue()
                        self.handleChange(content)
                    }
                }
            })
        },
        initViewer () {
            this.instance = new Viewer({
                el: this.$refs.richTextRef,
                initialValue: this.value,
                height: '400px',
                previewStyle: 'vertical',
                initialEditType: 'wysiwyg'
            })
        },
        handleChange (val) {
            console.log(val)
            if (this.value !== val) {
                this.$emit('change', val)
            }
        }
    },
    render (render) {
        h.init(render)

        return h({
            component: 'div',
            ref: 'richTextRef',
            class: 'rich-text-container'
        })
    }
}
