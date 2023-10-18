<template>
    <div class="header-config-item">
        <div class="operate-area">
            <i class="bk-drag-icon bk-drag-drag-small1 item-drag" />
            <i class="bk-icon icon-close item-remove" @click="$emit('remove')"></i>
        </div>
        <bk-form :label-width="270" form-type="vertical">
            <bk-form-item :label="$t('form_列名称')">
                <bk-input v-model="localVal.name" @change="change"></bk-input>
            </bk-form-item>
            <bk-form-item :label="$t('form_列字段类型')">
                <bk-select
                    v-model="localVal.type"
                    @selected="change">
                    <bk-option v-for="option in typeList" :key="option.id" :id="option.id" :name="option.name"></bk-option>
                </bk-select>
            </bk-form-item>
            <bk-form-item :label="$t('form_数据源配置')" v-if="['select','multi-select'].includes(localVal.type)">
                <div class="data-source-setting" v-for="(option,index) in localVal.dataSource" :key="option.id">
                    <bk-input
                        v-model="option.name"
                        class="option-item"
                        :placeholder="$t('选项名')">
                      </bk-input>
                    <bk-input
                        class="option-item"
                        :placeholder="$t('选项ID')"
                        v-model="option.id"
                        @change="change">
                    </bk-input>
                    <div class="btn-area">
                        <i class="icon bk-drag-icon bk-drag-add-fill" @click="handleAddItem(index)"></i>
                        <i
                            :class="['icon', 'bk-drag-icon', 'bk-drag-reduce-fill', { disabled: localVal.dataSource.length < 2 }]"
                            @click="handleDeleteItem(index)"></i>
                    </div>
                </div>
            </bk-form-item>
            <bk-checkbox class="required-checkbox" v-model="localVal.required" @change="change">{{ $t('必填') }}</bk-checkbox>
        </bk-form>
    </div>
</template>

<script>
    import cloneDeep from 'lodash.clonedeep'
    import { uuid } from '../../../../utils/index'

    export default {
        name: 'headerConfigItem',
        props: {
            config: {
                type: Object,
                default: () => ({
                    key: '',
                    name: '',
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
                    { id: 'multi-select', name: this.$t('多选框') },
                    { id: 'datetime', name: this.$t('时间') },
                    { id: 'date', name: this.$t('日期') }
                ]
            }
        },
        methods: {
            change () {
                const key = uuid()
                this.localVal.key = key
                if (['select', 'multiselect'].includes(this.localVal.type)) {
                    this.$set(this.localVal, 'dataSource', [
                        { name: this.$t('选项1'), id: 'XUAN_XIANG_1' },
                        { name: this.$t('选项2'), id: 'XUAN_XIANG_2' }
                    ])
                }
                this.$emit('change', this.localVal)
            },
            handleAddItem (index) {
                const dataItem = { name: '', key: '' }
                this.localVal.dataSource.splice(index + 1, 0, dataItem)
                this.$emit('change', this.localVal)
            },
            handleDeleteItem (index) {
                if (this.localVal.dataSource.length < 2) {
                    return
                }
                this.localVal.dataSource.splice(index, 1)
                this.$emit('change', this.localVal)
            }

        }
    }
</script>
<style lang='postcss' scoped>
    .header-config-item {
        width: 276px;
        padding: 16px;
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
            color: #979BA5;
            font-size: 20px;
            margin-top: -3px;
            z-index: 10;
            .item-remove {
                cursor: pointer;
            }
            .item-drag {
                cursor: move;
                padding-left: 220px;
                margin-right: -8px;
            }
        }
    }
    .data-source-setting {
        display:flex ;
        align-items: center;
        .option-item{
            width: 94px;
            margin: 8px 8px 0 0;
        }
    }
    .required-checkbox {

    }
    .btn-area {
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
