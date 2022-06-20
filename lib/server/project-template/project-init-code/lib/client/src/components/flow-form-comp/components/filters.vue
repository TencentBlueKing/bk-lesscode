<template>
    <div class="data-manage-filters">
        <bk-form class="filters-form" form-type="vertical">
            <div class="filter-form-item"
                v-for="(item, index) in filterFields"
                :key="index">
                <bk-form-item :label="item.name">
                    <bk-select
                        v-if="isSelectComp(item.type)"
                        v-model="filterData[item.key]"
                        style="background: #ffffff"
                        :placeholder="`请选择${item.name}`">
                    </bk-select>
                    <bk-date-picker
                        v-else-if="['DATE', 'DATETIME'].includes(item.type)"
                        v-model="filterData[item.key]"
                        style="width: 100%;"
                        :placeholder="`请输入${item.name}`">
                    </bk-date-picker>
                    <bk-input
                        v-else
                        v-model="filterData[item.key]"
                        style="width: 100%;"
                        :placeholder="`请输入${item.name}`"
                        :type="item.type === 'INT' ? 'number' : 'text'"
                    />
                </bk-form-item>
            </div>
        </bk-form>
        <div class="search-area">
            <bk-button style="margin-right: 12px;" theme="primary">查询</bk-button>
            <bk-button @click="handleReset">重置</bk-button>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'Filters',
        props: {
            fields: {
                type: Array,
                default: () => []
            },
            systemFields: {
                type: Array,
                default: () => []
            },
            filters: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                filterData: {}
            }
        },
        computed: {
            filterFields () {
                const list = []
                this.filters.forEach(key => {
                    let field = this.systemFields.find(item => item.key === key)
                    if (!field) {
                        field = this.fields.find(item => item.key === key)
                    }
                    if (field) {
                        list.push(field)
                    }
                })
                return list
            }
        },
        watch: {
            filterFields (val) {
                const filterData = {}
                val.forEach(key => {
                    filterData[key] = ''
                })
                this.filterData = filterData
            }
        },
        methods: {
            isSelectComp (type) {
                return ['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO'].includes(type)
            },
            handleReset () {
                const filterData = {}
                Object.keys(this.filterData).forEach(key => {
                    filterData[key] = ''
                })
                this.filterData = filterData
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .data-manage-filters {
        padding: 16px 4px;
        border-radius: 2px;
        background: #fafbfd;
    }
    .add-filter-area {
        padding: 20px 0;
        min-height: 82px;
        font-size: 12px;
        color: #63656e;
    }
    .add-filter-trigger {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 32px;
        height: 32px;
        color: #979ba5;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        cursor: pointer;
    }
    .field-list-wrapper {
        padding: 4px 0;
        width: 120px;
        max-height: 168px;
        overflow: auto;
        @mixin scroller;
        .field-item {
            padding: 0 12px;
            height: 32px;
            line-height: 32px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-size: 12px;
            color: #63656e;
            cursor: pointer;
            &:hover {
                background: #e1ecff;
                color: #3a84ff;
            }
        }
    }
    .filters-form {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        .filter-form-item {
            position: relative;
            padding: 8px;
            width: 320px;
        }
        .bk-form-item {
            margin: 0;
            width: 100%;
            & + .bk-form-item {
                margin-top: 0;
            }
        }
    }
    .search-area {
        padding: 8px 8px;
    }
</style>
