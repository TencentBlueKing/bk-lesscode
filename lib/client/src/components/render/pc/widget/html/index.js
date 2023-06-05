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
        },
        parentId: {
            type: Number
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
            const compiled = transformHtmlToRender(`<span>${this.html}</span>`)
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
            if (this.renderOptions?.methodCode?.length > 0) {
                let parent = this.$parent
                while (parent && parent._uid !== this.parentId) {
                    parent = parent.$parent
                }
                if (parent) {
                    const userKeys = Object.keys(parent).filter((key) => /^[^_$]/.test(key)) || []
                    userKeys.forEach((userKey) => {
                        this[userKey] = parent[userKey]
                    })
                }
            }
        }
    },

    render () {
        return this.templateRender()
    }
}
