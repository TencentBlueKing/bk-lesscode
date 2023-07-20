<template>
    <scheme-tab
        :tabs="tabs"
        :active.sync="activeTab"
    >
        <template slot="tool">
            <slot name="tool"></slot>
        </template>
        <section v-if="activeTab === 'edit'">
            <scheme-header />
            <single-scheme
                ref="singleSchemeRef"
                v-for="(renderQueryParam, index) in renderQueryParams"
                :key="index"
                :type-disable="true"
                :scheme="renderQueryParam"
                :minus-disable="renderQueryParams.length <= 1"
                :brothers="renderQueryParams"
                :variable-list="variableList"
                :function-list="functionList"
                :api-list="apiList"
                @plusBrotherNode="handlePlusBrotherNode(index)"
                @minusNode="handleMinusNode(index)"
                @update="(param) => handleUpdate(index, param)"
            />
        </section>
        <monaco
            v-else
            :read-only="true"
            :value="queryString"
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
        getDefaultApiEditScheme,
        parseHeaderScheme2HeaderString
    } from 'shared/api'

    export default defineComponent({
        components: {
            SchemeTab,
            SchemeHeader,
            SingleScheme,
            Monaco
        },

        props: {
            params: Array,
            getParamVal: Function,
            variableList: Array,
            functionList: Array,
            apiList: Array
        },

        setup (props, { emit }) {
            const tabs = [
                { name: 'edit', label: 'header' },
                { name: 'preview', label: window.i18n.t('预览') }
            ]
            const currentInstance = getCurrentInstance()
            const activeTab = ref('edit')
            const renderQueryParams = ref([])
            const queryString = computed(() => parseHeaderScheme2HeaderString(renderQueryParams.value))

            const handlePlusBrotherNode = (index) => {
                renderQueryParams.value.splice(index + 1, 0, getDefaultApiEditScheme())
                triggerChange()
            }

            const handleMinusNode = (index) => {
                renderQueryParams.value.splice(index, 1)
                triggerChange()
            }

            const handleUpdate = (index, param) => {
                renderQueryParams.value[index] = param
                triggerChange()
            }

            const triggerChange = () => {
                emit('change', renderQueryParams.value)
            }

            const validate = () => {
                const singleSchemeRefs = currentInstance.proxy.$refs.singleSchemeRef
                return Promise
                    .all(singleSchemeRefs.map(ref => ref.validate()))
                    .then(() => {
                        return renderQueryParams.value
                    })
            }

            watch(
                () => props.params,
                () => {
                    renderQueryParams.value = props.params
                },
                {
                    immediate: true
                }
            )
            return {
                tabs,
                activeTab,
                renderQueryParams,
                queryString,
                handlePlusBrotherNode,
                handleMinusNode,
                handleUpdate,
                validate
            }
        }
    })

</script>
