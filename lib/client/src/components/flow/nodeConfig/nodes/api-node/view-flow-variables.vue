<template>
    <div class="view-flow-variables">
        <bk-button
            class="trigger-btn"
            size="small"
            :text="true"
            @click="show = true">
            {{ $t('查看变量') }} </bk-button>
        <bk-sideslider
            :title="$t('变量列表')"
            transfer
            :is-show.sync="show"
            :quick-close="true"
            :width="900"
            @hidden="handleClose">
            <div class="header-wrapper" slot="header">
                {{ $t('变量列表') }} <i class="bk-icon icon-info tips-icon" v-bk-tooltips="{ content: $t('可使用的流程变量是指，流程执行时该节点之前的流程节点输出到执行环境的变量，例如人工节点的字段、api节点响应数据中设置的全局变量'), maxWidth: 400 }"></i>
            </div>
            <section v-bkloading="{ isLoading: loading }" class="flow-variables-content" slot="content">
                <div v-if="varList.length > 0" class="search-input-area">
                    <bk-input
                        style="width: 430px;"
                        :placeholder="$t('请输入变量名称')"
                        right-icon="icon-search"
                        :clearable="true"
                        :value="searchStr"
                        @change="handleSearchStrChange"
                        @enter="searchStr = $event">
                    </bk-input>
                </div>
                <div class="var-groups">
                    <div v-for="(group, index) in tableDataList" class="var-group-item" :key="index">
                        <div class="group-title-area" @click="group.unfold = !group.unfold">
                            <i :class="['bk-icon icon-right-shape fold-icon', { unfold: group.unfold }]"></i>
                            <h3>{{ group.name }}</h3>
                        </div>
                        <bk-table v-show="group.unfold" :outer-border="false" :data="group.fields">
                            <bk-table-column :label="$t('table_变量名称')" property="name" :width="200" show-overflow-tooltip></bk-table-column>
                            <bk-table-column :label="$t('类型')" property="type" :width="140">
                                <template slot-scope="{ row }">
                                    <span class="var-type">{{ row.type }}</span>
                                </template>
                            </bk-table-column>
                            <bk-table-column label="KEY" property="key" show-overflow-tooltip></bk-table-column>
                            <bk-table-column :label="$t('操作')" :width="160">
                                <template slot-scope="{ row }">
                                    <bk-button :text="true" @click="handleCopy(row.key)">{{ $t('复制') }}</bk-button>
                                </template>
                            </bk-table-column>
                        </bk-table>
                    </div>
                    <bk-exception
                        v-if="tableDataList.length === 0"
                        style="margin-top: 100px;"
                        type="empty"
                        scene="part">
                        {{ searchStr ? $t('暂无搜索结果') : $t('暂无可使用的流程变量') }}
                    </bk-exception>
                </div>
            </section>
        </bk-sideslider>
    </div>
</template>
<script>
    import { mapState } from 'vuex'
    import { execCopy } from '@/common/util.js'

    export default {
        name: 'ViewFlowVariables',
        props: {
            openVarList: Boolean
        },
        data () {
            return {
                show: false,
                loading: true,
                searchStr: '',
                varList: []
            }
        },
        computed: {
            ...mapState('nocode/nodeConfig', ['nodeData']),
            tableDataList () {
                if (this.searchStr) {
                    const list = []
                    this.varList.forEach(group => {
                        const fields = group.fields.filter(item => item.name.toLowerCase().includes(this.searchStr.toLowerCase()))
                        if (fields.length > 0) {
                            list.push({
                                unfold: true,
                                name: group.name,
                                fields
                            })
                        }
                    })
                    return list
                }
                return this.varList
            }
        },
        watch: {
            openVarList (val) {
                if (val) {
                    this.show = true
                }
            },
            show (val) {
                if (val) {
                    this.getVarList()
                }
            }
        },
        methods: {
            async getVarList () {
                try {
                    this.loading = true
                    const res = await this.$store.dispatch('nocode/flow/getGroupedNodeVars', this.nodeData.id)
                    const groupedList = []
                    res.forEach((group) => {
                        if (group.fields.length > 0) {
                            groupedList.push({
                                name: group.state_name,
                                unfold: true,
                                fields: group.fields.map((item) => {
                                    const { key, name, type } = item
                                    return {
                                        type,
                                        name,
                                        key: `{{${key}}}`
                                    }
                                })
                            })
                        }
                    })
                    this.varList = groupedList
                } catch (e) {
                    console.error(e)
                } finally {
                    this.loading = false
                }
            },
            handleSearchStrChange (val) {
                if (!val) {
                    this.searchStr = ''
                }
            },
            handleCopy (key) {
                execCopy(key)
            },
            handleClose () {
                this.searchStr = ''
                this.varList = []
                this.$emit('update:open-var-list', false)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .trigger-btn {
        position: absolute;
        right: 0;
        top: -26px;
        padding: 0;
    }
    .tips-icon {
        font-size: 18px;
        color: #63656e;
        cursor: pointer;
        &:hover {
            color: #3a84ff;
        }
    }
    .flow-variables-content {
        padding: 28px 0;
        height: calc(100vh - 60px);
        .search-input-area {
            padding: 0 40px;
        }
        .var-groups {
            margin-top: 16px;
            padding: 0 40px;
            height: calc(100% - 50px);
            overflow: auto;
            @mixin scroller;
        }
        .group-title-area {
            display: flex;
            align-items: center;
            padding: 0 12px;
            height: 42px;
            background: #f0f1f5;
            cursor: pointer;
            .fold-icon {
                font-size: 12px;
                color: #63656e;
                transition: transform 0.2s ease-in-out;
                &.unfold {
                    transform: rotate(90deg);
                }
            }
            & > h3 {
                display: inline-block;
                margin: 0 0 0 10px;
                font-size: 12px;
                color: #313233;
                line-height: 1;
            }
        }
        .var-group-item {
            margin-bottom: 16px;
        }
        .var-type {
            display: inline-block;
            padding: 4px 10px;
            background: #edf4ff;
            border-radius: 2px;
            font-size: 12px;
            color: #3a84ff;
        }
    }
</style>
