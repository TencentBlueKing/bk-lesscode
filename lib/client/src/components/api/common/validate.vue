<template>
    <section class="validate-main">
        <bk-checkbox
            class="mr-5"
            :value="scheme.validate && scheme.validate.enable"
            @change="toggleEnable"
        />
        <span
            class="mr-5 link-text"
            @click="handleClick"
        >{{ $t('配置') }}</span>
        <span
            v-if="scheme.validate && scheme.validate.rules && scheme.validate.rules.length"
            class="validate-num"
        >
            {{ scheme.validate.rules.length }}
        </span>
        <bk-dialog
            v-model="isShow"
            width="700"
            header-position="left"
            @confirm="triggerUpdate"
        >
            <template #header>
                {{ $t('添加参数自定义规则') }}
            </template>
            <bk-form
                v-for="renderRule, index in copyValidate.rules"
                :key="index"
                class="validate-item"
                form-type="vertical"
            >
                <i class="bk-drag-icon bk-drag-delet validate-delete" @click="handleMinus(index)"></i>
                <bk-form-item
                    :label="$t('校验方式')"
                    :required="true"
                    property="type"
                >
                    <bk-select
                        :value="renderRule.type"
                        @change="(type) => handleTypeChange(type, index)"
                    >
                        <bk-option
                            v-for="option in types"
                            :key="option.id"
                            :id="option.id"
                            :name="option.name"
                        />
                    </bk-select>
                </bk-form-item>
                <bk-form-item
                    v-if="renderRule.type !== API_VALIDATE_TYPES.REQUIRE"
                    property="value"
                    :label="getLabel(renderRule.type)"
                    :required="true"
                >
                    <bk-input
                        v-if="[API_VALIDATE_TYPES.MIN_LENGTH, API_VALIDATE_TYPES.MAX_LENGTH, API_VALIDATE_TYPES.REGEXP].includes(renderRule.type)"
                        :type="renderRule.type === API_VALIDATE_TYPES.REGEXP ? 'text' : 'number'"
                        :value="renderRule.value"
                        @change="(value) => handleUpdate({ value }, index)"
                    />
                    <choose-function
                        v-if="renderRule.type === API_VALIDATE_TYPES.FUNCTION"
                        :show-add-params="false"
                        :choosen-function="{ methodCode: renderRule.value }"
                        @change="({ methodCode: value }) => handleUpdate({ value }, index)"
                        @clear="handleUpdate({ value: '' }, index)"
                    />
                </bk-form-item>
                <bk-form-item
                    :label="$t('报错提示信息')"
                    :required="true"
                    property="message"
                >
                    <bk-input
                        :value="renderRule.message"
                        @change="(message) => handleUpdate({ message }, index)"
                    />
                </bk-form-item>
            </bk-form>
            <span class="plus-rule" @click="handlePlus">
                <i class="bk-icon icon-plus"></i>
                {{ $t('添加规则') }}
            </span>
        </bk-dialog>
    </section>
</template>

<script>
    import {
        ref
    } from '@vue/composition-api'
    import {
        API_VALIDATE_TYPES
    } from 'shared/api'
    import ChooseFunction from '@/components/methods/choose-function/index.vue'

    export default {
        components: {
            ChooseFunction
        },

        props: {
            scheme: Object
        },

        emit: ['change'],

        setup (props, { emit }) {
            const defaultValidate = {
                enable: false,
                rules: []
            }
            const isShow = ref(false)
            const copyValidate = ref(defaultValidate)
            const types = [
                {
                    id: API_VALIDATE_TYPES.REQUIRE,
                    name: window.i18n.t('字段必填'),
                    message: window.i18n.t('字段不能为空')
                },
                {
                    id: API_VALIDATE_TYPES.MIN_LENGTH,
                    name: window.i18n.t('字段最小长度'),
                    title: window.i18n.t('最小长度'),
                    message: window.i18n.t('字段最小长度不符合设置值')
                },
                {
                    id: API_VALIDATE_TYPES.MAX_LENGTH,
                    name: window.i18n.t('字段最大长度'),
                    title: window.i18n.t('最大长度'),
                    message: window.i18n.t('字段最大长度不符合设置值')
                },
                {
                    id: API_VALIDATE_TYPES.REGEXP,
                    name: window.i18n.t('正则表达式检验'),
                    title: window.i18n.t('正则表达式'),
                    message: window.i18n.t('字段值不符合正则表达式')
                }
                // {
                //     id: API_VALIDATE_TYPES.FUNCTION,
                //     name: window.i18n.t('函数校验'),
                //     title: window.i18n.t('选择函数'),
                //     message: window.i18n.t('字段值未通过函数校验')
                // }
            ]

            const handleClick = () => {
                isShow.value = true
                copyValidate.value = JSON.parse(JSON.stringify(props.scheme?.validate || defaultValidate))
            }

            const getLabel = (id) => {
                return types.find(item => item.id === id).title
            }

            const handlePlus = () => {
                copyValidate.value.rules.push({
                    type: types[0].id,
                    value: '',
                    message: types[0].message
                })
            }

            const handleMinus = (index) => {
                copyValidate.value.rules.splice(index, 1)
            }

            // 开启是立即生效
            const toggleEnable = () => {
                emit('change', {
                    enable: !props.scheme?.validate?.enable,
                    rules: props.scheme?.validate?.rules || []
                })
            }

            const handleTypeChange = (type, index) => {
                const item = {
                    type,
                    message: types.find(item => item.id === type).message,
                    value: ''
                }
                handleUpdate(item, index)
            }

            const handleUpdate = (val, index) => {
                const item = copyValidate.value.rules[index]
                Object.assign(item, val)
            }

            const triggerUpdate = () => {
                emit('change', copyValidate.value)
            }

            return {
                API_VALIDATE_TYPES,
                isShow,
                types,
                copyValidate,
                handleClick,
                getLabel,
                handlePlus,
                handleMinus,
                toggleEnable,
                handleTypeChange,
                handleUpdate,
                triggerUpdate
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .validate-main {
        display: flex;
        align-items: center;
        .link-text {
            color: #3A84FF;
            cursor: pointer;
        }
        .mr-5 {
            margin-right: 5px;
        }
        .validate-num {
            background: #F0F1F5;
            border-radius: 8px;
            color: #979BA5;
            line-height: 16px;
            padding: 0 8px;
        }
    }
    .plus-rule {
        cursor: pointer;
        display: block;
        text-align: center;
        width: 652px;
        height: 32px;
        line-height: 32px;
        border: 1px dashed #3A84FF;
        color: #3A84FF;
        .bk-icon {
            font-size: 20px;
        }
        &:hover {
            background: #F0F5FF;
        }
    }
    .validate-item {
        position: relative;
        background: #F5F7FA;
        border-radius: 2px;
        padding: 15px 30px;
        margin-bottom: 11px;
        .validate-delete {
            cursor: pointer;
            position: absolute;
            right: 10px;
            top: 10px;
        }
        .bk-select {
            background: #fff;
        }
    }
</style>
