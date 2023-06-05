<template>
    <section>
        <scheme-header :slot-label="$t('设置为全局变量')" :hide-required="true" />
        <single-scheme
            ref="singleSchemeRef"
            :scheme="renderResponseParam"
            :render-slot="renderSlot"
            :minus-disable="true"
            :hide-required="true"
            @update="handleUpdate"
        />
    </section>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch,
        onMounted,
        getCurrentInstance
    } from '@vue/composition-api'
    import SchemeHeader from '../common/scheme-header'
    import SingleScheme from '../common/single-scheme'

    import {
        getDefaultApiEditScheme,
        API_PARAM_TYPES
    } from 'shared/api'

    export default defineComponent({
        components: {
            SchemeHeader,
            SingleScheme
        },

        props: {
            params: Object,
            response: [Object, Array, String, Number],
            renderSlot: Function
        },

        setup (props, { emit }) {
            const currentInstance = getCurrentInstance()
            const renderResponseParam = ref({})

            const handleUpdate = (param) => {
                renderResponseParam.value = param
                emit('change', renderResponseParam.value)
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
                () => props.params,
                () => {
                    renderResponseParam.value = props.params
                },
                {
                    immediate: true
                }
            )

            onMounted(() => {
                // 设置 params
                renderResponseParam.value = props.params
                // 默认显示 root
                if (renderResponseParam.value.name === undefined) {
                    renderResponseParam.value = getDefaultApiEditScheme({
                        name: 'root',
                        type: API_PARAM_TYPES.OBJECT.VAL,
                        value: API_PARAM_TYPES.OBJECT.DEFAULT,
                        plusBrotherDisable: true
                    })
                }
            })

            return {
                renderResponseParam,
                handleUpdate,
                validate
            }
        }
    })

</script>

<style lang="postcss" scoped>
    
</style>
