<template>
    <!-- 编号规则 -->
    <bk-dialog
        header-position="left"
        :value="show"
        :title="$t('配置编号规则')"
        :esc-close="false"
        :auto-close="false"
        :width="500"
        :mask-close="false"
        @confirm="handleConfirm"
        @cancel="close">
        <div class="rule-list">
            <vue-draggable v-model="localConfig.serialRules" force-fallback="true" group="people" animation="500">
                <div class="rule-item" v-for="(item, index) in localConfig.serialRules" :key="index">
                    <div class="label-text">
                        <span>{{ item.name }}</span>
                        <i v-if="item.type !== 'serialNumber'" class="drag-icon bk-drag-icon bk-drag-delet"
                            @click.stop="handleDel(index)" />
                    </div>
                    <div class="rule-content">
                        <i class="drag-icon bk-drag-icon bk-drag-grag-fill" />
                        <template v-if="item.type === 'serialNumber'">
                            <bk-input
                                v-model="item.configValue"
                                class="input-item"
                                size="small"
                                type="number"
                                :min="4"
                                :max="10"
                                :disabled="disabled">
                                <template slot="append">
                                    <div class="group-text">{{ $t('位') }}</div>
                                </template>
                            </bk-input>
                        </template>
                        <template v-else-if="item.type === 'date'">
                            <bk-select
                                v-model="item.configValue"
                                class="input-item"
                                searchable
                                size="small"
                                :disabled="disabled"
                                @change="($event) => dateChange($event, item)">
                                <bk-option v-for="option in dateFormats" :key="option.id" :id="option.id"
                                    :name="option.name"></bk-option>
                            </bk-select>
                        </template>
                        <template v-else-if="item.type === 'formField'">
                            <bk-select
                                v-model="item.configValue"
                                class="input-item"
                                searchable
                                size="small"
                                :disabled="disabled"
                                @change="($event) => formFieldChange($event, item)">
                                <bk-option v-for="option in fields" :key="option.key" :id="option.key"
                                    :name="option.name"></bk-option>
                            </bk-select>
                        </template>
                        <template v-else-if="item.type === 'customizeChar'">
                            <bk-input
                                v-model="item.configValue"
                                class="input-item"
                                size="small"
                                :clearable="true"
                                :maxlength="100"
                                :disabled="disabled"
                                @change="($event) => customizeCharChange($event, item)">
                            </bk-input>
                        </template>
                    </div>
                </div>
            </vue-draggable>
        </div>
        <div class="add-btn">
            <bk-dropdown-menu trigger="click" :disabled="disabled">
                <div slot="dropdown-trigger">
                    <bk-button text title="primary" size="small" :disabled="disabled">
                        <i class="icon bk-drag-icon bk-drag-add-line" />
                        <span>{{ $t('添加规则') }}</span>
                    </bk-button>
                </div>
                <ul class="bk-dropdown-list" slot="dropdown-content">
                    <li @click="handleAdd(item)" v-for="(item, index) in serialElements" :key="index">
                        <a href="javascript:;"> {{ item.name }}</a>
                    </li>
                </ul>
            </bk-dropdown-menu>
        </div>
    </bk-dialog>
</template>
<script>
    import { mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import dayjs from 'dayjs'

    export default {
        name: 'counting-rules-dialog',
        props: {
            show: Boolean,
            disabled: Boolean,
            config: {
                type: Object,
                default: () => ({})
            },
            list: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                localConfig: {},
                serialElements: [
                    {
                        type: 'date',
                        name: this.$t('创建时间')
                    },
                    {
                        type: 'formField',
                        name: this.$t('本表字段')
                    },
                    {
                        type: 'customizeChar',
                        name: this.$t('自定义字符')
                    }
                ],
                dateFormats: [
                    {
                        id: 'YYYY/MM/DD',
                        name: this.$t('年/月/日')
                    },
                    {
                        id: 'YYYY/MM',
                        name: this.$t('年/月')
                    },
                    {
                        id: 'MM/DD',
                        name: this.$t('月/日')
                    },
                    {
                        id: 'YYYY',
                        name: this.$t('年')
                    }
                ]
            }
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            fields () {
                return this.list.filter((item) => {
                    return item.key !== this.field.key && ['input', 'textarea', 'int', 'date', 'datetime', 'select', 'multiple-select', 'checkbox', 'radio'].includes(item.type)
                })
            },
            // 表单创建时间
            formCreateTime () {
                return this.pageDetail.createTime
            }
        },
        watch: {
            show (val) {
                if (val) {
                    this.localConfig = cloneDeep(this.config)
                }
            }
        },
        methods: {
            // 修改创建日期
            dateChange (value, serialRule) {
                serialRule.serialValue = dayjs(this.formCreateTime).format(value)
            },
            // 修改表单字段
            formFieldChange (fieldKey, serialRule) {
                const field = this.fields.find((item) => {
                    return item.key === fieldKey
                })
                if (['select', 'multiple-select', 'checkbox', 'radio'].includes(field.type)) {
                    serialRule.serialValue = field.choice.filter((item) => {
                        return field.default.split(',').includes(item.key)
                    }).map((item) => {
                        return item.name
                    }).join(',')
                } else {
                    serialRule.serialValue = field.default
                }
            },
            // 修改自定义字符串
            customizeCharChange (value, serialRule) {
                serialRule.serialValue = value
                serialRule.configValue = value
            },
            handleAdd (item) {
                this.localConfig.serialRules.push({
                    type: item.type,
                    configValue: '',
                    serialValue: '',
                    name: item.name
                })
            },
            handleDel (index) {
                this.localConfig.serialRules.splice(index, 1)
            },
            handleConfirm () {
                if (this.disabled) {
                    return
                }
                // 检查自定义规则是否有值
                const bool = this.localConfig.serialRules.some((item) => {
                    return !item.serialValue && item.type === 'customizeChar'
                })
                if (bool) {
                    this.$bkMessage({ theme: 'error', message: '自定义规则未设置值，请设置' })
                    return
                }
                this.$emit('update', this.localConfig)
                this.close()
            },
            close () {
                this.$emit('update:show', false)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";

    .rule-list {
        padding: 0 5px;
        max-height: 300px;
        overflow: auto;
        @mixin scroller;
    }
    .rule-item {
        margin-bottom: 12px;
        font-size: 12px;
        .label-text {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-left: 28px;
            line-height: 20px;
            .bk-drag-delet {
                font-size: 14px;
                cursor: pointer;
                &:hover {
                    color: #3a84ff;
                }
            }
        }
        .bk-drag-add-line {
            margin-right: 5px;
        }
    }
    .rule-content {
        display: flex;
        align-items: center;
        .input-item {
            flex: 1
        }
        .drag-icon {
            font-size: 18px;
            margin-right: 10px;
            cursor: move;
        }
    }
    .add-btn {

    }
</style>