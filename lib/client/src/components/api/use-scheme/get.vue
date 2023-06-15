<template>
    <scheme-tab
        :tabs="tabs"
        :active.sync="activeTab"
    >
        <section v-if="activeTab === 'edit'">
            <scheme-header />
            <single-scheme
                ref="singleSchemeRef"
                v-for="(renderQueryParam, index) in renderQueryParams"
                :key="index"
                :type-disable="true"
                :scheme="renderQueryParam"
                :minus-disable="renderQueryParams.length <= 1"
                :render-slot="renderSlot"
                :disable="disabled"
                :name-options="nameOptions"
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
        parseQueryScheme2QueryString
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
            nameOptions: Array
        },

        setup (props, { emit }) {
            const tabs = [
                { name: 'edit', label: 'query' },
                { name: 'preview', label: window.i18n.t('预览') }
            ]
            const currentInstance = getCurrentInstance()
            const activeTab = ref('edit')
            const renderQueryParams = ref([])
            const queryString = computed(() => parseQueryScheme2QueryString(renderQueryParams.value, props.getParamVal))

            const handlePlusBrotherNode = (index) => {
                renderQueryParams.value.splice(index + 1, 0, getDefaultApiUseScheme())
                triggleChange()
            }

            const handleMinusNode = (index) => {
                renderQueryParams.value.splice(index, 1)
                triggleChange()
            }

            const handleUpdate = (index, param) => {
                renderQueryParams.value[index] = param
                triggleChange()
            }

            const triggleChange = () => {
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
