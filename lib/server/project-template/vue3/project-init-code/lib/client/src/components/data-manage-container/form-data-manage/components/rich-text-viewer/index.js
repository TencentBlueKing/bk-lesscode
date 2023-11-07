import { h } from 'vue'
import Viewer from '@toast-ui/editor/dist/toastui-editor-viewer'
import '@toast-ui/editor/dist/toastui-editor-viewer.css'

export default {
    name: 'bkform-engine-rich-text',
    props: {
        value: {
            type: String,
            default: ''
        }
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
            this.instance = new Viewer({
                el: this.$refs.richTextRef,
                initialValue: this.value,
                height: '400px',
                previewStyle: 'vertical',
                initialEditType: 'wysiwyg'
            })
        }
    },
    render () {
        return h(
            'div',
            {
                ref: 'richTextRef',
                class: 'rich-text-container'
            }
        )
    }
}
