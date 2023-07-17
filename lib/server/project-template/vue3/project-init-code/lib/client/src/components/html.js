import { compile } from '@vue/compiler-dom'
import * as vue from 'vue'

export default {
    name: 'render-html',
    props: {
        html: {
            type: String,
            default: ''
        },
        renderOptions: {
            type: Object,
            default: () => ({})
        },
        props: {
            type: Object,
            default: () => ({})
        }
    },

    data () {
        return {
            templateRender: undefined
        }
    },

    watch: {
        html: {
            handler () {
                this.updateRender()
            },
            immediate: true
        },
        'renderOptions.methodCode': {
            handler () {
                this.updateMethods()
            },
            immediate: true
        }
    },

    methods: {
        updateRender () {
            const Fn = Function
            const compiled = Fn('Vue', compile((`<span>${this.html}</span>`)).code)(vue)
            this.templateRender = compiled
        },

        updateMethods () {
            let parent = this.$parent
            this.renderOptions?.methodCode?.forEach((code) => {
                while (parent && !parent[code]) {
                    parent = parent.$parent
                }
                if (parent) {
                    this[code] = parent[code]
                }
            })
        }
    },

    render () {
        return this.templateRender(this)
    }
}
