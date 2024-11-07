<template>
    <div class="notify-type-wrapper">
        <bk-form
            class="notify-form-area"
            :label-width="140">
            <bk-form-item :label="$t('通知方式')">
                <bk-table class="notify-type-table" :data="notifyTableData">
                    <bk-table-column
                        v-for="(col, index) in NOTIFY_LIST"
                        :key="index"
                        :render-header="getNotifyTypeHeader">
                        <template slot-scope="props">
                            <bk-switcher
                                v-if="col.type"
                                size="small"
                                theme="primary"
                                :value="isSelected(props.$index, col.type)"
                                @change="handleNotifyTypeChange(props.$index, col.type, $event)" />
                                <span v-else>{{ props.$index === 0 ? $t('成功') : $t('失败') }}</span>
                        </template>
                    </bk-table-column>
                </bk-table>
            </bk-form-item>
            <bk-form-item :label="$t('通知人')">
                <member-select
                    class="receivers-selector"
                    :value="receivers"
                    :placeholder="$t('请选择通知人')"
                    @change="handleReceiversChange" />
            </bk-form-item>
        </bk-form>
    </div>
  </template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import WeixinIcon from '@/images/notify-type-icons/weixin.svg'
    import RtxIcon from '@/images/notify-type-icons/rtx.svg'
    import MailIcon from '@/images/notify-type-icons/mail.svg'
    import SmsIcon from '@/images/notify-type-icons/sms.svg'
    import VoiceIcon from '@/images/notify-type-icons/voice.svg'
    import MemberSelect from '@/components/flow-form-comp/form/components/memberSelect.vue'


    const NOTIFY_LIST = [
        {
            text: '任务状态'
        },
        {
            label: '微信',
            type: 'weixin',
            icon: WeixinIcon
        },
        {
            label: '企业微信',
            type: 'rtx',
            icon: RtxIcon
        },
        {
            label: '邮件',
            type: 'mail',
            icon: MailIcon
        },
        {
            label: '短信',
            type: 'sms',
            icon: SmsIcon
        },
        {
            label: '语音',
            type: 'voice',
            icon: VoiceIcon
        }
    ]

    export default {
        components: {
            MemberSelect
        },
        props: {
            notifyConfig: {
                type: Object,
                default: () => ({
                    notifyType: {
                        fail: [],
                        success: []
                    },
                    receivers: ''
                })
            }
        },
        data () {
            return {
                notifyTableData: [[],[]],
                NOTIFY_LIST,
                receivers: []
            }
        },
        watch: {
            notifyConfig: {
                handler (val) {
                    this.receivers = val.receivers.length > 0 ? val.receivers.split(',') : []
                },
                immediate: true
            }
        },
        methods: {
            getNotifyTypeHeader(h, data) {
                const col = NOTIFY_LIST[data.$index]
                if (col.type) {
                    return h('div', { class: 'notify-table-heder' }, [
                        h('img', { class: 'notify-icon', attrs: { src: col.icon } }, []),
                        h('p', {
                            class: 'label-text',
                            directives: [{
                                name: 'bk-overflow-tips'
                            }]
                        }, [col.label])
                    ])
                }
                return h('p', {
                    class: 'label-text',
                    directives: [{
                        name: 'bk-overflow-tips'
                    }]
                }, [ col.text ])
            },
            isSelected (row, type) {
                return this.notifyConfig.notifyType[row === 0 ? 'success' : 'fail'].includes(type)
            },
            handleNotifyTypeChange(row, type, val) {
                const notifyType = cloneDeep(this.notifyConfig.notifyType)
                const types = notifyType[row === 0 ? 'success' : 'fail']
                if (val) {
                    if (!types.includes(type)) {
                        types.push(type)
                    }
                } else {
                    const index = types.findIndex(item => item === type)
                    if (index > -1) {
                        types.splice(index, 1)
                    }
                }
                this.$emit('change', { ...this.notifyConfig, notifyType })
            },
            handleReceiversChange (val) {
                const receivers = val.join(',')
                this.$emit('change', { ...this.notifyConfig, receivers })
            },
        }
    }
</script>
<style lang="postcss" scoped>
    .notify-type {
        width: 100%;
    }
    .notify-type-table {
        min-height: 86px;
        /deep/ .notify-table-heder {
            display: flex;
            align-items: center;
            .notify-icon {
                margin-right: 4px;
                width: 18px;
            }
        }
    }
    .receivers-selector {
        width: 100%;
    }
</style>
