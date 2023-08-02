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
                v-for="(renderParam, index) in renderParams"
                :key="index"
                :type-disable="true"
                :scheme="renderParam"
                :minus-disable="renderParams.length <= 1"
                :render-slot="renderSlot"
                :disable="disabled"
                :name-options="nameOptions"
                :brothers="renderParams"
                :variable-list="variableList"
                :function-list="functionList"
                :api-list="apiList"
                :show-rule="showRule"
                @plusBrotherNode="handlePlusBrotherNode(index)"
                @minusNode="handleMinusNode(index)"
                @update="(param) => handleUpdate(index, param)"
            >
            </single-scheme>
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
        getDefaultApiUseScheme,
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
                { name: 'edit', label: 'header' },
                { name: 'preview', label: window.i18n.t('预览') }
            ]
            const currentInstance = getCurrentInstance()
            const activeTab = ref('edit')
            const renderParams = ref([])
            const queryString = computed(() => parseHeaderScheme2HeaderString(renderParams.value, props.getParamVal))

            const handlePlusBrotherNode = (index) => {
                renderParams.value.splice(index + 1, 0, getDefaultApiUseScheme())
                triggerChange()
            }

            const handleMinusNode = (index) => {
                renderParams.value.splice(index, 1)
                triggerChange()
            }

            const handleUpdate = (index, param) => {
                renderParams.value[index] = param
                triggerChange()
            }

            const triggerChange = () => {
                emit('change', renderParams.value)
            }

            const validate = () => {
                const singleSchemeRefs = currentInstance.proxy.$refs.singleSchemeRef
                return Promise
                    .all(singleSchemeRefs.map(ref => ref.validate()))
                    .then(() => {
                        return renderParams.value
                    })
            }

            watch(
                () => props.params,
                () => {
                    renderParams.value = props.params
                },
                {
                    immediate: true
                }
            )
            return {
                tabs,
                activeTab,
                renderParams,
                queryString,
                handlePlusBrotherNode,
                handleMinusNode,
                handleUpdate,
                validate
            }
        }
    })

</script>
