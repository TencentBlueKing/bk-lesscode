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
            schemaUrl () {
                return this.$route.query?.schemaUrl
            },
            host () {
                return this.$route.query?.host
            }
        },
        async mounted() {
            this.apiJson = await this.$store.dispatch('saasBackend/getSaasApiDoc', {
                schemaUrl: this.schemaUrl
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
                    requestInterceptor: (request) => {
                        request.url = request.url?.replace(location.host, this.host);
                        return request;
                    },
                    deepLinking: true
                })
            }
        }
    }
</script>
