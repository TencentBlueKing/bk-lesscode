<template>
    <div class="select">
        <bk-select
            v-model="val"
            :searchable="true"
            :disabled="disabled"
            :loading="sourceDataLoading"
            :placeholder="field.placeholder"
            @change="change">
            <bk-option v-for="option in sourceData" :key="option.key" :id="option.key" :name="option.name"> </bk-option>
        </bk-select>
    </div>
</template>
<script>
    import dataSourceMixins from '../dataSourceMixins.js'

    export default {
        name: 'Select',
        mixins: [dataSourceMixins],
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: {
                type: Boolean,
                default: false
            },
            value: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                val: this.field.val || this.field.value
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
