<template>
    <div class="get-params-wrapper">
        <use-get-scheme
            ref="getObjRef"
            :show-rule="false"
            :params="queryData"
            :render-slot="renderSlot"
            :get-param-val="LCGetParamsVal(variableList)">
        </use-get-scheme>
    </div>
</template>
<script>
    import UseGetScheme from '@/components/api/use-scheme/get'
    import { getDefaultApiUseScheme, LCGetParamsVal } from 'shared/api'
    import RenderParamSlot from './render-param-slot'

    export default {
        name: 'GetParams',
        components: {
            UseGetScheme
        },
        props: {
            variableList: {
                type: Array,
                default: () => []
            },
            query: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                LCGetParamsVal,
                queryData: []
            }
        },
        watch: {
            query: {
                handler (val) {
                    this.queryData = val
                    if (val.length === 0) {
                        this.queryData = [getDefaultApiUseScheme()]
                    }
                },
                immediate: true
            }
        },
        methods: {
            renderSlot (row) {
                return RenderParamSlot.render(this.$createElement, row, this.handleGetParamsUpdate, this.variableList)
            },
            handleGetParamsUpdate (row, val) {
                Object.assign(row, val)
                this.$emit('update', this.queryData)
            },
            validate () {
                return this.$refs.getObjRef.validate().then(() => { return true })
            }
        }
    }
</script>
