<template>
    <div class="data-manage-filters">
        <bk-form class="filters-form" form-type="vertical">
            <div v-for="(item, index) in filterFields" class="filter-form-item" :key="index">
                <bk-form-item :label="item.name">
                    <bk-select
                        v-if="isSelectComp(item.type)"
                        style="pointer-events: none; background: #ffffff"
                        :placeholder="`请选择${item.name}`">
                    </bk-select>
                    <bk-date-picker
                        v-else-if="['DATE', 'DATETIME'].includes(item.type)"
                        style="pointer-events: none; width: 100%;"
                        :placeholder="`请输入${item.name}`">
                    </bk-date-picker>
                    <bk-input
                        v-else
                        style="pointer-events: none;"
                        :placeholder="`请输入${item.name}`"
                        :type="item.type === 'INT' ? 'number' : 'text'"
                    />
                </bk-form-item>
                <i class="bk-drag-icon bk-drag-close-circle-fill delete-icon" @click="handleDelClick(item.key)"></i>
            </div>
            <bk-popover
                v-if="canSelectFields.length > 0"
                theme="light"
                placement="bottom-start"
                ext-cls="filter-field-popover"
                trigger="click"
                style="margin: 9px 0 9px 4px; align-self: flex-end;"
                :tippy-options="{
                    arrow: false,
                    distance: 0
                }">
                <div class="add-filter-trigger" v-bk-tooltips="'添加筛选条件'">
                    <i class="bk-drag-icon bk-drag-add-line"></i>
                </div>
                <ul class="field-list-wrapper" slot="content">
                    <li v-for="ele in canSelectFields" class="field-item" :key="ele.key" @click="handleAddClick(ele.key)">
                        {{ ele.name }}
                    </li>
                </ul>
            </bk-popover>
            <p
                v-if="filterFields.length === 0 && canSelectFields.length === 0 "
                style="font-size: 12px;">
                请先在表格中添加需要展示的字段
            </p>
        </bk-form>
    </div>
</template>
<script>
    const UN_FILTERABLE_TYPE = ['TABLE', 'RICHTEXT', 'FILE', 'LINK', 'IMAGE']
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
            },
            tableConfig: {
                type: Array,
                default: () => []
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
            },
            canSelectFields () {
                const list = []
                const fullFields = this.fields.concat(this.systemFields).filter(item => !UN_FILTERABLE_TYPE.includes(item.type))
                fullFields.forEach(item => {
                    if (!this.filters.includes(item.key) && this.tableConfig.includes(item.key)) {
                        list.push(item)
                    }
                })
                return list
            }
        },
        methods: {
            isSelectComp (type) {
                return ['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO'].includes(type)
            },
            handleAddClick (key) {
                this.$emit('update', this.filters.concat(key))
            },
            handleDelClick (key) {
                const index = this.filters.findIndex(item => item === key)
                const list = this.filters.slice()
                list.splice(index, 1)
                this.$emit('update', list)
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
            border: 1px dashed transparent;
            &:hover {
                background: #eaebf0;
                border-color: #63656e;
                .delete-icon {
                    display: block;
                }
            }
        }
        .bk-form-item {
            width: 100%;
            & + .bk-form-item {
                margin-top: 0;
            }
        }
        .delete-icon {
            display: none;
            position: absolute;
            top: -8px;
            right: -8px;
            font-size: 16px;
            color: #979ba5;
            background: #ffffff;
            border-radius: 50%;
            cursor: pointer;
            &:hover {
                color: #63656e;
            }
        }
    }
</style>
<style lang="postcss">
    .filter-field-popover {
        .tippy-tooltip.light-theme {
            padding: 0;
            background: #ffffff;
            border: 1px solid #dcdee5;
            box-shadow: 0 2px 6px 0 rgba(0,0,0,0.10);
            border-radius: 2px;
        }
    }
</style>
