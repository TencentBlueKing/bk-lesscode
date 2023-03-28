<template>
    <section class="debug-api-wrapper">
        <bk-button class="trigger-btn" size="small" :loading="debugCalling" @click="callDebugFunction">{{ $t('调试API') }}</bk-button>
        <bk-dialog
            v-model="dialogShow"
            width="700"
            header-position="left"
            :title="$t('请求响应示例')"
            :ok-text="$t('提取响应字段')"
            :cancel-text="$t('关闭')"
            :auto-close="false"
            :quick-close="false"
            @confirm="handleExtractFields"
            @cancel="response = ''">
            <div class="dialog-content">
                <monaco read-only height="300" :value="response"></monaco>
            </div>
        </bk-dialog>
    </section>
</template>
<script>
    import { mapState } from 'vuex'
    import monaco from '@/components/monaco.vue'
    import { parseValue2Scheme } from 'shared/api'

    export default {
        name: 'DebugApi',
        components: {
            monaco
        },
        data () {
            return {
                dialogShow: false,
                debugCalling: false,
                response: ''
            }
        },
        computed: {
            ...mapState('nocode/nodeConfig', ['nodeData'])
        },
        methods: {
            async callDebugFunction () {
                const { url, method, headers, query_params, body } = this.nodeData.extras.webhook_info
                const apiInfo = this.nodeData.extras.api_info || {}
                const apiType = apiInfo.selectedApi?.[0].id || 'lesscode-api'
                if (!url) {
                    this.$bkMessage({
                        theme: 'error',
                        message: this.$t('请填写请求地址')
                    })
                    return
                }
                this.debugCalling = true
                try {
                    const data = {
                        url: url.replace('{{appApigwPrefix}}', BK_APP_APIGW_PREFIX),
                        method: method.toLowerCase(),
                        headers: {},
                        query_params: {},
                        body: {}
                    }
                    // 旧数据query_params的数据类型为Object，不做处理 @2022.11.10
                    if (Array.isArray(query_params)) {
                        query_params.forEach(item => {
                            const { key, value } = item
                            data.query_params[key] = value
                        })
                    }
                    if (headers.length > 0) {
                        headers.forEach(item => {
                            if (item.key) {
                                data.headers[item.key] = item.value
                            }
                        })
                    }
                    if (body.content) {
                        const bodyContent = JSON.parse(body.content)
                        Object.keys(bodyContent).forEach(key => {
                            const val = bodyContent[key]
                            data.body[key] = (apiType === 'datasource-api' && key === 'creatorUsername') ? this.$store.state.user.username : val
                        })
                    }
                    const response = await this.$store.dispatch('nocode/flow/debugFlowApi', data)
                    if (response.errcode) {
                        const errMessage = response.errmsg || this.$t('调试API请求失败，请记录请求参数联系管理员')
                        this.$bkMessage({
                            theme: 'error',
                            message: errMessage
                        })
                        return
                    }
                    this.response = JSON.stringify(response, null, 4)
                    this.dialogShow = true
                } catch (e) {
                    console.error(e)
                } finally {
                    this.debugCalling = false
                }
            },
            handleExtractFields () {
                const processedData = this.responseDataProcessing(JSON.parse(this.response))
                const responseScheme = parseValue2Scheme(processedData)
                this.$emit('extractScheme', responseScheme)
                this.dialogShow = false
            },
            // 处理返回的响应数据，数组存在多条数据时，只取第一条
            responseDataProcessing (response) {
                let result = response
                const type = Object.prototype.toString.apply(response)
                if (type === '[object Object]') {
                    result = {}
                    Object.keys(response).forEach((key) => {
                        result[key] = this.responseDataProcessing(response[key])
                    })
                }
                if (type === '[object Array]') {
                    result = [this.responseDataProcessing(response[0])]
                }
                return result
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .debug-api-wrapper {
        margin: 10px 0;
    }
</style>
