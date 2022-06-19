<template>
    <scheme-tab
        :tabs="tabs"
        :active.sync="activeTab"
    >
        <section v-if="activeTab === 'edit'">
            <scheme-header />
            <single-scheme
                ref="singleSchemeRef"
                :scheme="renderBodyParam"
                :minus-disable="true"
                :render-slot="renderSlot"
                @update="handleUpdate"
            >
            </single-scheme>
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
        getDefaultApiEditScheme,
        parseScheme2Value,
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
            renderSlot: Function,
            params: Object
        },

        setup (props, { emit }) {
            const tabs = [
                { name: 'edit', label: 'body' },
                { name: 'preview', label: '预览' }
            ]
            const currentInstance = getCurrentInstance()
            const activeTab = ref('edit')
            const renderBodyParam = ref({})
            const bodyString = computed(() => JSON.stringify(parseScheme2Value(renderBodyParam.value), null, 4))

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
                    if (renderBodyParam.value.name === undefined) {
                        renderBodyParam.value = getDefaultApiEditScheme({
                            name: 'root',
                            type: API_PARAM_TYPES.OBJECT.VAL,
                            value: API_PARAM_TYPES.OBJECT.DEFAULT,
                            disable: true,
                            plusBrotherDisable: true
                        })
                    }
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
                handleUpdate,
                validate
            }
        }
    })

</script>
