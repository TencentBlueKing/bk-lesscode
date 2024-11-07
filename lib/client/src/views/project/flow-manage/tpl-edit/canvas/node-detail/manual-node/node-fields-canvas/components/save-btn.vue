<template>
    <bk-popover
        ref="popover"
        trigger="click"
        theme="light"
        width="380"
        :disabled="!!formId || !editable">
        <bk-button
            v-bk-tooltips="{ content: $t('复用表单模式下表单不可编辑'), disabled: editable, placement: 'bottom-end' }"
            theme="primary"
            :loading="pending"
            :class="['save-btn', { disabled: !editable }]"
            @click="handleClick">
            {{ $t('保存') }}
        </bk-button>
        <div slot="content">
            <bk-form
                slot="content"
                ref="tableNameForm"
                class="table-name-form"
                form-type="vertical"
                :model="formData"
                :rules="rules">
                <bk-form-item :label="$t('数据表表名')" property="name">
                    <bk-input
                        v-model="formData.name"
                        :placeholder="$t('开头和结尾需是小写字母，中间可以是小写字母、连字符和下划线。长度为2-64')"
                        :maxlength="64"
                        :show-word-limit="true" />
                </bk-form-item>
            </bk-form>
            <p class="tips">{{ $t('数据表表名保存后不可再次修改') }}</p>
            <div class="action-btns">
                <bk-button theme="primary" size="small" @click="handleCreateConfirm">{{ $t('确定') }}</bk-button>
                <bk-button size="small" @click="handleCreateCancel">{{ $t('取消') }}</bk-button>
            </div>
        </div>
    </bk-popover>
</template>
<script>
    import { defineComponent, ref } from 'vue'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import { uuid } from '@/common/util'

    export default defineComponent ({
        name: 'SaveBtn',
        props: {
            editable: {
                type: Boolean,
                default: true
            },
            tplId: Number,
            nodeId: String,
            fields: {
                type: Array,
                default: () => []
            },
            formId: Number,
            formName: String,
            formType: String,
            tableName: String
        },
        setup (props, { emit }) {
            const store = useStore()
            const route = useRoute()

            const defaultNewTableName = `manual_node_${uuid(8, 16, true)}`
            const rules = {
                name: [
                    {
                        required: true,
                        message: window.i18n.t('表名是必填项'),
                        trigger: 'blur'
                    },
                    {
                        regex: /^[a-z][a-z-_]*[a-z]$/,
                        message: window.i18n.t('开头和结尾需是小写字母，中间可以是小写字母、连字符和下划线。长度为2-64'),
                        trigger: 'blur'
                    }
                ]
            }

            const formData = ref({
                name: defaultNewTableName
            })
            const popover = ref()
            const tableNameForm = ref()
            const pending = ref(false)

            const handleClick = async() => {
                if (!props.editable) return

                if (props.formId) {
                    saveForm(props.tableName)
                }
            }

            const handleCreateConfirm = () => {
                tableNameForm.value.validate().then(() => {
                    saveForm(formData.value.name)
                    popover.value.hideHandler()
                })
            }

            const handleCreateCancel = () => {
                popover.value.hideHandler()
                formData.value.name = defaultNewTableName
            }

            const saveForm = async(tableName) => {
                const fieldList = props.fields.map(item => {
                    const fieldItem = { ...item }
                    delete fieldItem.unsaved
                    return fieldItem
                })
                const params = {
                    tableName,
                    content: fieldList,
                    formName: props.formName,
                    componentId: `flow-tpl-${props.tplId}-${props.nodeId}`,
                    projectId: route.params.projectId
                }
                try {
                    pending.value = true
                    let formId = props.formId
                    if (props.formId) {
                        await store.dispatch('form/updateForm', { ...params, id: formId })
                    } else {
                        const res = await store.dispatch('form/createForm', params)
                        formId = res.id
                    }

                    emit('saved', { formId, formType: props.formType, tableName })
                } catch (e) {
                    console.error(e)
                } finally {
                    pending.value = false
                }
            }

            return {
                pending,
                rules,
                formData,
                popover,
                tableNameForm,
                handleClick,
                handleCreateConfirm,
                handleCreateCancel
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .save-btn {
        min-width: 88px;
        &.disabled {
            background-color: #dcdee5;
            border-color: #dcdee5;
            color: #fff;
        }
    }
    .table-name-form {
        margin-top: 10px;
    }
    .tips {
        margin-top: 8px;
        font-size: 12px;
        color: #c4c6cc;
    }
    .action-btns {
        margin: 24px 0 10px;
        text-align: right;
        .bk-button {
            margin-left: 8px;
        }
    }
</style>