<script>
    import Vue from 'vue'

    export default {
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
                const compiled = Vue.compile(`<span>${this.html}</span>`)
                this.templateRender = compiled.render
                this.$options.staticRenderFns = []
                for (const staticRenderFunction of compiled.staticRenderFns) {
                    this.$options.staticRenderFns.push(staticRenderFunction)
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
            return this.templateRender()
        }
    }
</script>
