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
            <bk-form-item :label="$t('form_流程名称')" property="name" :required="true">
                <bk-input v-model="flowData.name" />
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
    import { GET_INITIALIZE_FLOW_TPL_STRUCTURE } from 'shared/flow'

    export default {
        name: 'CreateFlowDialog',
        props: {
            show: Boolean
        },
        data () {
            return {
                flowData: {
                    name: '',
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
                    const { nodes, edges } = GET_INITIALIZE_FLOW_TPL_STRUCTURE()
                    try {
                        const { name, summary } = this.flowData
                        const params = {
                            name,
                            summary,
                            nodes: JSON.stringify(nodes),
                            edges: JSON.stringify(edges),
                            projectId: this.projectId
                        }
                        const res = await this.$store.dispatch('flow/tpl/createFlowTpl', params)
                        this.handleClose()
                        this.$router.push({
                            name: 'flowTplCanvas',
                            params: {
                                projectId: this.projectId,
                                tplId: res.id
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
                    name: '',
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
