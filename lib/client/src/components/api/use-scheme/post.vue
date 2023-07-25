<template>
    <scheme-tab
        :tabs="tabs"
        :active.sync="activeTab"
    >
        <template slot="tool">
            <slot name="tool"></slot>
        </template>
        <section v-if="activeTab === 'edit'">
            <scheme-header :show-rule="showRule" />
            <single-scheme
                ref="singleSchemeRef"
                :scheme="renderBodyParam"
                :minus-disable="true"
                :plus-brother-disable="true"
                :disable="disabled"
                :render-slot="renderSlot"
                :name-options="nameOptions"
                :brothers="renderBodyParam.children"
                :variable-list="variableList"
                :function-list="functionList"
                :api-list="apiList"
                :show-rule="showRule"
                @minusNode="handleMinusNode"
                @update="handleUpdate"
            />
        </section>
        <monaco
            v-else
            :read-only="true"
            :value="bodyString"
        />
    </scheme-tab>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch,
        computed,
        getCurrentInstance
    } from '@vue/composition-api'
    import SchemeTab from '../common/scheme-tab'
    import SchemeHeader from '../common/scheme-header'
    import SingleScheme from '../common/single-scheme'
    import Monaco from '@/components/monaco'
    import {
        parseScheme2Value
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
            renderSlot: Function,
            getParamVal: Function,
            disabled: Boolean,
            nameOptions: Array,
            variableList: Array,
            functionList: Array,
            apiList: Array,
            showRule: {
                type: Boolean,
                default: true
            }
        },

        setup (props, { emit }) {
            const tabs = [
                { name: 'edit', label: 'body' },
                { name: 'preview', label: window.i18n.t('预览') }
            ]
            const currentInstance = getCurrentInstance()
            const activeTab = ref('edit')
            const renderBodyParam = ref({})
            const bodyString = computed(() => JSON.stringify(parseScheme2Value(renderBodyParam.value, props.getParamVal), null, 4))

            const handleMinusNode = (index) => {
                emit('change', renderBodyParam.value)
            }

            const handleUpdate = (param) => {
                renderBodyParam.value = param
                emit('change', renderBodyParam.value)
            }

            const validate = () => {
                return currentInstance
                    .proxy
                    .$refs
                    .singleSchemeRef
                    .validate()
                    .then(() => renderBodyParam.value)
            }

            watch(
                () => props.params,
                () => {
                    renderBodyParam.value = props.params
                },
                {
                    immediate: true
                }
            )
            return {
                tabs,
                activeTab,
                renderBodyParam,
                bodyString,
                handleMinusNode,
                handleUpdate,
                validate
            }
        }
    })

</script>
