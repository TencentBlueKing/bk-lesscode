<template>
    <div class="auto-counting-config">
        <setter-form-item :title="$t('编号预览')">
            <div class="preview-box">
                <span class="text">{{ localVal.val }}</span>
                <bk-button text class="open-dialog-btn" size="small" title="primary" @click="isRulesDialogShow = true">
                    {{ $t('配置编号规则') }}
                </bk-button>
            </div>
        </setter-form-item>
        <setter-form-item :title="$t('重置周期')">
            <bk-select v-model="localVal.config.resetCycle" searchable :clearable="false" :disabled="disabled">
                <bk-option v-for="option in resetCycles" :key="option.id" :id="option.id" :name="option.name" />
            </bk-select>
        </setter-form-item>
        <setter-form-item :title="$t('初始值')">
            <bk-input v-model="localVal.config.initNumber" @change="handleInitNumChange" type="number" :min="1" :disabled="disabled" />
        </setter-form-item>
        <counting-rules-dialog
            :show.sync="isRulesDialogShow"
            :config="localVal.config"
            @update="handleUpdateRules">
        </counting-rules-dialog>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import setterFormItem from '../../common/setter-form-item.vue'
    import countingRulesDialog from './components/counting-rules-dialog.vue'

    export default {
        name: 'auto-counting-config',
        components: {
            setterFormItem,
            countingRulesDialog
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            list: Array,
            disabled: Boolean,
            value: {
                type: Object,
                default: () => ({
                    config: {
                        resetCycle: 'noReset',
                        initNumber: 1,
                        serialRules: [
                            {
                                type: 'serialNumber',
                                configValue: 4,
                                serialValue: '0001',
                                name: this.$t('流水号')
                            }
                        ]
                    },
                    val: '0001'
                })
            }
        },
        data () {
            return {
                localVal: cloneDeep(this.value),
                isRulesDialogShow: false,
                resetCycles: [
                    {
                        id: 'noReset',
                        name: this.$t('不重置')
                    },
                    {
                        id: 'year',
                        name: this.$t('按年重置')
                    },
                    {
                        id: 'month',
                        name: this.$t('按月重置')
                    },
                    {
                        id: 'week',
                        name: this.$t('按周重置')
                    },
                    {
                        id: 'day',
                        name: this.$t('按日重置')
                    }
                ]
            }
        },
        methods: {
            // 计算编号组件默认值
            computeSerialNumber () {
                this.localVal.val = this.localVal.config.serialRules.map((item) => {
                    return item.serialValue
                }).join('-')
            },
            // 初始值修改
            handleInitNumChange () {
                const serialRule = this.localVal.config.serialRules.find((item) => {
                    return item.type === 'serialNumber'
                })
                let initNumber = String(this.localVal.config.initNumber)
                const configValue = parseInt(serialRule.configValue)
                if (initNumber.length > configValue) {
                    this.localVal.config.initNumber = 1
                    initNumber = '1'
                    this.$bkMessage({ theme: 'warning', message: this.$t('初始值位数大于当前设置的流水号位数，已重置为1，请重新确认初始值') })
                }
                serialRule.serialValue = initNumber.padStart(configValue, '0')
                this.computeSerialNumber()
                this.change()
            },
            handleUpdateRules (config) {
                this.localVal.config = config
                this.computeSerialNumber()
                this.change()
            },
            change () {
                this.$emit('change', this.localVal)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .preview-box {
        position: relative;
        .text {
            line-height: 20px;
            font-size: 12px;
            color: #63656e;
        }
        .open-dialog-btn {
            position: absolute;
            top: -25px;
            right: 0;
            padding: 0;
            height: 20px;
            line-height: 20px;
        }
    }
</style>
