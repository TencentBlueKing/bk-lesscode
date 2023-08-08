import { transformHtmlToRender, framework } from 'bk-lesscode-render'

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
            const html = this.html.replace(/@([\w-]+)='((?:\w+)\(.+\))'/g, (a, b, c) => {
                return `@${b}="${c}"`
            })
            const compiled = transformHtmlToRender(`<span>${html}</span>`)
            if (framework === 'vue2') {
                this.templateRender = compiled.render
                this.$options.staticRenderFns = []
                for (const staticRenderFunction of compiled.staticRenderFns) {
                    this.$options.staticRenderFns.push(staticRenderFunction)
                }
            } else {
                this.templateRender = compiled
            }
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
