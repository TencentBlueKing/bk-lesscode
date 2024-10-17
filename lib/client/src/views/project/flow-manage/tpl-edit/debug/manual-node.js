import { render, destory } from 'bk-lesscode-render'
import 'bk-lesscode-render/dist/index.css'
import { i18nConfig } from '@/locales/i18n.js'
import router from '@/router'
import ManualNodeForm from '@/components/render/pc/widget/flow-manage-container/preview/components/task-detail-sideslider/manual-node-form.js'

export default {
    props: {
        id: Number,
        nodeId: String,
        fields: {
            type: Array,
            default: () => []
        }
    },
    mounted () {
        render({
            component: ManualNodeForm,
            selector: '#manual-node-form',
            router,
            i18nConfig,
            props: {
                id: this.id,
                nodeId: this.nodeId,
                fields: this.fields,
                onSubmitted: this.submitted,
                onClose: this.close
            }
        })
    },
    beforeDestroy () {
        destory()
    },
    methods: {
        submitted () {
            console.log('submitted')
            this.$emit('close')
        },
        close () {
            console.log('close')
            this.$emit('close')
        }
    },
    template: '<div id="manual-node-form"></div>'
}
