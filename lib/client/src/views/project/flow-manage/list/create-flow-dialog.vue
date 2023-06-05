<template>
    <bk-dialog
        :title="$t('新建流程')"
        header-position="left"
        ext-cls="create-flow-dialog"
        :value="show"
        :width="480"
        :mask-close="false"
        :auto-close="false"
        @cancel="handleClose">
        <bk-form
            ref="createForm"
            form-type="vertical"
            :model="flowData"
            :rules="rules">
            <bk-form-item :label="$t('form_流程名称')" property="flowName" :required="true">
                <bk-input v-model="flowData.flowName" />
            </bk-form-item>
            <bk-form-item :label="$t('form_流程描述')" property="desc">
                <bk-input v-model="flowData.summary" type="textarea" :row="4" />
            </bk-form-item>
        </bk-form>
        <div class="dialog-footer" slot="footer">
            <bk-button theme="primary" :loading="createPending" @click="handleConfirm">{{ $t('确认') }}</bk-button>
            <bk-button :disabled="createPending" @click="handleClose">{{ $t('取消') }}</bk-button>
        </div>
    </bk-dialog>
</template>
<script>
    import { INIT_FLOW_STRUCTURE } from 'shared/no-code'

    export default {
        name: 'CreateFlowDialog',
        props: {
            show: Boolean
        },
        data () {
            return {
                flowData: {
                    flowName: '',
                    summary: ''
                },
                rules: {
                    name: [{
                        required: true,
                        trigger: 'blur',
                        message: window.i18n.t('必填项')
                    }]
                },
                createPending: false
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            }
        },
        methods: {
            handleConfirm () {
                this.$refs.createForm.validate().then(async () => {
                    this.createPending = true
                    try {
                        const { flowName, summary } = this.flowData
                        const params = {
                            flowName,
                            summary,
                            projectId: this.projectId,
                            meta: Object.assign({}, INIT_FLOW_STRUCTURE(), { name: flowName })
                        }
                        const res = await this.$store.dispatch('nocode/flow/createFlow', params)
                        this.handleClose()
                        this.$router.push({
                            name: 'flowConfig',
                            params: {
                                projectId: this.projectId,
                                flowId: res.id
                            }
                        })
                    } catch (e) {
                        console.error(e)
                    } finally {
                        this.createPending = false
                    }
                })
            },
            handleClose () {
                this.flowData = {
                    flowName: '',
                    summary: ''
                }
                this.$refs.createForm.clearError()
                this.$emit('update:show', false)
            }
        }
    }
</script>
<style lang="postcss">
    .create-flow-dialog {
        .bk-dialog-header {
            padding-bottom: 10px;
        }
    }
</style>
