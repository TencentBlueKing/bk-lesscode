<template>
    <use-body-param
        :params="api.body"
        :value="localVal"
    >
        <template v-slot:default="slotProps">
            <template v-if="slotProps.row.canSetValue">
                <bk-select
                    behavior="simplicity"
                    style="width: 99px; margin-right: 4px"
                    :value="getParamValue(slotProps.row.paramPath, 'type')"
                    :clearable="false"
                    :disabled="disabled"
                    @change="(type) => handleApiTypeChange(slotProps.row.paramPath, type)">
                    <bk-option id="VALUE" name="值"></bk-option>
                    <bk-option id="VARIABLE" name="变量"></bk-option>
                </bk-select>
                <bk-select
                    v-if="getParamValue(slotProps.row.paramPath, 'type') === 'VARIABLE'"
                    behavior="simplicity"
                    placeholder="请选择变量"
                    style="width: 150px"
                    :value="getParamValue(slotProps.row.paramPath, 'code')"
                    :searchable="true"
                    :clearable="false"
                    :disabled="disabled"
                    @change="(code) => handleCodeChange(slotProps.row.paramPath, code)">
                    <bk-option
                        v-for="variable in variableList"
                        :key="variable.variableCode"
                        :id="variable.variableCode"
                        :name="variable.variableName"
                    ></bk-option>
                </bk-select>
                <div v-else style="width: 150px">
                    <bk-checkbox
                        v-if="slotProps.row.type === 'boolean'"
                        :value="getParamValue(slotProps.row.paramPath, 'val')"
                        :disabled="disabled"
                        @change="(val) => handleValChange(slotProps.row.paramPath, val)"
                    ></bk-checkbox>
                    <bk-input
                        v-else
                        behavior="simplicity"
                        placeholder="请输入参数值"
                        :value="getParamValue(slotProps.row.paramPath, 'val')"
                        :disabled="disabled"
                        @change="(val) => handleValChange(slotProps.row.paramPath, val)">
                    </bk-input>
                </div>
            </template>
        </template>
    </use-body-param>
</template>

<script>
    import {
        defineComponent,
        watch,
        ref
    } from '@vue/composition-api'
    import {
        parseJsonScheme2UseScheme
    } from 'shared/api'
    import UseBodyParam from '@/components/api/use-body-param.vue'

    export default defineComponent({
        components: {
            UseBodyParam
        },

        props: {
            api: Object,
            value: Object,
            disabled: Boolean,
            variableList: Array
        },

        setup (props, { emit }) {
            const localVal = ref({})

            const getParamByPath = (paramPath) => {
                if (!Array.isArray(paramPath)) return

                let param
                paramPath.reduce((acc, crt, index) => {
                    const currentParamVal = acc[crt]
                    if (index === paramPath.length - 1) {
                        param = currentParamVal
                    }
                    return currentParamVal
                }, localVal.value)
                return param
            }

            const handleApiTypeChange = (paramPath, type) => {
                const param = getParamByPath(paramPath)
                param.type = type
                param.code = ''
                param.val = ''
                triggleChange()
            }

            const handleCodeChange = (paramPath, code) => {
                const param = getParamByPath(paramPath)
                param.code = code
                triggleChange()
            }

            const handleValChange = (paramPath, val) => {
                const param = getParamByPath(paramPath)
                param.val = val
                triggleChange()
            }

            const triggleChange = () => {
                emit('change', localVal.value)
            }

            const getParamValue = (paramPath, key) => {
                const param = getParamByPath(paramPath) || {}
                return param[key]
            }

            watch(
                () => props.api,
                (newValue, oldValue) => {
                    if (JSON.stringify(newValue) !== JSON.stringify(oldValue) && props.api.body && props.value) {
                        localVal.value = parseJsonScheme2UseScheme(props.api.body, props.value)
                        triggleChange()
                    }
                },
                {
                    immediate: true
                }
            )

            return {
                localVal,
                handleApiTypeChange,
                handleCodeChange,
                handleValChange,
                getParamValue
            }
        }
    })
</script>
