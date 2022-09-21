<template>
    <section class="debug-api-wrapper">
        <bk-button class="trigger-btn" size="small" :loading="debugCalling" @click="callDebugFunction">调试API</bk-button>
        <bk-dialog
            v-model="dialogShow"
            width="700"
            header-position="left"
            title="请求响应示例"
            ok-text="提取响应字段"
            cancel-text="关闭"
            :auto-close="false"
            :quick-close="false"
            @confirm="handleExtractFields"
            @cancel="response = ''">
            <div class="dialog-content">
                <monaco read-only height="300" value=""></monaco>
            </div>
        </bk-dialog>
    </section>
</template>
<script>
    import { mapState } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import monaco from '@/components/monaco.vue'

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
                this.debugCalling = true
                try {
                    const data = cloneDeep(this.nodeData.extras.webhook_info)
                    data.url = data.url.replace('{{appApigwPrefix}}', BK_APP_APIGW_PREFIX)
                    if (data.body.content) {
                        data.body.content.replace('{{creatorUsername}}', this.$store.state.user.username)
                    }
                    const response = await this.$store.dispatch('nocode/flow/debugFlowApi', data)
                    this.response = JSON.stringify(response)
                    this.dialogShow = true
                } catch (e) {
                    console.error(e)
                } finally {
                    this.debugCalling = false
                }
            },
            handleExtractFields () {}
        }
    }
</script>
<style lang="postcss" scoped>
    .debug-api-wrapper {
        margin: 10px 0;
    }
</style>
