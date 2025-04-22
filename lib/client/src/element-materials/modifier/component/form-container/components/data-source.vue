<template>
    <prop-group :title="$t('表单数据')">
        <div class="data-source-setting">
            <section>
                <span
                    v-bk-tooltips="{
                        width: 400,
                        allowHtml: true,
                        content: `${$t('表单点击提交按钮后的后续行为。')}<br/>
                        ${$t('数据存储：将表单填写的数据存入数据表；')}<br/>
                        ${$t('流程提单：执行流程并将表单数据注入执行的上下文中。可选择的流程需要满足第一个节点为人工节点，且已配置表单。')}`
                    }"
                    class="g-prop-sub-title subline g-mt8 g-mb6">{{ $t('表单行为') }}</span>
                <div class="bk-button-group">
                    <bk-button
                        v-for="action in ACTION_LIST"
                        :key="action.value"
                        :class="['type-btn-item', { 'is-selected': localVal.action === action.value }]"
                        @click="handleActionChange(action.value)">
                        <span class="btn-text">{{ action.label }}</span>
                    </bk-button>
                    <bk-select
                        v-if="localVal.action === 'executeFlow'"
                        :value="localVal.flowTplId"
                        style="margin-top: 10px;"
                        :clearable="false"
                        :placeholder="$t('请选择流程')"
                        @selected="handleSelectFlowTpl">
                        <bk-option v-for="tpl in flowTplList" :key="tpl.id" :id="tpl.id" :name="tpl.name" />
                    </bk-select>
                </div>
            </section>
            <section class="bk-button-group">
                <span class="g-prop-sub-title g-mt8 g-mb6">{{ $t('数据源') }}</span>
                <div>
                    <bk-button
                        :class="['type-btn-item', { 'is-selected': localVal.type === 'NEW_FORM', 'is-disabled': localVal.action === 'executeFlow' }]"
                        @click="handleTypeChange('NEW_FORM')">
                        <span class="btn-text">{{ $t('新建表') }}</span>
                    </bk-button>
                    <bk-popconfirm
                        :title="$t('确认切换成复用？')"
                        :content="$t('切换后将会替换掉表单容器后的所有内容，且不支持更改，请谨慎操作！')"
                        width="288"
                        trigger="click"
                        placement="bottom-end"
                        class="type-btn-item"
                        :disabled="localVal.type === 'USE_FORM'"
                        @confirm="handleReuseconfirm">
                        <bk-button
                            :class="{ 'is-selected': localVal.type === 'USE_FORM' }"
                            @click="handleTypeChange('USE_FORM')">
                            <span v-bk-tooltips.top="$t('可以通过“复用已有的表” 进行表单渲染以及数据存储')" class="btn-text subline">{{ $t('复用已有表') }}</span>
                        </bk-button>
                    </bk-popconfirm>
                </div>
            </section>
            <section v-if="localVal.type === 'NEW_FORM'">
                <span
                    v-bk-tooltips.top="$t('仅引用已有表进行表单渲染，可任意更改，不会影响原表数据')"
                    class="g-prop-sub-title subline g-mt8 g-mb6">
                    {{ $t('引用已有表') }}
                </span>
                <bk-select
                    :value="localVal.relatedId"
                    :loading="formListLoading"
                    :clearable="false"
                    @toggle="handleSelectOpen"
                    @selected="handleSeletedRelatedForm">
                    <bk-option
                        v-for="item in formList"
                        :key="item.id"
                        :id="item.id"
                        :name="item.tableName">
                        <div class="table-option-item">
                            <span class="table-name">{{ item.tableName }}</span>
                            <i class="bk-drag-icon bk-drag-jump-link link-icon" @click.stop="handleJumpToDataSource(item.tableName)" />
                        </div>
                    </bk-option>
                </bk-select>
                <span
                    v-bk-tooltips.top="$t('表名保存后无法修改，请谨慎填写')"
                    class="g-prop-sub-title subline g-mt8 g-mb6">
                    {{ $t('表名') }}
                </span>
                <bk-input
                    v-model="localVal.tableName"
                    :placeholder="$t('请输入表名，不填则使用默认表名')"
                    :disabled="localVal.id !== ''"
                    @change="handleTableNameChange" />
            </section>
            <section v-else>
                <span class="g-prop-sub-title g-mt8 g-mb6">{{ $t('复用数据表') }}</span>
                <bk-select
                    :value="localVal.relatedId"
                    size="small"
                    :loading="formListLoading"
                    :clearable="false"
                    :disabled="localVal.action === 'executeFlow'"
                    @toggle="handleSelectOpen"
                    @selected="handleSeletedRelatedForm">
                    <bk-option
                        v-for="item in formList"
                        :key="item.id"
                        :id="item.id"
                        :name="item.tableName">
                        <div class="table-option-item">
                            <span class="table-name">{{ item.tableName }}</span>
                            <i class="bk-drag-icon bk-drag-jump-link link-icon" @click.stop="handleJumpToDataSource(item.tableName)" />
                        </div>
                    </bk-option>
                </bk-select>
            </section>
        </div>
    </prop-group>
</template>
<script>
    import { mapGetters } from 'vuex'
    import propGroup from './prop-group.vue'

    export default {
        name: '',
        components: {
            propGroup
        },
        props: {
            activeNode: {
                type: Object,
                default: () => {}
            },
            value: {
                type: Object,
                default: () => {
                    return {
                        type: 'NEW_FORM',
                        relatedId: 0,
                        id: 0
                    }
                }
            }
        },
        data () {
            return {
                ACTION_LIST: [
                    { label: window.i18n.t('数据存储'), value: 'submitData', desc: '' },
                    { label: window.i18n.t('流程提单'), value: 'executeFlow', desc: '' }
                ],
                localVal: { ...this.value },
                formListLoading: false,
                formList: [],
                flowTplListLoading: false,
                flowTplList: []
            }
        },
        computed: {
            ...mapGetters('projectVersion', ['currentVersionId']),
            ...mapGetters('page', ['pageDetail'])
        },
        watch: {
            value (val) {
                this.localVal = { ...val }
            }
        },
        created () {
            this.localVal = { action: 'submitData', flowTplId: '', nodeId: '', ...this.value }
        },
        mounted () {
            this.getFormList()
            this.getFlowTplList()
        },
        methods: {
            async getFormList () {
                this.formListLoading = true
                const params = {
                    projectId: this.$route.params.projectId,
                    versionId: this.currentVersionId
                }
                const res = await this.$store.dispatch('nocode/form/getNewFormList', params)
                this.formList = res
                this.formListLoading = false
            },
            async getFlowTplList () {
                this.flowTplListLoading = true
                const res = await this.$store.dispatch('flow/tpl/getTplList', { projectId: this.$route.params.projectId })
                this.flowTplList = res.list.filter(tpl => {
                    const node = this.getFlowTplFirstTaskNode(tpl)
                    // 第一个任务节点为人工节点类型，且配置了表单
                    return node && node.type === 'Manual' && node.config.formType
                })
                this.flowTplListLoading = false
            },
            getFlowTplFirstTaskNode (tpl) {
                const nodes = JSON.parse(tpl.nodes || '[]')
                const edges = JSON.parse(tpl.edges || '[]')
                const startNode = nodes.find(node => node.type === 'Start')
                const firstEdge = edges.find(edge => edge.source.cell === startNode.id)
                if (firstEdge && firstEdge.target.cell) {
                    const targetNode = nodes.find(node => node.id === firstEdge.target.cell)
                    if (targetNode) return targetNode
                }
                return null
            },
            handleActionChange (val) {
                this.localVal.action = val
                if (val === 'executeFlow') {
                    this.localVal.type = 'USE_FORM'
                }
                this.localVal.flowTplId = ''
                this.localVal.nodeId = ''
                this.localVal.relatedId = ''
                this.$emit('updateFields', [])
                this.change()
            },
            handleSelectFlowTpl (val) {
                const flowTpl = this.flowTplList.find(tpl => tpl.id === val)
                if (flowTpl) {
                    const node = this.getFlowTplFirstTaskNode(flowTpl)
                    if (node && node.type === 'Manual') {
                        const { formId, formType, relatedId } = node.config
                        this.localVal.flowTplId = flowTpl.id
                        this.localVal.nodeId = node.id
                        const nodeFormId = formType === 'USE_FORM' ? relatedId : formId
                        this.handleSeletedRelatedForm(nodeFormId)
                    }
                }
            },
            handleTypeChange (val) {
                if ((val === 'NEW_FORM' && this.localVal.action === 'executeFlow') || this.localVal.type === val || val === 'USE_FORM') {
                    return
                }
                this.localVal.type = val
                this.localVal.relatedId = ''
                this.$emit('updateFields', [])
                this.change()
            },
            handleReuseconfirm () {
                this.localVal.type = 'USE_FORM'
                this.localVal.relatedId = ''
                this.$emit('updateFields', [])
                this.change()
            },
            handleTableNameChange (val) {
                this.localVal.tableName = val
                this.change()
            },
            handleSelectOpen (val) {
                if (val) {
                    this.getFormList()
                }
            },
            handleSeletedRelatedForm (val) {
                this.localVal.relatedId = val
                const fields = JSON.parse(this.formList.find(item => item.id === val).content)
                this.$emit('updateFields', fields)
                this.change()
            },
            handleJumpToDataSource (tableName) {
                const { href } = this.$router.resolve({ name: 'dataManage', query: { tableName } })
                window.open(href, '_blank')
            },
            change () {
                this.$emit('change', { ...this.localVal })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .bk-button-group {
        width: 100%;
        .type-btn-item {
            width: 50%;
        }
        .btn-text {
            font-size: 12px;
        }
        >>> .bk-tooltip-ref {
            width: 100%;
            .bk-button {
                width: 100%;
            }
        }
        >>> .bk-button {
            &.is-selected {
                background: #ffffff;
                .subline {
                    border-color: #3a84ff;
                }
            }
        }
    }
    .subline {
        border-bottom: 1px dashed #63656e;
        cursor: pointer;
    }
    .table-option-item {
        position: relative;
        padding-right: 14px;
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;
        &:hover {
            .link-icon {
                display: inline-block;
            }
        }
        .link-icon {
            display: none;
            position: absolute;
            top: 12px;
            right: 0;
            font-size: 12px;
            cursor: pointer;
        }
    }
</style>
