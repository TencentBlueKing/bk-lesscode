<template>
    <bk-popover
        placement="top-end"
        class="select-field-main"
        ext-cls="g-popover-empty-padding select-field-popover"
        :disabled="disableDelete"
        :tippy-options="{
            appendTo: 'parent',
            arrow: false
        }"
    >
        <section class="select-field">
            <span
                class="field-function"
                v-if="functionName"
            >
                {{ functionName }}
            </span>
            <span
                class="field-title"
                v-bk-tooltips="{
                    content: distinct ? $t('去除（DISTINCT）') : $t('点击添加去重（DISTINCT）'),
                    disabled: disableDistinct
                }"
                @click="handleToggleDistinct"
            >
                {{ $t('字段') }} <template
                    v-if="distinct"
                >
                    （DISTINCT）
                </template>
            </span>
            <bk-select
                :class="{
                    'field-main': true,
                    'is-error': validateStatus.isError
                }"
                :value="fieldId"
                @change="handleChange"
            >
                <bk-option
                    v-for="column in columns"
                    :key="column.columnId"
                    :id="column.columnId"
                    :name="column.name"
                >
                </bk-option>
            </bk-select>
            <bk-input
                v-if="displayAlias"
                class="field-alias"
                :placeholder="$t('别名')"
                :value="alias"
                @change="handleChangeAlias"
            >
            </bk-input>
            <i
                v-if="validateStatus.isError"
                v-bk-tooltips="{ content: validateStatus.message, maxWidth: 400 }"
                :class="{
                    'bk-icon icon-exclamation-circle-shape tooltips-icon': true,
                    'with-alias': displayAlias
                }"
            ></i>
        </section>
        <div slot="content">
            <i
                class="bk-drag-icon bk-drag-delet"
                @click="handleDelete"
            ></i>
        </div>
    </bk-popover>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType,
        watch,
        computed,
        ref,
        onBeforeUnmount
    } from '@vue/composition-api'
    import validateContainer from '../composables/validate'
    import {
        isEmpty
    } from 'shared/util'

    export interface IColumn {
        name: string
        columnId: string
    }

    export interface IField {
        tableName: string
        fieldId: string
        functionName: string
        alias: string,
        distinct: boolean
    }

    export default defineComponent({
        props: {
            fieldId: {
                type: [String, Number]
            },
            distinct: {
                type: Boolean,
                default: false
            },
            functionName: {
                type: String,
                default: ''
            },
            alias: {
                type: String,
                default: ''
            },
            columns: {
                type: Array as PropType<IColumn[]>
            },
            disableDistinct: {
                type: Boolean,
                default: false
            },
            disableDelete: {
                type: Boolean,
                default: false
            },
            showAlias: {
                type: Boolean,
                default: false
            },
            customValidate: {
                type: Function as PropType<(IField) => string>,
                default: () => {}
            }
        },

        emits: ['change', 'delete'],

        setup (props, { emit }) {
            const validateStatus = ref({
                message: '',
                isError: false
            })

            const displayAlias = computed(() => {
                return props.showAlias && props.fieldId !== '*'
            })

            const handleToggleDistinct = () => {
                if (!props.disableDistinct) {
                    const distinct = !props.distinct
                    emit('change', { distinct })
                }
            }

            const handleChange = (fieldId) => {
                // * 不能有别名
                if (fieldId === '*') {
                    handleChangeAlias('')
                }
                if (!isEmpty(fieldId)) {
                    validateStatus.value.isError = false
                }
                emit('change', { fieldId })
            }

            const validate = () => {
                let message = ''

                if (isEmpty(props.fieldId)) {
                    message = window.i18n.t('字段不能为空')
                } else if (props.customValidate) {
                    message = props?.customValidate?.({ functionName: props.functionName, fieldId: props.fieldId })
                }

                if (message) {
                    validateStatus.value.isError = true
                    validateStatus.value.message = message
                    return Promise.reject(new Error(message))
                } else {
                    validateStatus.value.isError = false
                    validateStatus.value.message = ''
                    return Promise.resolve()
                }
            }

            const handleChangeAlias = (alias) => {
                emit('change', { alias })
            }

            const handleDelete = () => {
                emit('delete')
            }

            watch(
                () => props.columns,
                () => {
                    if (!props.columns?.find(column => column.columnId === props.fieldId)) {
                        handleChange('')
                    }
                },
                {
                    immediate: true,
                    deep: true
                }
            )

            // 本组件需要注册校验方法
            validateContainer.register(validate)
            onBeforeUnmount(() => validateContainer.unRegister(validate))

            return {
                validateStatus,
                displayAlias,
                handleToggleDistinct,
                handleChange,
                validate,
                handleChangeAlias,
                handleDelete
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .select-field {
        display: flex;
        align-items: center;
        width: 100%;
        font-size: 12px;
        position: relative;
        &:hover {
            .field-title {
                background: #EAEBF0;
            }
        }
        .field-function {
            background: #FFFFFF;
            border: 1px solid #C4C6CC;
            border-radius: 2px;
            line-height: 30px;
            padding: 0 12px;
            color: #E76E0B;
            margin-right: -1px;
        }
        .field-title {
            display: inline-block;
            cursor: pointer;
            background: #F5F7FA;
            border: 1px solid #C4C6CC;
            border-radius: 2px 0px 0px 2px;
            line-height: 30px;
            padding: 0 12px;
            min-width: 65px;
            text-align: center;
        }
        .field-main {
            flex: 1;
            background: #fff;
            margin-left: -1px;
            max-width: calc(100% - 65px);
            z-index: 5;
            &.is-error {
                border-color: #ff5656;
            }
        }
        .field-alias {
            margin-left: -1px;
            width: 80px;
            &.control-active {
                z-index: 10;
            }
        }
        .icon-exclamation-circle-shape {
            cursor: pointer;
            position: absolute;
            z-index: 10;
            right: 8px;
            top: 8px;
            color: #ea3636;
            &.with-alias {
                right: 88px;
            }
        }
    }
    /deep/ .select-field-popover {
        .tippy-tooltip {
            opacity: 0.3;
            border-radius: 2px;
            width: 20px;
            height: 20px;
            line-height: 20px;
            padding: 0 3px;
            &:hover {
                opacity: 0.6;
            }
        }
        .bk-drag-delet {
            cursor: pointer;
            font-size: 14px;
            margin: 4px;
        }
    }
    .select-field-main {
        /deep/ .bk-tooltip-ref {
            width: 100%;
        }
    }
</style>
