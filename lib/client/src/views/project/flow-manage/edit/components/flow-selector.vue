<template>
    <div class="flow-selector-wrapper">
        <bk-select
            style="width: 340px;"
            ext-cls="flow-selector"
            ext-popover-cls="select-flow-dropdown"
            :value="flowConfig.id"
            :clearable="false"
            :searchable="true"
            :loading="listLoading"
            @selected="handleSelectFlow">
            <div class="selected-flow-trigger" slot="trigger">
                <i class="prefix-icon bk-drag-icon bk-drag-flow-fill"></i>
                <div class="name-wrapper">
                    <div class="flow-name" :title="flowConfig.flowName">{{ flowConfig.flowName }}</div>
                    <span v-if="flowConfig.deleteFlag" class="archive-tag">已归档</span>
                </div>
                <i class="bk-select-angle bk-icon icon-angle-down" />
            </div>
            <bk-option
                v-for="flow in list"
                :key="flow.id"
                :id="flow.id"
                :name="flow.flowName">
            </bk-option>
            <div slot="extension" class="create-flow-extension">
                <div
                    class="create-btn"
                    @click="isCreateDialogShow = true">
                    <i class="bk-icon icon-plus-circle" /> 新建流程
                </div>
            </div>
        </bk-select>
        <create-flow-dialog :show.sync="isCreateDialogShow"></create-flow-dialog>
    </div>
</template>
<script>
    import CreateFlowDialog from '../../create-flow-dialog.vue'

    export default {
        name: 'FlowSelector',
        components: {
            CreateFlowDialog
        },
        props: {
            list: {
                type: Array,
                default: () => []
            },
            listLoading: {
                type: Boolean,
                default: true
            },
            flowConfig: {
                type: Object,
                default () {
                    return {}
                }
            }
        },
        data () {
            return {
                isCreateDialogShow: false
            }
        },
        methods: {
            handleSelectFlow (val) {
                this.$bkInfo({
                    title: '确认离开?',
                    subTitle: '您将离开流程页面，请确认相应修改已保存',
                    confirmFn: async () => {
                        this.$router.push({
                            name: 'flowConfig',
                            params: {
                                projectId: this.$route.params.projectId,
                                flowId: val
                            }
                        })
                    }
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .flow-selector {
        background: #f5f7fa;
        border: none;
        border-radius: 2px;
        &:hover {
            background: #dedee5;
        }
        &.is-focus {
            box-shadow: none;
            background: #dedee5;
        }
    }
    .selected-flow-trigger {
        display: flex;
        align-items: center;
        margin: 0 24px 0 10px;
        height: 32px;
    }
    .prefix-icon {
        color: #979ba5;
        font-size: 12px;
    }
    .name-wrapper {
        display: flex;
        align-items: center;
        flex: 2;
        margin-left: 10px;
        font-size: 14px;
        color: #313238;
        
        .flow-name {
            max-width: 218px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    }
    .archive-tag {
        margin-left: 4px;
        padding: 0 10px;
        line-height: 22px;
        background: #feebea;
        border-radius: 2px;
        font-size: 12px;
        color: #ea3536;
    }
    .create-flow-extension {
        .create-btn {
            cursor: pointer;
            &:hover {
                color: #3a84ff;
            }
        }
    }
</style>
