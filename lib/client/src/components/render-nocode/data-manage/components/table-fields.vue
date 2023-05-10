<template>
    <div class="table-fields-wrapper">
        <bk-table ref="fieldsTable"
            :header-cell-style="{ background: '#f0f1f5' }"
            :data="emptyData"
            :outer-border="false">
            <bk-table-column
                v-for="field in colFields"
                :key="field.key"
                :label="field.name"
                :prop="field.key">
            </bk-table-column>
            <bk-table-column :label="$t('操作')" :min-width="150">
                <div class="table-cell-actions-btns">
                    <table-col-actions-edit></table-col-actions-edit>
                </div>
            </bk-table-column>
            <bk-table-column type="setting" ref="settingCol1">
                <bk-table-setting-content ref="settingCol" v-show="false">
                </bk-table-setting-content>
                <div class="table-setting-wrapper">
                    <h2 class="title">{{ $t('表格设置') }}</h2>
                    <div class="field-content-wrapper">
                        <template v-if="systemFields.length > 0">
                            <p class="field-title">{{ $t('系统字段') }}</p>
                            <bk-checkbox-group :value="selectedFieldKeys">
                                <bk-checkbox
                                    v-for="item in systemFields"
                                    :value="item.key"
                                    :key="item.key"
                                    @change="handleSelectField($event, item.key)">
                                    {{ item.name }}
                                </bk-checkbox>
                            </bk-checkbox-group>
                        </template>
                        <p class="field-title" style="margin-top: 6px;">{{ $t('自定义字段') }}</p>
                        <bk-checkbox-group v-if="fields.length > 0" :value="selectedFieldKeys">
                            <bk-checkbox
                                v-for="item in fields"
                                :value="item.key"
                                :key="item.key"
                                @change="handleSelectField($event, item.key)">
                                {{ item.name }}
                            </bk-checkbox>
                        </bk-checkbox-group>
                        <bk-exception v-else type="empty" scene="part">{{ $t('暂无可展示字段，请在节点表单中配置') }}</bk-exception>
                    </div>
                    <div class="btn-area">
                        <bk-button :theme="'primary'" @click="handleSelectConfirm">{{ $t('确定') }}</bk-button>
                        <bk-button :theme="'default'" @click="handleSelectCancel">{{ $t('取消') }}</bk-button>
                    </div>
                </div>

            </bk-table-column>
        </bk-table>
    </div>
</template>
<script>
    import TableColActionsEdit from './table-col-actions-edit.vue'

    export default {
        name: 'TableFields',
        components: {
            TableColActionsEdit
        },
        props: {
            // 选中的字段
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
                selectedFieldKeys: []
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
                const selectedFieldKeys = []
                this.tableConfig.forEach(key => {
                    if (this.systemFields.find(field => field.key === key)
                        || val.find(field => field.key === key)
                    ) {
                        selectedFieldKeys.push(key)
                    }
                })
                this.selectedFieldKeys = selectedFieldKeys
            },
            tableConfig (val) {
                this.cols = val.slice()
            }
        },
        methods: {
            handleSelectField (val, key) {
                if (val) {
                    this.selectedFieldKeys.push(key)
                } else {
                    this.selectedFieldKeys = this.selectedFieldKeys.filter(item => item !== key)
                }
            },
            handleSelectConfirm () {
                this.cols = [...this.selectedFieldKeys]
                this.$emit('update', this.cols)
                this.$refs.settingCol.handleCancel()
            },
            handleSelectCancel () {
                this.$refs.settingCol.handleCancel()
            }
        }
    }
</script>
<style lang="postcss" scoped>
.detail-btn {
    padding: 4px 8px 4px 0;
}

.bk-table {
    &:before {
        background-color: #f0f1f5;
    }
    >>> .bk-table-body-wrapper {
        overflow: visible;
        .cell {
            overflow: visible;
        }
    }
    .bk-table-body {
        td {
            background: #ffffff !important;
        }
    }
}
>>> .bk-table-column-setting{
  border-left: none;
}
.table-setting-wrapper {
  width: 422px;
  .title {
    padding: 0 24px;
    margin: 0;
    line-height: 28px;
    font-size: 20px;
    font-weight: bold;
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
