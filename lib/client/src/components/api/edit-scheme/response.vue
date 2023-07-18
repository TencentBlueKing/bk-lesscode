<template>
    <scheme-tab
        :tabs="tabs"
        :active.sync="activeTab"
    >
        <template slot="tool">
            <slot name="tool"></slot>
        </template>
        <section v-show="activeTab === 'edit'">
            <scheme-header />
            <single-scheme
                ref="singleSchemeRef"
                :scheme="renderResponseParam"
                :minus-disable="true"
                :brothers="renderResponseParam.children"
                :variable-list="variableList"
                :function-list="functionList"
                :api-list="apiList"
                @update="handleUpdate"
            />
        </section>
        <monaco
            v-show="activeTab === 'response'"
            language="json"
            :value="responseString"
            @change="handleResponseChange"
        />
    </scheme-tab>
</template>

<script>
    import {
        defineComponent,
        ref,
        getCurrentInstance,
        watch
    } from '@vue/composition-api'
    import SchemeTab from '../common/scheme-tab'
    import SchemeHeader from '../common/scheme-header'
    import SingleScheme from '../common/single-scheme'
    import Monaco from '@/components/monaco'
    import {
        getDefaultApiEditScheme,
        parseScheme2Value,
        parseValue2Scheme,
        API_PARAM_TYPES
    } from 'shared/api'

    export default defineComponent({
        components: {
            SchemeTab,
            SchemeHeader,
            SingleScheme,
            Monaco
        },

        props: {
            params: Object,
            response: [Object, Array, String, Number],
            variableList: Array,
            functionList: Array,
            apiList: Array
        },

        setup (props, { emit }) {
            const tabs = [
                { name: 'response', label: window.i18n.t('响应示例') },
                { name: 'edit', label: window.i18n.t('响应结果字段提取') }
            ]
            const currentInstance = getCurrentInstance()
            const activeTab = ref('response')
            const renderResponseParam = props.params?.name !== undefined
                ? ref(props.params)
                : ref(getDefaultApiEditScheme({
                    name: 'root',
                    type: API_PARAM_TYPES.OBJECT.VAL,
                    value: API_PARAM_TYPES.OBJECT.DEFAULT,
                    plusBrotherDisable: true
                }))
            const responseString = ref(
                JSON.stringify(parseScheme2Value(renderResponseParam.value), null, 4)
            )

            const handleUpdate = (param) => {
                renderResponseParam.value = param
                emit('change', renderResponseParam.value)
            }

            const handleResponseChange = (value) => {
                try {
                    responseString.value = value
                    const Fn = Function
                    const responseValue = new Fn(`return ${value}`)()
                    const responseParam = parseValue2Scheme(responseValue)
                    handleUpdate(responseParam)
                } catch (error) {
                    console.error(window.i18n.t('输入有误，请重新输入：{0}', [error.message]))
                }
            }

            const validate = () => {
                return currentInstance
                    .proxy
                    .$refs
                    .singleSchemeRef
                    .validate()
                    .then(() => renderResponseParam.value)
            }

            watch(
                () => props.response,
                () => {
                    handleResponseChange(JSON.stringify(props.response, null, 4))
                }
            )

            return {
                tabs,
                activeTab,
                renderResponseParam,
                responseString,
                handleUpdate,
                validate,
                handleResponseChange
            }
        }
    })
</script>
