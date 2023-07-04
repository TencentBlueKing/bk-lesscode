<template>
    <div class="serialEdit">
        <!-- 自动编号设置栏 -->
        <div class="row-box">
            <div class="title-box">
                <span>{{ $t('编号预览') }}</span>
                <bk-button :text="true" size="small" title="primary" @click="showRuleDialog = true">
                    {{ $t('配置编号规则') }}
                </bk-button>
            </div>
            <span>{{ fieldData.default }}</span>
        </div>
        <div class="row-box">
            <span>{{ $t('重置周期') }}</span>
            <bk-select v-model="serialConfigInfo.resetCycle" searchable :clearable="false" :disabled="disabled">
                <bk-option v-for="option in resetCycles" :key="option.id" :id="option.id" :name="option.name">
                </bk-option>
            </bk-select>
        </div>
        <div class="row-box">
            <span>{{ $t('初始值') }}</span>
            <bk-input v-model="serialConfigInfo.initNumber" @change="initNumberChange" type="number" :min="1" :disabled="disabled"></bk-input>
        </div>
        <!-- 编号规则 -->
        <bk-dialog
            v-model="showRuleDialog"
            ext-cls="dialog-style"
            :title="$t('配置编号规则')"
            header-position="left"
            :esc-close="false"
            :auto-close="false"
            :width="500"
            :mask-close="false"
            @confirm="handlerConfirm"
            @cancel="handlerCancel">
            <div class="rule-box">
                <draggable v-model="serialConfigInfo.serialRules" force-fallback="true" group="people" animation="500" @end="draggableEnd">
                    <div class="row-box" v-for="(item, index) in serialConfigInfo.serialRules" :key="index">
                        <div class="label-text">
                            <span>{{ item.name }}</span>
                            <i v-if="item.type !== 'serialNumber'" class="drag-icon bk-drag-icon bk-drag-delet"
                                @click.stop="handlerDelete(index)" />
                        </div>
                        <div class="input-warp">
                            <i class="drag-icon bk-drag-icon bk-drag-grag-fill" />
                            <template v-if="item.type === 'serialNumber'">
                                <bk-input
                                    class="input-item"
                                    v-model="item.configValue"
                                    @change="($event) => serialNumberChange($event, item)"
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
                                    :disabled="disabled"
                                    @change="($event) => formFieldChange($event, item)">
                                    <bk-option v-for="option in fields" :key="option.key" :id="option.key"
                                        :name="option.name"></bk-option>
                                </bk-select>
                            </template>
                            <template v-else-if="item.type === 'customizeChar'">
                                <bk-input
                                    class="input-item"
                                    v-model="item.configValue"
                                    :clearable="true"
                                    :maxlength="100"
                                    :disabled="disabled"
                                    @change="($event) => customizeCharChange($event, item)">
                                </bk-input>
                            </template>
                        </div>

                    </div>
                </draggable>
            </div>
            <div class="row-box add-btn">
                <bk-dropdown-menu trigger="click" :disabled="disabled">
                    <div slot="dropdown-trigger">
                        <bk-button :text="true" title="primary" :disabled="disabled">
                            <i class="icon bk-drag-icon bk-drag-add-line" />
                            <span>{{ $t('添加规则') }}</span>
                        </bk-button>
                    </div>
                    <ul class="bk-dropdown-list" slot="dropdown-content">
                        <li @click="handlerAdd(item)" v-for="(item, index) in serialElements" :key="index">
                            <a href="javascript:;"> {{ item.name }}</a>
                        </li>
                    </ul>
                </bk-dropdown-menu>
            </div>
        </bk-dialog>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import { mapGetters } from 'vuex'
    import draggable from 'vuedraggable'
    import dayjs from 'dayjs'

    export default {
        name: 'BkLesscodeSerialEdit',
        components: {
            draggable
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            computConfigInfo: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean
        },
        data () {
            return {
                fieldData: cloneDeep(this.field),
                serialConfigInfo: this.initSerialConfigInfo(),
                defaultSerialConfigInfo: this.initSerialConfigInfo(),
                resetCycles: [
                    {
                        id: 'noReset',
                        name: this.$t('不重置')
                    }, {
                        id: 'year',
                        name: this.$t('按年重置')
                    }, {
                        id: 'month',
                        name: this.$t('按月重置')
                    }, {
                        id: 'week',
                        name: this.$t('按周重置')
                    }, {
                        id: 'day',
                        name: this.$t('按日重置')
                    }
                ],
                showRuleDialog: false,
                dateFormats: [
                    {
                        id: 'YYYY/MM/DD',
                        name: this.$t('年/月/日')
                    }, {
                        id: 'YYYY/MM',
                        name: this.$t('年/月')
                    }, {
                        id: 'MM/DD',
                        name: this.$t('月/日')
                    }, {
                        id: 'YYYY',
                        name: this.$t('年')
                    }
                ],
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
                // 表单创建时间
                formCreateTime: ''
            }
        },
        computed: {
            ...mapGetters('nocode/formSetting', ['fieldsList']),
            ...mapGetters('page', ['pageDetail']),

            fields () {
                return this.fieldsList.filter((item) => {
                    return item.key !== this.field.key && ['STRING', 'TEXT', 'INT', 'DATE', 'DATETIME', 'SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO'].includes(item.type)
                })
            }
        },

        watch: {
            pageDetail: {
                handler (val) {
                    this.formCreateTime = val.createTime
                },
                immediate: true
            }
        },
        created () {
            this.setMeta()
            console.log(this.pageDetail)
        },
        methods: {
            initSerialConfigInfo () {
                return {
                    resetCycle: 'noReset', // 重置周期
                    initNumber: 1, // 初始值
                    serialRules: [ // 编号要素
                        {
                            type: 'serialNumber',
                            configValue: 4,
                            serialValue: '0001',
                            name: this.$t('流水号')
                        }
                    ]
                }
            },
            setMeta () {
                if (!this.field.meta.hasOwnProperty('serial_config_info')) {
                    this.$set(this.fieldData.meta, 'serial_config_info', this.initSerialConfigInfo())
                }
                this.serialConfigInfo = this.fieldData.meta.serial_config_info
                this.defaultSerialConfigInfo = cloneDeep(this.serialConfigInfo)
                this.filterserialRules(this.serialConfigInfo)
                this.computeSerialNumber()
            },
            // 过滤编号规则
            filterserialRules (serialConfigInfo) {
                const { serialRules } = serialConfigInfo
                serialConfigInfo.serialRules = serialRules.filter((item) => {
                    return item.type !== 'formField' || this.fields.some((fieldItem) => {
                        return fieldItem.key === item.configValue
                    })
                })
            },
            // 计算编号组件默认值
            computeSerialNumber () {
                this.fieldData.default = this.serialConfigInfo.serialRules.map((item) => {
                    return item.serialValue
                }).join('-')
                this.update()
            },
            draggableEnd () {
                this.computeSerialNumber()
            },
            serialNumberChange (value, serialRule) {
                serialRule.configValue = parseInt(value)
                this.setSerialNumber(serialRule)
                this.computeSerialNumber()
            },
            // 初始值修改
            initNumberChange (value) {
                const serialRule = this.serialConfigInfo.serialRules.find((item) => {
                    return item.type === 'serialNumber'
                })
                this.setSerialNumber(serialRule)
                this.computeSerialNumber()
            },
            // 修改创建日期
            dateChange (value, serialRule) {
                serialRule.serialValue = dayjs(this.formCreateTime).format(value)
                this.computeSerialNumber()
            },
            // 修改表单字段
            formFieldChange (fieldKey, serialRule) {
                const field = this.fields.find((item) => {
                    return item.key === fieldKey
                })
                if (['SELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO'].includes(field.type)) {
                    serialRule.serialValue = field.choice.filter((item) => {
                        return field.default.split(',').includes(item.key)
                    }).map((item) => {
                        return item.name
                    }).join(',')
                } else {
                    serialRule.serialValue = field.default
                }
                this.computeSerialNumber()
            },
            // 修改自定义字符串
            customizeCharChange (value, serialRule) {
                serialRule.serialValue = value
                serialRule.configValue = value
                this.computeSerialNumber()
            },
            // 获取流水号
            setSerialNumber (serialRule) {
                let initNumber = `${this.serialConfigInfo.initNumber}`
                const configValue = parseInt(serialRule.configValue)
                if (initNumber.length > configValue) {
                    this.serialConfigInfo.initNumber = 1
                    initNumber = '1'
                    this.$bkMessage({ theme: 'warning', message: '初始值位数大于当前设置的流水号位数，已重置为1，请重新确认初始值' })
                }
                serialRule.serialValue = initNumber.padStart(configValue, '0')
            },
            handlerConfirm () {
                if (this.disabled) {
                    this.handlerCancel()
                    return
                }
                // 检查自定义规则是否有值
                const bool = this.serialConfigInfo.serialRules.some((item) => {
                    return !item.serialValue && item.type === 'customizeChar'
                })
                if (bool) {
                    this.$bkMessage({ theme: 'error', message: '自定义规则未设置值，请设置' })
                    return
                }
                this.defaultSerialConfigInfo = cloneDeep(this.fieldData.meta.serial_config_info)
                this.showRuleDialog = false
                this.computeSerialNumber()
            },
            handlerCancel () {
                this.fieldData.meta.serial_config_info = this.defaultSerialConfigInfo
                this.serialConfigInfo = this.defaultSerialConfigInfo
                this.computeSerialNumber()
            },
            handlerDelete (index) {
                this.serialConfigInfo.serialRules.splice(index, 1)
                this.computeSerialNumber()
            },
            handlerAdd (item) {
                this.serialConfigInfo.serialRules.push({
                    type: item.type,
                    configValue: '',
                    serialValue: '',
                    name: item.name
                })
            },

            update () {
                this.$emit('change', this.fieldData)
            }
        }
    }
</script>

<style lang="postcss" >
.row-box {
    margin: 12px 0;
    font-size: 12px;

    .label-text {
        margin-bottom: 8px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-left: 28px;

        .bk-drag-delet {
            font-size: 14px;
        }

        .bk-drag-delet:hover {
            cursor: pointer;
            color: #FD9C9C;
        }
    }

    .bk-drag-add-line {
        margin-right: 5px;
    }
}

.add-btn {
    margin-left: 18px;
}

.rule-box {
    max-height: 300px;
    overflow-y: auto;
    padding: 0 5px;
}

.rule-box::-webkit-scrollbar {
    width: 3px;
}

.rule-box::-webkit-scrollbar-thumb {
    background-color: rgba(196, 198, 204, 0.6);
    border-radius: 5px;
    opacity: 0.1;
}

.title-box {
    display: flex;
    justify-content: space-between;
}

.input-warp {
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

.dialog-style {
    .bk-dialog-body {
        padding-left: 5px;
        padding-right: 20px;
    }
}</style>
