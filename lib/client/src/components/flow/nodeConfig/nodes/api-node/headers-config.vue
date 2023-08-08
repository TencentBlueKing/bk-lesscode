<template>
  <use-header-scheme
      ref="editObjectRef"
      :params="renderParams"
      :show-rule="false"
      :variable-list="[]"
      :function-list="[]"
      :api-list="[]"
      @change="handleParamsChange"
  />
</template>
<script>
    import { getDefaultApiUseScheme } from 'shared/api'
    import UseHeaderScheme from '@/components/api/use-scheme/header.vue'
    export default {
        name: 'HeaderConfig',
        components: {
            UseHeaderScheme
        },
        props: {
            headers: {
                type: Array,
                default: () => []
            },
        },
        data () {
            return {
                renderParams: []
            }
        },
        watch: {
            headers: {
                handler () {
                    this.initParam()
                },
                immediate: true
            }
        },
        methods: {
            initParam () {
                if (this.headers.length <= 0) {
                    this.renderParams = [getDefaultApiUseScheme()]
                } else {
                    this.renderParams = this.headers
                }
            },
            handleParamsChange (val) {
                this.$emit('update', val)
            },
            validate () {
                return this.$refs.editObjectRef.validate().then(() => { return true })
            }
        }
    }
</script>