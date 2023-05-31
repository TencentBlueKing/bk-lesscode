<template>
    <div class="processors-form">
        <bk-form
            ref="form"
            :class="['form-container', { 'half-row-form': !hideProcessorsForm }]"
            :model="formData"
            :rules="rules">
            <bk-form-item class="type-form-item" property="type">
                <bk-select
                    v-model="formData.type"
                    :clearable="false"
                    :loading="roleGroupListLoading"
                    :disabled="roleGroupListLoading"
                    @selected="handleSelectGroup">
                    <bk-option v-for="item in groupTypeList" :key="item.type" :id="item.type" :name="item.name"></bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item v-if="!hideProcessorsForm" class="role-form-item" property="processors">
                <!-- 人员选择 -->
                <member-select
                    v-if="formData.type === 'PERSON'"
                    v-model="formData.processors"
                    :specify-id-list="specifyRuleList"
                    :disabled="!editable"
                    @change="handleSelectProcessor">
                </member-select>
                <!-- <member-selector
                    v-if="formData.type === 'PERSON'"
                    v-model="formData.processors"
                    style="width: 100%;"
                    :user-list.sync="userList"
                    @choose="handleSelectProcessor">
                </member-selector> -->
                <!-- 组织架构 -->
                <bk-select
                    v-if="formData.type === 'ORGANIZATION'"
                    :clearable="false"
                    :disabled="!editable"
                    @toggle="orgSelectOpen = !orgSelectOpen">
                    <div :class="['org-selector-trigger', { unselected: formData.processors === '' }]" slot="trigger">
                        {{ formData.processors ? getOrganizationsPath(Number(formData.processors), organizationList) : $t('请选择') }}
                        <i :class="['select-angle-icon', 'bk-icon', 'icon-angle-down', { open: orgSelectOpen }]"></i>
                    </div>
                    <bk-big-tree
                        :data="organizationList"
                        :selectable="true"
                        :default-selected-node="formData.processors !== '' ? Number(formData.processors) : ''"
                        @node-click="handleSelectOrgan">
                    </bk-big-tree>
                </bk-select>
                <!-- 角色用户 -->
                <bk-select
                    v-if="['GENERAL', 'CMDB', 'IAM', 'API', 'ASSIGN_LEADER', 'VARIABLE'].includes(formData.type)"
                    v-model="formData.processors"
                    :key="formData.type"
                    :searchable="true"
                    :clearable="false"
                    :loading="roleListLoading"
                    :disabled="roleListLoading || !editable"
                    :multiple="formData.type !== 'ASSIGN_LEADER'"
                    @change="handleSelectProcessor">
                    <bk-option v-for="option in roleList" :key="option.id" :id="option.id" :name="option.name"> </bk-option>
                </bk-select>
            </bk-form-item>
        </bk-form>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import MemberSelect from '@/components/flow-form-comp/form/components/memberSelect.vue'
    import { PROCESSORS } from '../../constants/processor.js'
    // import memberSelector from '@/components/member-selector'

    export default {
        name: 'Processors',
        components: {
            MemberSelect
            // memberSelector
        },
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            workflowId: Number,
            nodeId: Number,
            specifyIds: {
                type: Array,
                default: () => []
            },
            excludeType: {
                type: Array,
                default: () => []
            },
            value: {
                type: Object,
                default () {
                    return {
                        type: '',
                        processors: ''
                    }
                }
            },
            editable: {
                type: Boolean,
                default: true
            }
        },
        data () {
            const { type, processors } = this.value
            return {
                roleGroupListLoading: false,
                roleGroupList: [],
                roleListLoading: false,
                roleList: [],
                organizationsLoading: false,
                organizationList: [], // 组织架构
                userList: [],
                memberFieldListLoading: false,
                preNodeListLoading: false,
                formData: {
                    type,
                    processors: this.transProcessorsToComp(type, processors)
                },
                orgSelectOpen: false,
                rules: {
                    type: [
                        {
                            required: true,
                            message: window.i18n.t('必填项'),
                            trigger: 'blur'
                        }
                    ],
                    processors: [
                        {
                            required: true,
                            message: window.i18n.t('必填项'),
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        computed: {
            groupTypeList () {
                return this.roleGroupList.filter(item => !this.excludeType.includes(item.type))
            },
            hideProcessorsForm () {
                return ['', 'EMPTY', 'OPEN', 'STARTER', 'BY_ASSIGNOR', 'STARTER_LEADER'].includes(this.formData.type)
            },
            specifyRuleList () {
                const target = this.specifyIds.find(rule => rule.type === this.formData.type)
                return target ? target.list : []
            }
        },
        watch: {
            value (val, oldVal) {
                const { type, processors } = val
                this.formData = {
                    type,
                    processors: this.transProcessorsToComp(type, processors)
                }
                if (val.type !== oldVal.type && val.type) {
                    this.getProcessorList()
                }
            }
        },
        mounted () {
            this.getRoleGroupList()
            if (!this.hideProcessorsForm && this.value.type) {
                this.getProcessorList()
            }
        },
        methods: {
            // 获取第一级角色分组列表
            async getRoleGroupList () {
                try {
                    this.roleGroupListLoading = true
                    const res = await this.$store.dispatch('nocode/flow/getRoleGroups', {
                        is_processor: true,
                        project_key: 'lesscode'
                    })
                    this.roleGroupList = res.map(item => {
                        item.name = PROCESSORS[item.type] || item.name
                        return item
                    })
                } catch (e) {
                    console.error(e)
                } finally {
                    this.roleGroupListLoading = false
                }
            },
            // 获取第二级处理人列表
            async getRoleList () {
                try {
                    this.roleListLoading = true
                    if (this.formData.type === 'ASSIGN_LEADER') {
                        this.getPreNodes()
                    } else if (this.formData.type === 'VARIABLE') {
                        this.getNodeVars()
                    }
                } catch (e) {
                    console.error(e)
                } finally {
                    this.roleListLoading = false
                }
            },
            // 获取组织架构数据
            async getOrganizations () {
                try {
                    this.organizationsLoading = true
                    this.organizationList = await this.$store.dispatch('nocode/flow/getOrganizations')
                } catch (e) {
                    console.error(e)
                } finally {
                    this.organizationsLoading = false
                }
            },
            // 获取节点中人员类型的字段
            async getNodeVars () {
                try {
                    this.memberFieldListLoading = true
                    const params = {
                        workflow: this.workflowId,
                        state: this.nodeId,
                        exclude_self: true
                    }
                    const res = await this.$store.dispatch('nocode/flow/getNodeVars', params)
                    this.roleList = res
                        .filter(item => ['MEMBERS', 'MEMBER'].includes(item.type))
                        .map(item => ({ id: item.key, name: item.name }))
                } catch (e) {
                    console.error(e)
                } finally {
                    this.memberFieldListLoading = false
                }
            },
            // 获取前置节点列表
            async getPreNodes () {
                try {
                    this.preNodeListLoading = true
                    const res = await this.$store.dispatch('nocode/flow/getPreNodes', this.nodeId)
                    this.roleList = res.filter(node => !['ROUTER-P', 'COVERAGE'].includes(node.type))
                } catch (e) {
                    console.error(e)
                } finally {
                    this.preNodeListLoading = false
                }
            },
            getProcessorList () {
                if (this.formData.type === 'ORGANIZATION') {
                    this.getOrganizations()
                } else {
                    this.getRoleList()
                }
            },
            // 按照英文逗号拆开字符串数据，给对应组件
            transProcessorsToComp (type, processors) {
                if (['ORGANIZATION', 'ASSIGN_LEADER'].includes(type)) {
                    return cloneDeep(processors)
                }
                return processors ? processors.split(',') : []
            },
            // 将对应组件返回的数组数据拼接为字符串
            transCompValToProcessors (type, processors) {
                if (['ORGANIZATION', 'ASSIGN_LEADER'].includes(type)) {
                    return processors
                }
                return processors.join(',')
            },
            handleSelectGroup (val) {
                this.formData = {
                    type: val,
                    processors: ['ORGANIZATION', 'ASSIGN_LEADER'].includes(val) ? '' : []
                }
                this.change()
            },
            // 选择人员
            handleSelectProcessor () {
                this.change()
            },
            // 选择组织架构
            handleSelectOrgan (node) {
                this.formData.processors = node.id
                this.change()
            },
            // 获取组织架构完整路径
            getOrganizationsPath (id, list) {
                let pathStr = ''
                list.some((item) => {
                    if (item.id === id) {
                        pathStr = item.name
                        return true
                    }
                    if (item.children && item.children.length > 0) {
                        const subPath = this.getOrganizationsPath(id, item.children)
                        if (subPath) {
                            pathStr = `${item.name}/${subPath}`
                            return true
                        }
                    }
                })
                return pathStr
            },
            validate () {
                return this.$refs.form.validate()
            },
            change () {
                const { type, processors } = this.formData
                const data = {
                    type,
                    processors: this.transCompValToProcessors(type, processors)
                }
                this.$emit('change', data)
            }
        }
    }
</script>
<style lang="postcss" scoped>
.processors-form {
    .form-container {
    &.half-row-form {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .type-form-item {
        width: calc(50% - 4px);
        margin-right: 8px;
        }
        .role-form-item {
        margin-top: 0;
        width: calc(50% - 4px);
        height: 32px;
        }
    }
    .org-selector-trigger {
        position: relative;
        padding: 0 36px 0 10px;
        width: 100%;
        height: 30px;
        line-height: 30px;
        font-size: 12px;
        &.unselected {
        color: #c3cdd7;
        }
        .select-angle-icon {
        position: absolute;
        right: 2px;
        top: 4px;
        color: #979ba5;
        font-size: 22px;
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        pointer-events: none;
        &.open {
            transform: rotate(-180deg);
        }
        }
    }
    }
    /deep/ .bk-big-tree-node .node-content {
    font-size: 12px;
    }
}
</style>
