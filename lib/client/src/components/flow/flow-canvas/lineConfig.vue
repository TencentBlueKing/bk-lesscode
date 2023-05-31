<template>
    <div class="line-config">
        <div class="config-content-container">
            <div class="node-wrapper">
                <node-template class="small" :node="line.sNode" :single="true" :editable="false"></node-template>
                <div class="node-connector">
                    <span class="label-name"> {{ formData.name || '--' }} </span>
                </div>
                <node-template class="small" :node="line.tNode" :single="true" :editable="false"></node-template>
            </div>
            <lc-form ref="lineForm" form-type="vertical" :label-width="200" :model="formData" :rules="rules">
                <lc-form-item :label="$t('form_关系名称')" error-display-type="normal" :property="'name'" :required="true">
                    <bk-input v-model.trim="formData.name" maxlength="120" :placeholder="$t('请输入关系名称')"> </bk-input>
                </lc-form-item>
                <template v-if="line.canSetCondition">
                    <lc-form-item :label="$t('form_流转条件')" :required="true">
                        <bk-select
                            v-model="formData.condition_type"
                            :clearable="false"
                            :searchable="false"
                            @selected="handleSelectConditionType">
                            <bk-option id="default" :name="$t('默认')"> </bk-option>
                            <bk-option id="by_field" :name="$t('字段判断')"> </bk-option>
                        </bk-select>
                    </lc-form-item>
                    <lc-form-item
                        v-if="formData.condition_type === 'by_field'"
                        :label="$t('form_条件组件关系')"
                        :desc="$t('当所有条件组都满足且/或的条件时，节点才会流转')"
                        desc-type="icon">
                        <line-condition ref="lineCondition" :condition="formData.condition" :line-id="line.id"></line-condition>
                    </lc-form-item>
                </template>
            </lc-form>
        </div>
        <div class="btns-wrapper">
            <bk-button theme="primary" :loading="savePending" :disabled="savePending" @click="onSaveClick">{{ $t('确认') }}</bk-button>
            <bk-button :loading="deletePending" :disabled="savePending" @click="$emit('delete')">{{ $t('删除') }}</bk-button>
            <bk-button :disabled="savePending || deletePending" @click="$emit('close')">{{ $t('取消') }}</bk-button>
        </div>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import NodeTemplate from './nodeTemplate.vue'
    import LineCondition from './lineCondition.vue'

    export default {
        name: 'LineConfig',
        components: {
            NodeTemplate,
            LineCondition
        },
        props: {
            line: {
                type: Object,
                default: () => ({})
            },
            savePending: {
                type: Boolean,
                default: false
            },
            deletePending: {
                type: Boolean,
                default: false
            }
        },
        data () {
            const { name, condition_type, condition } = this.line
            return {
                formData: {
                    name,
                    condition_type,
                    condition: cloneDeep(condition)
                },
                templateListLoading: false,
                templateList: [],
                rules: {
                    name: [
                        {
                            required: true,
                            message: this.$t('必填项'),
                            trigger: 'blur'
                        }
                    ]
                }
            }
        },
        watch: {
            line (val) {
                const { name, condition_type, condition } = val
                this.formData = {
                    name,
                    condition_type,
                    condition: cloneDeep(condition)
                }
            }
        },
        methods: {
            handleSelectConditionType (val) {
                if (val === 'default') {
                    this.formData.condition = {}
                } else {
                    this.formData.condition = {
                        type: 'and',
                        expressions: [
                            {
                                type: 'and',
                                expressions: [
                                    {
                                        key: '',
                                        condition: '',
                                        value: '',
                                        type: 'STRING',
                                        source: 'field'
                                    }
                                ]
                            }
                        ]
                    }
                }
            },
            onSaveClick () {
                let conditionValid = true
                if (this.formData.condition_type === 'by_field') {
                    conditionValid = this.$refs.lineCondition.validate()
                }
                this.$refs.lineForm.validate().then(() => {
                    if (conditionValid) {
                        if (this.$refs.lineCondition) {
                            const condition = this.$refs.lineCondition.getData()
                            this.formData.condition = condition
                        }
                        const { workflow, from_state, to_state, id } = this.line
                        const { name, condition_type, condition } = this.formData
                        const params = {
                            id,
                            data: { workflow, from_state, to_state, name, condition_type, condition }
                        }
                        window.leaveConfirm = false
                        this.$emit('save', params)
                    }
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
.line-config {
  height: calc(100vh - 60px);
}
.config-content-container {
  padding: 24px;
  height: calc(100% - 48px);
  overflow: auto;
}
.node-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
  padding: 0 16px;
  height: 70px;
  background: #fafbfd;
  text-align: center;
}
.node-connector {
  position: relative;
  width: 230px;
  height: 20px;
  &:before {
    content: '';
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    width: 100%;
    height: 1px;
    background: #c4c6cc;
  }
  &:after {
    content: '';
    position: absolute;
    top: 3px;
    right: 0px;
    width: 0;
    height: 0;
    border-style: solid;
    border-width: 7px 0 7px 8px;
    border-color: transparent transparent transparent #c4c6cc;
  }
  .label-name {
    position: absolute;
    left: 50%;
    top: 0;
    transform: translateX(-50%);
    padding: 0 15px;
    height: 20px;
    max-width: 150px;
    line-height: 18px;
    color: #979ba5;
    font-size: 12px;
    background: #fff;
    border: 1px solid #c4c6cc;
    border-radius: 11px;
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
    z-index: 2;
  }
}
.process-node-item.small {
    >>> .flow-node {
        width: 210px;
        .node-name-area {
            width: 164px;
        }
    }
}
.btns-wrapper {
  padding: 0 24px;
  height: 48px;
  line-height: 48px;
  background: #fafbfd;
  .bk-button {
    margin-right: 4px;
    min-width: 88px;
  }
}
</style>
