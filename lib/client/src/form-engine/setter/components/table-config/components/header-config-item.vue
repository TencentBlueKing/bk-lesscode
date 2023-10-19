<template>
    <div class="header-config-item">
        <div class="operate-area">
            <i class="bk-drag-icon bk-drag-drag-small1 item-drag" />
            <i class="bk-icon icon-close item-remove" @click="$emit('remove')"></i>
        </div>
        <bk-form :label-width="270" form-type="vertical">
            <bk-form-item :label="$t('form_列名称')">
                <bk-input v-model="localVal.label" size="small" @change="change"></bk-input>
            </bk-form-item>
            <bk-form-item :label="$t('form_列字段类型')">
                <bk-select
                    v-model="localVal.type"
                    size="small"
                    :clearable="false"
                    @change="handleTypeChange">
                    <bk-option v-for="option in typeList" :key="option.id" :id="option.id" :name="option.name"></bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item :label="$t('form_数据源配置')" v-if="hasDataSource">
                <div class="data-source-setting" v-for="(option, index) in localVal.dataSource" :key="option.id">
                    <bk-input
                        v-model="option.label"
                        class="option-item"
                        size="small"
                        :placeholder="$t('选项名')">
                      </bk-input>
                    <bk-input
                        v-model="option.id"
                        class="option-item"
                        size="small"
                        :placeholder="$t('选项ID')"
                        @change="change">
                    </bk-input>
                    <div class="btn-area">
                        <i class="bk-drag-icon bk-drag-add-fill" @click="handleAddDataSource(index)"></i>
                        <i
                            :class="['bk-drag-icon', 'bk-drag-reduce-fill', { disabled: localVal.dataSource.length < 2 }]"
                            @click="handleDelDataSource(index)"></i>
                    </div>
                </div>
            </bk-form-item>
            <bk-checkbox class="required-checkbox" v-model="localVal.required" @change="change">{{ $t('必填') }}</bk-checkbox>
        </bk-form>
    </div>
</template>

<script>
    import cloneDeep from 'lodash.clonedeep'

    export default {
        name: 'headerConfigItem',
        props: {
            config: {
                type: Object,
                default: () => ({
                    key: '',
                    label: '',
                    type: '',
                    required: false,
                    dataSource: []
                })
            }
        },
        data () {
            return {
                localVal: cloneDeep(this.config),
                typeList: [
                    { id: 'input', name: this.$t('输入框') },
                    { id: 'select', name: this.$t('单选框') },
                    { id: 'multiple-select', name: this.$t('多选框') },
                    { id: 'datetime', name: this.$t('时间') },
                    { id: 'date', name: this.$t('日期') }
                ]
            }
        },
        computed: {
            hasDataSource () {
                return ['select','multiple-select'].includes(this.localVal.type)
            }
        },
        methods: {
            getDefaultDataSource () {
                return [
                    { id: 'xuanxiang1', label: '选项1' },
                    { id: 'xuanxiang2', label: '选项2' }
                ]
            },
            handleTypeChange () {
                if (this.hasDataSource) {
                    this.localVal.dataSource = this.getDefaultDataSource()
                } else {
                    this.localVal.dataSource = []
                }
                this.change()
            },
            handleAddDataSource (index) {
                this.localVal.dataSource.splice(index + 1, 0, { id: '', label: '' })
                this.change()
            },
            handleDelDataSource (index) {
                if (this.localVal.dataSource.length < 2) {
                    return
                }
                this.localVal.dataSource.splice(index, 1)
                this.change()
            },
            change () {
                this.$emit('change', this.localVal)
            }
        }
    }
</script>
<style lang='postcss' scoped>
    .header-config-item {
        width: 276px;
        padding: 12px;
        position: relative;
        background: #f0f1f5;
        border-radius: 2px;
        transition: all .15s;
        box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.2);
        &:nth-child(n + 2) {
            margin-top: 10px;
        }
        .operate-area {
            position: absolute;
            right: 0;
            top: 6px;
            display: flex;
            align-items: center;
            color: #979BA5;
            z-index: 10;
            .item-drag {
                font-size: 24px;
                cursor: move;
                &:hover {
                    color: #3a84ff;
                }
            }
            .item-remove {
                font-size: 20px;
                cursor: pointer;
                &:hover {
                    color: #3a84ff;
                }
            }
        }
    }
    .data-source-setting {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .option-item {
            width: 100px;
        }
    }
    .btn-area {
        width: 40px;
        user-select: none;
        .bk-drag-add-fill,
        .bk-drag-reduce-fill {
            font-size: 16px;
            color: #c4c6cc;
            cursor: pointer;

            &:hover {
                color: #979ba5;
            }

            &.disabled {
                color: #dcdee5;
                cursor: not-allowed;
            }
        }
    }
    .bk-button {
        background: #ffffff;
    }
    .required-checkbox {
        margin-top: 8px;
    }
    /deep/ {
        .bk-checkbox-text,
        .bk-label {
            font-size: 12px;
        }
        .bk-select {
            background: #ffffff;
        }
    }
</style>
