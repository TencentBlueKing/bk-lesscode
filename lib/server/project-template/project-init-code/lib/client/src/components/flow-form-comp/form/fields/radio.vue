<template>
    <div class="radio">
        <bk-radio-group :value="val" @change="change">
            <bk-radio v-for="option in sourceData" :value="option.key" :disabled="disabled" :key="option.key">
                {{ option.name }}
            </bk-radio>
        </bk-radio-group>
    </div>
</template>
<script>
    import dataSourceMixins from '../dataSourceMixins.js'

    export default {
        name: 'Radio',
        mixins: [dataSourceMixins],
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            value: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                val: this.field.value || ''
            }
        },
        watch: {
            value: {
                handler (val) {
                    this.val = val
                },
                immediate: true
            }
        },
        methods: {
            change (val) {
                this.$emit('change', val)
            }
        }
    }
</script>
<style lang="postcss" scoped>
.bk-form-radio {
    margin-right: 24px;
    margin-bottom: 4px;
}
</style>
