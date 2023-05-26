<template>
    <div class="flow-data">
        <bk-tab type="unborder-card" :active.sync="active">
            <bk-tab-panel :label="$t('流程总览')" name="flow">
                <!-- <div class="operate-btns">
                    <bk-button theme="primary" style="width: 88px; cursor: text;">新建</bk-button>
                    <i class="bk-drag-icon bk-drag"></i>
                </div> -->
                <div class="filter-area">
                    <bk-form form-type="vertical" class="filter-form">
                        <bk-form-item :label="$t('form_创建人')">
                            <bk-input></bk-input>
                        </bk-form-item>
                        <bk-form-item :label="$t('form_创建时间')">
                            <bk-date-picker size="small"></bk-date-picker>
                        </bk-form-item>
                        <bk-form-item :label="$t('form_单号')">
                            <bk-input></bk-input>
                        </bk-form-item>
                        <bk-form-item :label="$t('状态')">
                            <bk-select></bk-select>
                        </bk-form-item>
                    </bk-form>
                </div>
                <bk-table :data="emptyData" :outer-border="false" :header-cell-style="{ background: '#f0f1f5' }">
                    <bk-table-column :label="$t('table_创建人')"></bk-table-column>
                    <bk-table-column :label="$t('table_创建时间')"></bk-table-column>
                    <bk-table-column :label="$t('table_当前节点')"></bk-table-column>
                    <bk-table-column :label="$t('状态')"></bk-table-column>
                    <bk-table-column :label="$t('操作')">
                        <bk-button theme="primary" :text="true" size="small" style="padding: 0; cursor: text;">{{ $t('详情') }}</bk-button>
                    </bk-table-column>
                </bk-table>
            </bk-tab-panel>
            <bk-tab-panel :label="$t('节点数据')" name="node" render-directive="if">
                <node-data-manage v-if="!flowConfigLoading" :flow-config="flowConfig">
                </node-data-manage>
            </bk-tab-panel>
        </bk-tab>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { messageError } from '@/common/bkmagic'
    import NodeDataManage from './node.vue'
    export default {
        name: 'FlowData',
        components: {
            NodeDataManage
        },
        props: {},
        data () {
            return {
                active: 'flow',
                emptyData: [{}],
                flowConfigLoading: true,
                flowConfig: {}
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail'])
        },
        created () {
            this.getFlowConfig()
        },
        methods: {
            async getFlowConfig () {
                try {
                    this.flowConfigLoading = true
                    this.flowConfig = await this.$store.dispatch('nocode/flow/getFlowData', { id: this.pageDetail.flowId })
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.flowConfigLoading = false
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .filter-area {
        margin: 12px 0 32px;
        padding: 16px 8px;
        background: #fafbfd;
        border-radius: 2px;
        .filter-form {
            display: flex;
            align-items: center;
            justify-content: space-between;
            .bk-form-item {
                flex: 1;
                margin: 0 8px;
            }
            .bk-date-picker {
                width: 100%;
            }
        }
    }
    .bk-tab {
        >>> .bk-tab-section {
            padding: 16px 0;
        }
    }
</style>
