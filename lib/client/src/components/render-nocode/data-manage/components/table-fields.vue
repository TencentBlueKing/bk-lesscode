<template>
    <div class="table-fields-wrapper">
        <bk-table ref="fieldsTable"
            header-row-class-name="custom-table-header"
            :data="emptyData"
            :outer-border="false">
            <bk-table-column type="selection" width="60" fixed="left">
            </bk-table-column>
            <bk-table-column
                v-for="field in colFields"
                :key="field.key"
                :label="field.name"
                :prop="field.key">
            </bk-table-column>
            <bk-table-column label="操作" :label-width="150">
                <bk-link theme="primary">详情</bk-link>
            </bk-table-column>
            <bk-table-column ref="settingCol" type="setting">
                <div class="table-setting-wrapper">
                    <h2 class="title">表格设置</h2>
                    <div class="field-content-wrapper">
                        <p class="field-title">系统字段</p>
                        <bk-checkbox-group v-model="selectedSys">
                            <bk-checkbox
                                v-for="item in systemFields"
                                :value="item.key"
                                :key="item.key">
                                {{ item.name }}
                            </bk-checkbox>
                        </bk-checkbox-group>
                        <p class="field-title" style="margin-top: 6px;">自定义字段</p>
                        <bk-checkbox-group v-model="selectedCustom">
                            <bk-checkbox
                                v-for="item in fields"
                                :value="item.key"
                                :key="item.key">
                                {{ item.name }}
                            </bk-checkbox>
                        </bk-checkbox-group>
                    </div>
                    <div class="btn-area">
                        <bk-button :theme="'primary'" @click="handleSelectConfirm">确定</bk-button>
                        <bk-button :theme="'default'" @click="handleSelectCancel">取消</bk-button>
                    </div>
                </div>
            </bk-table-column>
        </bk-table>
    </div>
</template>
<script>
    export default {
        name: 'TableFields',
        props: {
            fields: {
                type: Array,
                default: () => []
            },
            systemFields: {
                type: Array,
                default: () => []
            },
            tableConfig: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                cols: this.tableConfig.slice(),
                emptyData: [{}],
                selectedSys: [],
                selectedCustom: []
            }
        },
        computed: {
            colFields () {
                const list = []
                this.cols.forEach(key => {
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
            fields (val) {
                const selectedSys = []
                const selectedCustom = []
                this.tableConfig.forEach(key => {
                    if (this.systemFields.find(field => field.key === key)) {
                        selectedSys.push(key)
                    } else if (val.find(field => field.key === key)) {
                        selectedCustom.push(key)
                    }
                })
                this.selectedSys = selectedSys
                this.selectedCustom = selectedCustom
            },
            tableConfig (val) {
                this.cols = val.slice()
            }
        },
        methods: {
            handleSelectConfirm () {
                this.cols = [...this.selectedSys, ...this.selectedCustom]
                this.$emit('update', this.cols)
            },
            handleSelectCancel () {
                this.$refs.settingCol.Cancel()
                console.log(this.$refs.fieldsTable)
            }
        }
    }
</script>
<style lang="postcss" scoped>
>>> .bk-link-text {
  font-size: 12px;
  cursor: text;
}
>>> .bk-table:before{
  background-color: #F0F1F5
}
>>> .bk-table-column-setting{
  border-left: none;
}
.table-setting-wrapper {
  width: 422px;
  .title {
    padding: 0 24px;
    margin: 0;
    line-height: 32px;
    font-size: 16px;
    font-weight: 400;
    color: #313238;
  }
  .field-content-wrapper {
    padding: 24px;
    max-height: 500px;
    overflow: auto;
  }
  .field-title {
    margin-bottom: 9px;
    font-size: 14px;
    color: #313238;
  }
  .bk-form-checkbox {
    margin-right: 24px;
    margin-bottom: 10px;
  }
  .btn-area {
    padding: 0 24px;
    height: 50px;
    line-height: 50px;
    text-align: right;
    border-top: 1px solid #dcdee5;
    background: #fafbfd;
    .bk-button {
      margin-left: 4px;
    }
  }
}
</style>

<style lang="postcss">
.custom-table-header {
  th {
    background: #F0F1F5 ;
  }
}
</style>
