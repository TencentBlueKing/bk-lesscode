import { h } from 'bk-lesscode-render'
import Editor from '@toast-ui/editor'
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
        }
    },
    mounted () {
        this.initEditor()
    },
    beforeDestroy () {
        if (this.instance) {
            this.instance.destroy()
        }
    },
    methods: {
        initEditor () {
            const self = this
            this.instance = new Editor({
                el: this.$refs.richTextRef,
                initialValue: this.value,
                height: '400px',
                previewStyle: 'vertical',
                initialEditType: 'wysiwyg',
                events: {
                    blur: (val) => {
                        const content = val === 'wysiwyg' ? self.instance.getHTML() : self.instance.getValue()
                        self.handleChange(content)
                    }
                }
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
