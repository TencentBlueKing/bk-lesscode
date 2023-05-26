<template>
    <section class="advanced-config">
        <div class="form-config-area">
            <div class="form-section">
                <h4>{{ $t('基础设置') }}</h4>
                <bk-form ref="advancedForm" class="section-content" form-type="vertical" :model="advancedData" :rules="rules">
                    <bk-form-item :label="$t('form_流程名称')" :required="true">
                        <bk-input v-model="advancedData.name"></bk-input>
                    </bk-form-item>
                    <div class="multiple-form-wrapper">
                        <bk-form-item :label="$t('form_撤回方式')" :class="{ 'half-row-form': advancedData.revoke_config.type === 3 }">
                            <bk-select
                                v-model="advancedData.revoke_config.type"
                                :clearable="false"
                                @selected="onSelectRevokeType"
                                :disabled="serviceData.is_builtin">
                                <bk-option v-for="item in revokeTypeList" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                            </bk-select>
                        </bk-form-item>
                        <!-- 指定可撤回节点 -->
                        <bk-form-item v-if="advancedData.revoke_config.type === 3" class="half-row-form">
                            <bk-select
                                v-model="advancedData.revoke_config.state"
                                :clearable="false"
                                :disabled="flowNodesLoading"
                                :loading="flowNodesLoading">
                                <bk-option v-for="item in flowNodes" :key="item.id" :id="item.id" :name="item.name || $t('新增节点')">
                                </bk-option>
                            </bk-select>
                        </bk-form-item>
                    </div>
                    <bk-form-item :label="$t('form_通知方式')" style="margin-top: 15px;">
                        <bk-checkbox-group
                            :value="advancedData.notify.map(item => item.type)"
                            @change="onSelectNotifyType">
                            <bk-checkbox
                                v-for="item in notifyTypeList"
                                :key="item.type"
                                :value="item.type"
                                :disabled="serviceData.is_builtin">
                                {{ item.name }}
                            </bk-checkbox>
                        </bk-checkbox-group>
                    </bk-form-item>
                    <div class="multiple-form-wrapper">
                        <bk-form-item
                            v-if="advancedData.notify.length > 0"
                            :label="$t('form_通知频率')"
                            :class="{ 'half-row-form': advancedData.notify_rule === 'RETRY' }">
                            <bk-select v-model="advancedData.notify_rule" :clearable="false">
                                <bk-option v-for="item in notifyFrequencies" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                            </bk-select>
                        </bk-form-item>
                        <bk-form-item v-if="advancedData.notify_rule === 'RETRY'" class="half-row-form">
                            <bk-select v-model="advancedData.notify_freq" :clearable="false">
                                <bk-option v-for="item in frequencyList" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                            </bk-select>
                        </bk-form-item>
                    </div>
                </bk-form>
            </div>
            <!-- <div class="extend-setting-btn">
                <span class="trigger-area" @click="extendSettingOpen = !extendSettingOpen">
                    高级配置
                    <i :class="['bk-icon', 'icon-angle-double-down', { opened: extendSettingOpen }]"></i>
                </span>
            </div>
            <template v-if="extendSettingOpen">
                <div class="form-section">
                    <h4>开放设置</h4>
                    <bk-form class="section-content" form-type="vertical">
                        <bk-form-item class="display-checkbox" label="显示设置">
                            <bk-checkbox
                                v-model="advancedData.show_all_workflow"
                                :disabled="serviceData.is_builtin">
                                在【全部流程】中显示
                            </bk-checkbox>
                            <bk-checkbox
                                v-model="advancedData.show_my_create_workflow"
                                :disabled="serviceData.is_builtin">
                                在【我发起的】中显示
                            </bk-checkbox>
                        </bk-form-item>
                    </bk-form>
                </div>
                <div class="form-section">
                    <h4>触发器</h4>
                    <div class="section-content"></div>
                </div>
            </template> -->
        </div>
        <div class="action-wrapper">
            <bk-button
                theme="primary"
                :loading="advancedPending"
                @click="handleSave"
                :disabled="serviceData.is_builtin">
                {{ $t('提交') }} </bk-button>
            <bk-button @click="$router.push({ name: 'flowList' })">{{ $t('取消') }}</bk-button>
        </div>
    </section>
</template>
<script>
    import { mapState } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'

    export default {
        name: 'AdvancedConfig',
        props: {
            appId: {
                type: String,
                default: ''
            },
            serviceData: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                advancedData: cloneDeep(this.serviceData),
                advancedDataLoading: false,
                advancedPending: false,
                flowNodesLoading: false,
                flowNodes: [],
                extendSettingOpen: false,
                revokeTypeList: [
                    { id: 0, name: window.i18n.t('不支持撤回') },
                    { id: 1, name: window.i18n.t('任何节点，提单人都可撤回单据') },
                    { id: 2, name: window.i18n.t('提单后，单据未被处理流转前，提单人可以撤回') },
                    { id: 3, name: window.i18n.t('指定节点前可以撤回') }
                ],
                notifyTypeList: [
                    { type: 'WEIXIN', name: window.i18n.t('企业微信') },
                    { type: 'EMAIL', name: window.i18n.t('邮件') },
                    { type: 'SMS', name: window.i18n.t('SMS短信') }
                ],
                notifyFrequencies: [
                    { id: 'ONCE', name: window.i18n.t('首次通知，以后不再通知') },
                    { id: 'RETRY', name: window.i18n.t('首次通知后，次日起每天定时通知') }
                ],
                frequencyList: this.getFrequencyList(),
                rules: {
                    name: [
                        {
                            required: true,
                            message: window.i18n.t('流程名称为必填项'),
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        computed: {
            ...mapState('nocode/flow', ['flowConfig'])
        },
        created () {
            if (this.serviceData.revoke_config.type === 3) {
                this.getFlowNodes()
            }
        },
        methods: {
            async getFlowNodes () {
                try {
                    this.flowNodesLoading = true
                    const res = await this.$store.dispatch('nocode/flow/getFlowNodes', { workflow: this.advancedData.workflow_id, page_size: 1000 })
                    this.flowNodes = res.items.filter(node => !node.is_builtin && !['ROUTER-P', 'COVERAGE'].includes(node.type))
                } catch (e) {
                    console.error(e)
                } finally {
                    this.flowNodesLoading = false
                }
            },
            getFrequencyList () {
                const list = []
                for (let i = 0; i <= 23; i++) {
                    list.push({
                        id: i * 3600,
                        name: `${i < 10 ? '0' : ''}${i}:00`
                    })
                }
                return list
            },
            onSelectRevokeType (val) {
                if (val === 3) {
                    this.getFlowNodes()
                } else {
                    this.advancedData.revoke_config.state = 0
                }
            },
            onSelectNotifyType (val) {
                const notify = []
                val.forEach((type) => {
                    const notifyItem = this.notifyTypeList.find(item => item.type === type)
                    notify.push(notifyItem)
                })
                this.advancedData.notify = notify
                this.advancedData.notify_rule = val.length > 0 ? 'ONCE' : 'NONE'
            },
            // 保存流程配置数据
            async updateItsmServiceData () {
                const {
                    id,
                    notify,
                    notify_freq,
                    notify_rule,
                    revoke_config,
                    show_all_workflow,
                    show_my_create_workflow
                } = this.advancedData
                const serviceConfig = {
                    workflow_config: {
                        notify,
                        notify_freq,
                        notify_rule,
                        revoke_config,
                        is_revocable: revoke_config.type !== 0,
                        show_all_workflow,
                        show_my_create_workflow,
                        // 以下为流程服务必需字段
                        is_supervise_needed: false,
                        supervise_type: 'EMPTY',
                        supervisor: '',
                        is_auto_approve: false
                    },
                    // 以下为流程服务必需字段
                    can_ticket_agency: false,
                    display_type: 'INVISIBLE'
                }
                return new Promise((resolve, reject) => {
                    this.$store.dispatch('nocode/flow/updateServiceData', { id, data: serviceConfig })
                        .then(() => {
                            resolve()
                        }).catch((error) => {
                            const h = this.$createElement
                            this.$bkMessage({
                                theme: 'error',
                                ellipsisLine: 3,
                                message: error.message
                            })
                            reject(error.message)
                        })
                })
            },
            handleSave () {
                this.$refs.advancedForm.validate().then(async () => {
                    try{
                        this.advancedPending = true
                        await this.updateItsmServiceData()
                        await this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, flowName: this.advancedData.name })
                        this.$router.push({ name: 'flowList' })
                    } catch (e) {
                        console.error(e.message || e)
                    } finally {
                        this.advancedPending = false
                    }
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
.advanced-config {
  position: relative;
  height: 100%;
  overflow: auto;
}
.form-config-area {
  padding: 24px 24px 0;
  .form-section {
    margin-bottom: 16px;
    padding: 24px;
    background: #ffffff;
    box-shadow: 0 2px 4px 0 rgba(25, 25, 41, 0.05);
    & > h4 {
      margin: 0 0 16px;
      height: 22px;
      line-height: 22px;
      font-size: 14px;
      color: #313238;
    }
    .section-content {
        margin-left: 106px;
        &.bk-form {
            width: 680px;
            >>> .bk-label {
                width: auto !important;
            }
        }
    }
    .bk-form-item {
        width: 100%;
        &.half-row-form {
            width: calc(50% - 2px);
        }
    }
  }
  .multiple-form-wrapper {
    display: flex;
    align-items: end;
    justify-content: space-between;
    margin-top: 15px;
  }
  .extend-setting-btn {
    margin-bottom: 8px;
    padding-left: 130px;
    .trigger-area {
      font-size: 14px;
      height: 22px;
      line-height: 22px;
      color: #3a84ff;
      cursor: pointer;
      user-select: none;
      & > i {
        display: inline-block;
        font-size: 18px;
        transition: transform 0.2s ease-in-out;
        &.opened {
          transform: rotate(-180deg);
        }
      }
    }
  }
  .bk-form {
    /deep/ .bk-form-checkbox {
      margin-right: 24px;
    }
  }
}

.action-wrapper {
    margin: 32px 0;
    padding: 0 24px;
    overflow: hidden;
    .bk-button {
        margin-right: 4px;
        min-width: 88px;
    }
}
</style>
