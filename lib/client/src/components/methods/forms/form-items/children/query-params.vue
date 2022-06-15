<template>
    <use-query-param
        :params="api.query"
    >
        <template v-slot:default="slotProps">
            <bk-select
                behavior="simplicity"
                style="width: 99px; margin-right: 4px"
                :value="localVal[slotProps.row.name].type"
                :clearable="false"
                :disabled="disabled"
                @change="(type) => handleApiQueryTypeChange(slotProps.row.name, type)">
                <bk-option id="VALUE" name="值"></bk-option>
                <bk-option id="VARIABLE" name="变量"></bk-option>
            </bk-select>
            <bk-select
                v-if="localVal[slotProps.row.name].type === 'VARIABLE'"
                behavior="simplicity"
                placeholder="请选择变量"
                style="width: 150px"
                :value="localVal[slotProps.row.name].code"
                :searchable="true"
                :clearable="false"
                :disabled="disabled"
                @change="(code) => handleCodeChange(slotProps.row.name, code)">
                <bk-option
                    v-for="variable in variableList"
                    :key="variable.variableCode"
                    :id="variable.variableCode"
                    :name="variable.variableName"
                ></bk-option>
            </bk-select>
            <div v-else style="width: 150px">
                <bk-select
                    v-if="slotProps.row.type === 'boolean'"
                    behavior="simplicity"
                    style="background: #fff"
                    :value="localVal[slotProps.row.name].val"
                    :disabled="disabled"
                    @change="(val) => handleValChange(slotProps.row.name, val)">
                    <bk-option :id="true" name="true"></bk-option>
                    <bk-option :id="false" name="false"></bk-option>
                </bk-select>
                <bk-input
                    v-else
                    behavior="simplicity"
                    placeholder="请输入参数值"
                    :value="localVal[slotProps.row.name].val"
                    :disabled="disabled"
                    @change="(val) => handleValChange(slotProps.row.name, val)">
                </bk-input>
            </div>
        </template>
    </use-query-param>
</template>

<script>
    import {
        defineComponent,
        watch,
        ref
    } from '@vue/composition-api'
    import UseQueryParam from '@/components/api/use-query-param.vue'
    import Vue from 'vue'

    export default defineComponent({
        components: {
            UseQueryParam
        },

        props: {
            api: Object,
            value: Object,
            disabled: Boolean,
            variableList: Array
        },

        setup (props, { emit }) {
            const localVal = ref({})

            const handleApiQueryTypeChange = (name, type) => {
                const currentParamVal = localVal.value[name]
                currentParamVal.type = type
                currentParamVal.code = ''
                currentParamVal.val = ''
                triggleChange()
            }

            const handleCodeChange = (name, code) => {
                const currentParamVal = localVal.value[name]
                currentParamVal.code = code
                triggleChange()
            }

            const handleValChange = (name, val) => {
                const currentParamVal = localVal.value[name]
                currentParamVal.val = val
                triggleChange()
            }

            const triggleChange = () => {
                emit('change', localVal.value)
            }

            watch(
                () => props.api,
                () => {
                    props.api.query?.forEach((scheme) => {
                        let val = props.value[scheme.name]
                        if (!val) {
                            val = {
                                type: 'VALUE',
                                val: scheme.default,
                                code: ''
                            }
                        }
                        Vue.set(localVal.value, scheme.name, val)
                    })
                    triggleChange()
                },
                {
                    immediate: true
                }
            )

            return {
                localVal,
                handleApiQueryTypeChange,
                handleCodeChange,
                handleValChange
            }
        }
    })
</script>
