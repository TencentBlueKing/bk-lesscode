<template>
    <div v-if="show" class="data-manage-container-modifier">
        <prop-group :title="$t('数据源')">
            <section class="data-source">
                <span class="g-prop-sub-title g-mt8 g-mb6">{{ labelName }}</span>
                <bk-select
                    v-if="type === 'data-manage'"
                    v-model="formId"
                    size="small"
                    :clearable="false"
                    :loading="loading"
                    @selected="handleDataManageSelectForm">
                    <bk-option v-for="item in formList" :key="item.id" :id="item.id" :name="item.tableName">
                        <div class="table-option">
                            <span class="name-text">{{ item.tableName }}</span>
                            <i class="bk-drag-icon bk-drag-jump-link" @click.stop="goToDataSource(item.tableName)" />
                        </div>
                    </bk-option>
                </bk-select>
                <bk-select
                    v-else
                    v-model="formId"
                    size="small"
                    :clearable="false"
                    :loading="loading"
                    @selected="handleFlowManageSelectForm">
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
            ...mapGetters('projectVersion', ['currentVersionId']),
            type () {
                return this.activeNode?.type === 'widget-data-manage-container' ? 'data-manage' : 'flow-manage'
            },
            labelName () {
                return this.type === 'data-manage' ? this.$t('数据表') : this.$t('form_关联流程')
            }
        },
        watch: {
            value (val) {
                this.localVal = { ...val }
            }
        },
        created () {
            const activeNode = LC.getActiveNode()
            if (['widget-data-manage-container', 'widget-flow-manage-container'].includes(activeNode.type)) {
                this.show = true
                this.formId = activeNode.type === 'widget-data-manage-container'
                    ? activeNode.renderProps?.formId?.code
                    : activeNode.renderProps?.id?.code
                this.activeNode = activeNode
            }
            this.getFormList()
        },
        methods: {
            async getFormList () {
                this.loading = true

                const params = this.type === 'data-manage' ? {
                    projectId: this.$route.params.projectId,
                    versionId: this.currentVersionId
                } : {
                    projectId: this.$route.params.projectId
                }

                const action = this.type === 'data-manage' ? 'nocode/form/getNewFormList' : 'flow/tpl/getTplList'
                
                const res = await this.$store.dispatch(action, params)

                this.formList = this.type === 'data-manage' ? res : res.list.map(item => ({
                    ...item,
                    formName: item.name
                }))
                this.loading = false
            },
            handleDataManageSelectForm (val) {
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
            },
            handleFlowManageSelectForm (val) {
                this.activeNode.setProp('id', {
                    ...this.activeNode.renderProps.id,
                    code: val,
                    renderValue: val
                })
            },
            goToDataSource (tableName) {
                const { href } = this.$router.resolve({ name: 'dataManage', query: { tableName } })
                window.open(href, '_blank')
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .table-option {
        position: relative;
        padding-right: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        &:hover {
            i {
                display: inline-block;
            }
        }
        i {
            display: none;
            position: absolute;
            top: 12px;
            right: 0;
            font-size: 12px;
        }
    }
</style>
