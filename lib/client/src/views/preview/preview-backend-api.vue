<template>
    <div class="swagger-area-wrapper">
        <div id="preview-swagger-ui"></div>
    </div>
</template>

<script>
    import './swagger-ui.css';
    import SwaggerUIBundle from 'swagger-ui-dist/swagger-ui-bundle.js';
    import SwaggerUIStandalonePreset from 'swagger-ui-dist/swagger-ui-standalone-preset.js';

    export default {
        name: 'SwaggerUI',
        data () {
            return {
                apiJson: {}
            }
        },
        computed: {
            appName () {
                return this.$route.query?.appName
            }
        },
        async mounted() {
            this.apiJson = await this.$store.dispatch('saasBackend/getSaasApiDoc', {
                appName: this.appName
            })
            this.loadSwaggerUI()
        },
        methods: {
            loadSwaggerUI() {
                SwaggerUIBundle({
                    dom_id: '#preview-swagger-ui',
                    presets: [
                        SwaggerUIBundle.presets.apis,
                        SwaggerUIStandalonePreset
                    ],
                    layout: "StandaloneLayout",
                    spec: this.apiJson,
                    deepLinking: true
                })
            }
        }
    }
</script>
