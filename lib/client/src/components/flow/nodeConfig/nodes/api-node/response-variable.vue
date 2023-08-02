<template>
    <response
        ref="responseObjRef"
        :show-rule="false"
        :params="responseData"
        :render-slot="renderSlot"
        @change="update">
    </response>
</template>
<script>
    import Response from '@/components/api/use-scheme/response.vue'
    import { API_PARAM_TYPES, getDefaultApiUseScheme } from 'shared/api'
    import VariableInputSlot from './variable-input-slot.tsx'

    export default {
        name: 'ResponseVariable',
        components: {
            Response
        },
        props: {
            response: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                responseData: []
            }
        },
        watch: {
            response: {
                handler (val) {
                    this.responseData = val
                    if (val.name === undefined) {
                        this.responseData = getDefaultApiUseScheme({
                            name: 'root',
                            disabled: true,
                            hooked: false,
                            code: '',
                            type: API_PARAM_TYPES.OBJECT.VAL,
                            value: API_PARAM_TYPES.OBJECT.DEFAULT,
                            plusBrotherDisable: true
                        })
                    }
                },
                immediate: true
            }
        },
        methods: {
            renderSlot (row) {
                return VariableInputSlot.render(this.$createElement, row, this.handleHookVariableUpdate)
            },
            handleHookVariableUpdate (row, key, val) {
                this.$set(row, key, val)
                if (key === 'hooked' && !val) {
                    this.$set(row, 'code', '')
                }
                this.$emit('update', this.responseData)
            },
            update (val) {
                this.responseData = val
                this.$emit('update', this.responseData)
            },
            validate () {
                return this.$refs.responseObjRef.validate().then(() => { return true })
            }
        }
    }
</script>
