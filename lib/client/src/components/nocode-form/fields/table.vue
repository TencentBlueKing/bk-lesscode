<template>
    <div class="table">
        <bk-table :data="val" size="small" :outer-border="isHaveBorder" :max-height="maxHeight">
            <template v-for="col in field.choice">
                <bk-table-column :label="col.name" :key="col.key + col.name" :render-header="(h, data) => renderTableHeader(h, data,col)">
                    <template slot-scope="props">
                        <bk-input
                            v-if="!viewMode && !disabled"
                            v-model="props.row[col.key]"
                            @change="change"></bk-input>
                        <bk-select
                            searchable
                            v-else-if="!viewMode && !disabled && ['select','multiselect'].includes(col.display)"
                            :multiple="col.display === 'multiselect'"
                            v-model="props.row[col.key]"
                            @change="change">
                        </bk-select>
                        <bk-date-picker
                            v-else-if="!viewMode && !disabled && col.display === 'datetime'"
                            :transfer="true"
                            v-model="props.row[col.key]"
                            @change="change">
                        </bk-date-picker>
                        <bk-date-picker
                            v-else-if="!viewMode && !disabled && col.display === 'date'"
                            v-model="props.row[col.key]"
                            :transfer="true"
                            :type="'datetime'"
                            @change="change">
                        </bk-date-picker>
                        <span v-else>{{ props.row[col.key] || '--' }}</span>
                    </template>
                </bk-table-column>
            </template>
            <bk-table-column v-if="!viewMode && !disabled" fixed="right" label="操作" width="150">
                <template slot-scope="props">
                    <bk-button theme="primary" :text="true" @click="handleAddItem(props.$index)">添加</bk-button>
                    <bk-button theme="primary" :text="true" @click="handleDelItem(props.$index)">删除</bk-button>
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
                val: this.getLocalVal(this.value)
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
            change () {
                this.$emit('change', deepClone(this.val))
            }
        }
    }
</script>

<style lang="postcss">
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
</style>
