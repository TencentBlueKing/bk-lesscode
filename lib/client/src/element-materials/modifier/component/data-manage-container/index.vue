<template>
    <div v-if="show" class="data-manage-container-modifier">
        <prop-group :title="$t('数据源')">
            <section class="data-source">
                <span class="g-prop-sub-title g-mt8 g-mb6">{{ $t('数据表') }}</span>
                <bk-select
                    v-model="formId"
                    size="small"
                    :clearable="false"
                    :loading="loading"
                    @selected="handleSelectForm">
                    <bk-option v-for="item in formList" :key="item.id" :id="item.id" :name="item.formName" />
                </bk-select>
            </section>
        </prop-group>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import LC from '@/element-materials/core'
    import propGroup from '../form-container/components/prop-group.vue'

    export default {
        name: 'dataManageContainerProps',
        components: {
          propGroup
        },
        data () {
            return {
                show: false,
                formId: '',
                loading: false,
                formList: [],
                activeNode: null
            }
        },
        computed: {
            ...mapGetters('projectVersion', ['currentVersionId'])
        },
        watch: {
            value (val) {
                this.localVal = { ...val }
            }
        },
        created () {
            const activeNode = LC.getActiveNode()
            if (activeNode.type === 'widget-data-manage-container') {
                this.show = true
                this.formId = activeNode.renderProps?.formId?.code
                this.activeNode = activeNode
            }
            this.getFormList()
        },
        methods: {
            async getFormList () {
                this.loading = true
                const params = {
                    projectId: this.$route.params.projectId,
                    versionId: this.currentVersionId
                }
                this.formList = await this.$store.dispatch('nocode/form/getNewFormList', params)
                this.loading = false
            },
            handleSelectForm (val) {
                this.activeNode.setProp('formId', {
                    ...this.activeNode.renderProps.formId,
                    code: val,
                    renderValue: val
                })
                this.activeNode.setProp('buttons', {
                    ...this.activeNode.renderProps.buttons,
                    code: [],
                    renderValue: []
                })
                this.activeNode.setProp('tableRowActions', {
                    ...this.activeNode.renderProps.tableRowActions,
                    code: [],
                    renderValue: []
                })
                this.activeNode.setProp('filters', {
                    ...this.activeNode.renderProps.filters,
                    code: [],
                    renderValue: []
                })
                this.activeNode.setProp('tableColsExclude', {
                    ...this.activeNode.renderProps.tableColsExclude,
                    code: ['createUser', 'createTime', 'updateUser', 'updateTime'],
                    renderValue: ['createUser', 'createTime', 'updateUser', 'updateTime']
                })
            }
        }
    }
</script>
