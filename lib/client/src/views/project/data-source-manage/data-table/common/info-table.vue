<template>
    <bk-form :model="form" :label-width="$store.state.Language === 'en' ? 126 : 82" ref="basicForm" v-if="isEdit" v-bkloading="{ isLoading }">
        <bk-form-item
            v-for="field in formFields"
            :key="field.property"
            :label="field.label"
            :property="field.property"
            :required="field.required"
            :rules="rules[field.property]"
            error-display-type="normal"
        >
            <bk-input
                v-if="field.property === 'tableName'"
                v-model="form[field.property]"
                :placeholder="field.placeholder"
                :maxlength="64"
                :show-word-limit="true"
                :disabled="field.disabled"
                class="section-item"
                v-enStyle="'width:650px'"
                @change="change"
            ></bk-input>
            <bk-input
                v-else
                v-model="form[field.property]"
                :disabled="field.disabled"
                class="section-item"
                v-enStyle="'width:650px'"
                @change="change"
            ></bk-input>
        </bk-form-item>
    </bk-form>
    <ul v-else class="info-table">
        <li
            v-for="field in formFields"
            :key="field.property"
            class="table-field"
        >
            <span class="field-label">{{ field.label }}：</span>
            <span v-tooltips="form[field.property]" class="field-value">{{ form[field.property] }}</span>
        </li>
    </ul>
</template>

<script lang="ts">
    import {
        defineComponent,
        toRef,
        ref,
        reactive,
        watch,
        onBeforeMount
    } from '@vue/composition-api'
    import { messageError } from '@/common/bkmagic'
    import store from '@/store'
    import router from '@/router'

    export default defineComponent({
        props: {
            isEdit: {
                type: Boolean,
                default: true
            },
            basicInfo: {
                type: Object,
                default: () => ({})
            }
        },

        setup (props, { emit }) {
            const currentRoute = router?.currentRoute
            const projectId = currentRoute?.params?.projectId
            const tableId = currentRoute?.query?.id
            let tableList = []
            const basicForm = ref(null)
            const form = reactive({ tableName: '', comment: '' })
            const isLoading = ref(false)
            const canEditTableName = currentRoute?.name === 'createTable'
            const formFields = [
                { label: window.i18n.t('form_表名'), required: true, disabled: !canEditTableName, property: 'tableName', placeholder: window.i18n.t('开头和结尾需是小写字母，中间可以是小写字母、连字符和下划线。长度为2-64') },
                { label: window.i18n.t('form_存储引擎'), disabled: true, property: 'engine' },
                { label: window.i18n.t('form_字符集'), disabled: true, property: 'character' },
                { label: window.i18n.t('备注'), property: 'comment' }
            ]
            // 校验规则
            const rules = {
                tableName: [
                    {
                        required: true,
                        message: window.i18n.t('表名是必填项'),
                        trigger: 'blur'
                    },
                    {
                        regex: /^[a-z][a-z-_]*[a-z]$/,
                        message: window.i18n.t('开头和结尾需是小写字母，中间可以是小写字母、连字符和下划线。长度为2-64'),
                        trigger: 'blur'
                    }, {
                        validator (val) {
                            return tableList.findIndex((table) => (table.tableName === val && +table.id !== +tableId)) <= -1
                        },
                        message: window.i18n.t('表名不能重复'),
                        trigger: 'blur'
                    }
                ]
            }

            watch(
                toRef(props, 'basicInfo'),
                (val) => {
                    Object.assign(form, val)
                },
                {
                    immediate: true,
                    deep: true
                }
            )

            const validate = () => {
                return new Promise((resolve, reject) => {
                    basicForm.value.validate().then(() => {
                        resolve(form)
                    }, validator => {
                        reject(new Error(`${validator.field}：${validator.content}`))
                    })
                })
            }

            const change = () => {
                emit('change')
            }

            const getAllTable = () => {
                if (!canEditTableName) return

                const params = { projectId }
                isLoading.value = true
                store.dispatch('dataSource/list', params).then((res) => {
                    tableList = res.list
                }).catch((err) => {
                    messageError(err.message || err)
                }).finally(() => {
                    isLoading.value = false
                })
            }

            onBeforeMount(getAllTable)

            return {
                basicForm,
                validate,
                form,
                formFields,
                isLoading,
                rules,
                change
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";

    .section-item {
        width: 483px;
    }
    .info-table {
        &:after {
            content: '';
            display: table;
            clear: both;
        }
        .table-field {
            float: left;
            line-height: 36px;
            font-size: 12px;
            width: 260px;
            margin-right: 10px;
            display: flex;
            .field-label {
                width: 60px;
                display: inline-block;
            }
            .field-value {
                width: 200px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            &:nth-child(even) {
                width: calc(100% - 280px);
            }
        }
    }
</style>
