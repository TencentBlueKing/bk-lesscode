<template>
    <div class="actions-wrapper">
        <bk-button
            theme="primary"
            :loading="savePending"
            :disabled="loading"
            @click="handleSaveClick">
            保存
        </bk-button>
        <bk-button
            v-if="nodeData.is_first_state && nodeData.type === 'NORMAL'"
            theme="primary"
            :loading="savePending"
            :disabled="loading"
            @click="handleSaveClick">
            保存并生成提单页
        </bk-button>
        <bk-button @click="$emit('close')" style="margin-left: 8px">取消</bk-button>
    </div>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'

    export default {
        name: 'NodeActions',
        props: {
            loading: Boolean,
            flowConfig: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                savePending: false
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig']),
            projectId () {
                return this.$route.params.projectId
            }
        },
        methods: {
            async handleSaveClick () {
                const data = cloneDeep(this.nodeData)
                // 流程服务校验desc字段不为空，节点上没有可配置desc的地方，故先删除
                delete data.desc

                if (data.type === 'NORMAL') {
                    const params = {
                        id: this.flowConfig.id,
                        nodeId: data.id,
                        projectId: this.projectId,
                        versionId: this.versionId,
                        formData: this.formConfig
                    }
                    this.savePending = true
                    await this.$store.dispatch('nocode/flow/editFlowNode', params)
                    await this.$store.dispatch('nocode/flow/updateNode', data)
                    this.$bkMessage({
                        message: '节点保存成功',
                        theme: 'success'
                    })
                    this.$emit('save')
                }
            }
        }
    }
</script>
