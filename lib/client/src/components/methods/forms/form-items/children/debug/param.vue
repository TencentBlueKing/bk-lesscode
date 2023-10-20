<template>
    <section>
        <ul class="debug-params" v-if="renderParams.length">
            <li
                v-for="(renderParam, index) in renderParams"
                :key="index"
                class="debug-param"
            >
                <span class="param-title">{{ renderParam.key }}</span>
                <bk-select
                    v-model="renderValueTypes[index]"
                    :clearable="false"
                    class="param-type"
                    @change="handleTypeChange(index)"
                >
                    <bk-option
                        v-for="valueType in valueTypes"
                        :key="valueType.id"
                        :id="valueType.id"
                        :name="valueType.name"
                    />
                </bk-select>
                <bk-switcher
                    v-if="renderValueTypes[index] === 'boolean'"
                    :value="renderParam.value"
                    @change="(val) => changeParam(val, index)"
                />
                <bk-input
                    v-else
                    class="param-value"
                    :placeholder="$t('请输入参数值')"
                    ref="paramInputRef"
                    :value="renderValueTypes[index] === 'string' ? renderParam.value : JSON.stringify(renderParam.value)"
                    @change="(val) => changeParam(val, index)"
                    @enter="handleEnter"
                ></bk-input>
            </li>
        </ul>
    </section>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import {
        getValueFromString
    } from 'shared/util'

    export default defineComponent({
        props: {
            params: Array
        },

        setup (props, { emit }) {
            const renderParams = ref([])
            const paramInputRef = ref([])
            const renderValueTypes = ref([])
            const valueTypes = [
                {
                    id: 'string',
                    name: window.i18n.t('字符串')
                },
                {
                    id: 'array',
                    name: window.i18n.t('数组')
                },
                {
                    id: 'object',
                    name: window.i18n.t('对象')
                },
                {
                    id: 'number',
                    name: window.i18n.t('数字')
                },
                {
                    id: 'boolean',
                    name: window.i18n.t('布尔值')
                }
            ]
            const valueMap = {
                string: '',
                array: '[]',
                object: '{}',
                number: '0',
                boolean: false
            }

            const changeParam = (val, index) => {
                try {
                    const type = renderValueTypes.value[index]
                    let renderVal = val
                    switch (type) {
                        case 'string':
                            renderVal = val
                            break
                        case 'array':
                        case 'object':
                            renderVal = getValueFromString(val)
                            break
                        case 'number':
                            renderVal = Number(val)
                            break
                        case 'boolean':
                            renderVal = Boolean(val)
                            break
                    }
                    renderParams.value[index].value = renderVal
                    emit('param-change', renderParams.value)
                } catch (error) {
                    
                }
            }

            const handleTypeChange = (index) => {
                const type = renderValueTypes.value[index]
                changeParam(valueMap[type], index)
            }

            const handleEnter = () => {
                paramInputRef.value?.forEach((inputRef) => {
                    inputRef?.blur()
                })
            }

            watch(
                () => props.params,
                () => {
                    renderParams.value = props.params
                    renderValueTypes.value = props.params.map(x => 'string')
                },
                {
                    immediate: true
                }
            )

            return {
                renderParams,
                renderValueTypes,
                valueTypes,
                paramInputRef,
                changeParam,
                handleTypeChange,
                handleEnter
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .debug-params {
        margin: 18px 16px;
        border-top: 1px solid #333333;
        border-left: 1px solid #333333;
    }
    .debug-param {
        display: flex;
        align-items: center;
        line-height: 32px;
        border-right: 1px solid #333333;
        border-bottom: 1px solid #333333;
        color: #C4C6CC;
    }
    .param-title {
        padding: 0 16px;
        width: 144px;
        border-right: 1px solid #333333;
    }
    .param-type {
        width: 120px;
        border: 1px solid #212121;
    }
    .param-value {
        flex: 1;
        /deep/ .bk-form-input {
            background: #212121;
            border: 1px solid #212121;
            color: #C4C6CC;
            &:focus {
                background: #212121 !important;
                color: #C4C6CC !important;
                border: 1px solid #3A84FF;
            }
            &::placeholder {
                color: #63656E;
            }
        }
    }
</style>
