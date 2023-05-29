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
                const compiled = Vue.compile(this.html)
                this.templateRender = compiled.render
                this.$options.staticRenderFns = []
                for (const staticRenderFunction of compiled.staticRenderFns) {
                    this.$options.staticRenderFns.push(staticRenderFunction)
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
</script>
