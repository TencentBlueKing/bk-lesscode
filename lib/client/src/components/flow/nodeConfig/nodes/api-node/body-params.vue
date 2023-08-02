<template>
    <use-post-scheme
        ref="bodyObjRef"
        :show-rule="false"
        :params="bodyData"
        :render-slot="renderSlot"
        :get-param-val="LCGetParamsVal(variableList)"
        @change="$emit('update', $event)">
    </use-post-scheme>
</template>
<script>
    import UsePostScheme from '@/components/api/use-scheme/post'
    import { API_PARAM_TYPES, getDefaultApiUseScheme, LCGetParamsVal } from 'shared/api'
    import RenderParamSlot from '@/components/methods/forms/form-items/children/render-param-slot'

    export default {
        name: 'BodyParams',
        components: { UsePostScheme },
        props: {
            variableList: {
                type: Array,
                default: () => []
            },
            body: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                LCGetParamsVal,
                bodyData: []
            }
        },
        watch: {
            body: {
                handler (val) {
                    this.bodyData = val
                    if (val.name === undefined) {
                        this.bodyData = getDefaultApiUseScheme({
                            name: 'root',
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
                return RenderParamSlot.render(this.$createElement, row, this.handleParamsUpdate, this.variableList)
            },
            handleParamsUpdate (row, val) {
                Object.assign(row, val)
                this.$emit('update', this.bodyData)
            },
            validate () {
                return this.$refs.bodyObjRef.validate().then(() => { return true })
            }
        }
    }
</script>
