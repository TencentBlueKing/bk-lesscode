<template>
    <monaco
        :read-only="true"
        :value="jsonValue"
    />
</template>

<script>
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import monaco from '@/components/monaco'
    import {
        parseEditScheme2JsonValue
    } from 'shared/api'

    export default defineComponent({
        components: {
            monaco
        },

        props: {
            scheme: Object
        },

        setup (props) {
            const jsonValue = ref('')

            watch(
                () => props.scheme,
                () => {
                    const json = parseEditScheme2JsonValue(props.scheme)
                    jsonValue.value = JSON.stringify(json, null, 4)
                },
                {
                    immediate: true
                }
            )

            return {
                jsonValue
            }
        }
    })
</script>
