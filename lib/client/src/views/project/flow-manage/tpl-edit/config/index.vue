<template>
    <section class="flow-tpl-config">
        <div class="config-form-wrapper">
            <bk-form
                ref="configForm"
                class="config-form-list"
                :model="formData"
                :label-width="140"
                :rules="rules">
                <section class="form-section">
                    <h4>{{ $t('基础') }}</h4>
                    <bk-form-item
                        :property="'name'"
                        :label="$t('流程名称')"
                        :required="true">
                        <bk-input
                            ref="nameInput"
                            v-model.trim="formData.name"
                            :placeholder="$t('请输入流程模板名称')"
                            :show-word-limit="true" />
                    </bk-form-item>
                </section>
                <section class="form-section">
                    <h4>
                        <span>{{ $t('通知') }}</span>
                        <span class="tip-desc">{{ $t('选择通知方式后，将默认通知到任务执行人') }}</span>
                    </h4>
                    <NotifyTypeConfig :notifyConfig="formData.notifyConfig" @change="handleNotifyChange" />
                </section>
                <section class="form-section">
                    <h4>{{ $t('其他') }}</h4>
                    <bk-form-item
                        property="summary"
                        :label="$t('备注')">
                        <bk-input
                            v-model.trim="formData.summary"
                            type="textarea"
                            :rows="5"
                            :placeholder="$t('请输入流程模板备注信息')" />
                    </bk-form-item>
                </section>
            </bk-form>
        </div>
        <div class="action-wrapper">
            <bk-button
                theme="primary"
                :loading="pending"
                @click="handleSave">
                {{ $t('提交') }} </bk-button>
            <bk-button @click="$router.push({ name: 'flowTplList' })">{{ $t('取消') }}</bk-button>
        </div>
    </section>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import NotifyTypeConfig from './notify-type-config.vue'

    export default {
        name: 'FlowTplConfig',
        components: {
            NotifyTypeConfig
        },
        props: {
            tplDetail: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                formData: {
                    name: '',
                    notifyConfig: {
                        notifyType: {
                            fail: [],
                            success: []
                        },
                        receivers: ''
                    },
                    summary: ''
                },
                pending: false,
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
        watch: {
            tplDetail: {
                handler (val) {
                    const { name, notifyConfig, summary } = val
                    this.formData = {
                        name,
                        summary,
                        notifyConfig: cloneDeep(notifyConfig),
                    }
                },
                immediate: true
            }
        },
        methods: {
            handleNotifyChange (val) {
                this.formData.notifyConfig = val
            },
            async handleSave () {
                await this.$refs.configForm.validate()
                const { name, notifyConfig, summary } = this.formData
                const data = {
                    ...this.tplDetail,
                    name,
                    summary,
                    notifyConfig
                }
                this.$store.dispatch('flow/tpl/updateFlowTpl', data)
                this.$bkMessage({
                    theme: 'success',
                    message: '保存成功'
                })
                this.$router.push({ name: 'flowTplList' })
            }
        }
    }
</script>
<style lang="postcss" scoped>
.flow-tpl-config {
  position: relative;
  height: 100%;
  overflow: auto;
}
.config-form-wrapper {
  margin: 24px;
  padding: 24px;
  background: #ffffff;
}
.config-form-list {
    width: 740px;
}
.form-section {
    margin-bottom: 30px;
    & > h4 {
        margin: 0 0 24px 0;
        padding-bottom: 10px;
        color: #313238;
        font-weight: bold;
        font-size: 14px;
        border-bottom: 1px solid #cacedb;
    }
    .tip-desc {
        font-size: 12px;
        font-weight: normal;
        margin-left: 20px;
        color: #979ba5;
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
