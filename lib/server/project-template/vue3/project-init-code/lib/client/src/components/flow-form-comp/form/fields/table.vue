<template>
    <div class="table">
        <bk-table
            :data="tableData"
            size="small"
            :outer-border="isHaveBorder"
            :max-height="maxHeight"
            :pagination="pagination"
            @page-change="handlePageChange"
            @page-limit-change="handlePageLimitChange">
            <template v-for="col in field.choice">
                <bk-table-column :label="col.name" :key="col.key + col.name + col.display" :render-header="(h, data) => renderTableHeader(h, data,col)">
                    <template slot-scope="props">
                        <bk-select
                            searchable
                            :disabled="disabled"
                            v-if="!viewMode && ['select','multiselect'].includes(col.display)"
                            :multiple="col.display === 'multiselect'"
                            v-model="props.row[col.key]"
                            @change="change">
                            <bk-option
                                v-for="option in col.options"
                                :key="option.key"
                                :id="option.id"
                                :name="option.name">
                            </bk-option>
                        </bk-select>
                        <bk-date-picker
                            v-else-if="!viewMode && col.display === 'datetime'"
                            style="width: 100%"
                            :transfer="true"
                            :disabled="disabled"
                            :type="'datetime'"
                            :value="props.row[col.key]"
                            @change="(val) => handleSelectDateTime({ val: val,props, key: col.key })">
                        </bk-date-picker>
                        <bk-date-picker
                            v-else-if="!viewMode && col.display === 'date'"
                            style="width: 100%"
                            :value="props.row[col.key]"
                            :transfer="true"
                            :disabled="disabled"
                            :type="'datetime'"
                            @change="(val) => handleSelectDate({ val: val,props, key: col.key })">
                        </bk-date-picker>
                        <bk-input
                            v-else-if="!viewMode "
                            :disabled="disabled"
                            v-model="props.row[col.key]"
                            @change="change">
                        </bk-input>
                        <span v-else>{{ transformSelectValue({ row: props.row,col })}}</span>
                    </template>
                </bk-table-column>
            </template>
            <bk-table-column v-if="!viewMode && !disabled" fixed="right" :label="$t('操作')" width="150">
                <template slot-scope="props">
                    <bk-button theme="primary" :text="true" @click="handleAddItem(props.$index)">{{ $t('添加') }}</bk-button>
                    <bk-button theme="primary" :text="true" @click="handleDelItem(props.$index)">{{ $t('删除') }}</bk-button>
                </template>
            </bk-table-column>
        </bk-table>
    </div>
</template>
<script>
    import { deepClone } from '../util/index.js'

    export default {
        name: 'Table',
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            value: {
                type: Array,
                default: () => []
            },
            viewMode: {
                type: Boolean,
                default: false
            },
            needPagination: {
                type: Boolean,
                default: false
            },
            disabled: {
                type: Boolean,
                default: false
            },
            isHaveBorder: {
                type: Boolean,
                default: true
            },
            maxHeight: [String, Number]
        },
        data () {
            return {
                val: this.getLocalVal(this.value),
                pagingConfig: {
                    current: 1,
                    count: '',
                    limit: 10
                }
            }
        },
        computed: {
            pagination () {
                if (this.needPagination) {
                    this.pagingConfig.count = this.val.length
                    return this.pagingConfig
                }
                return {}
            },
            tableData () {
                this.val = this.getLocalVal(this.value)
                if (this.needPagination) {
                    return this.val.slice((this.pagingConfig.current - 1) * this.pagingConfig.limit,
                                          this.pagingConfig.current * this.pagingConfig.limit)
                }
                return this.val
            }
        },
        watch: {
            value (val) {
                this.val = this.getLocalVal(val)
            }
        },
        methods: {
            getLocalVal (value) {
                const val = deepClone(value)
                if (val.length === 0) {
                    const valItem = {}
                    this.field.choice.forEach((col) => {
                        valItem[col.key] = ''
                    })
                    val.push(valItem)
                }
                return val
            },
            handleAddItem (index) {
                const valItem = {}
                this.field.choice.forEach((col) => {
                    valItem[col.key] = ''
                })
                this.val.splice(index + 1, 0, valItem)
                this.change()
            },
            handleDelItem (index) {
                if (index === 0 && this.val.length === 1) {
                    return
                }
                this.val.splice(index, 1)
                this.change()
            },
            renderTableHeader (h, data, row) {
                return (<span >{ data.column.label }{row.required ? <span class="require"></span> : ''}</span>)
            },
            handleSelectDateTime (params) {
                const { val, props, key } = params
                this.$set(props.row, key, val)
                this.change()
            },
            handleSelectDate (params) {
                const { val, props, key } = params
                this.$set(props.row, key, val)
                this.change()
            },
            transformSelectValue ({ row, col }) {
                if (['select', 'multiselect'].includes(col.display)) {
                    const value = []
                    col.options.forEach(item => {
                        if (row[col.key] === item.id) {
                            value.push(item.name)
                        }
                    })
                    return value.join(',') || '--'
                } else return row[col.key] || '--'
            },
            change () {
                this.$emit('change', deepClone(this.val))
            },
            handlePageLimitChange (limit) {
                this.pagingConfig.limit = limit
                this.pagingConfig.current = 1
            },
            handlePageChange (page) {
                this.pagingConfig.current = page
            }
        }
    }
</script>

<style lang="postcss" scoped>
.require{
  &:after{
    content:'*';
    display:inline-block;
    position:absolute;
    top:50%;
    height:8px;
    line-height:1;
    font-size:12px;
    color:#ea3636;
    -webkit-transform:translate(3px, -50%);
    transform:translate(3px, -50%);
  }
}
>>>  .bk-table-fixed-right tr.bk-table-row-last td.is-last, .bk-table-fixed tr.bk-table-row-last td.is-last {
  border-bottom: 1px solid #dfe0e5;
}
</style>
