<template>
    <div class="checkbox">
        <bk-checkbox-group v-model="val" @change="change">
            <bk-checkbox
                v-for="option in sourceData"
                :value="option.key"
                :disabled="getDisableStatus(option.key)"
                :key="option.key">
                {{ option.name }}
            </bk-checkbox>
        </bk-checkbox-group>
    </div>
</template>
<script>
    import dataSourceMixins from '../dataSourceMixins.js'

    export default {
        name: 'Checkbox',
        mixins: [dataSourceMixins],
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            value: {
                type: [Array, String]
                // default: () => [],
            },
            disabled: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                val: Array.isArray(this.value) ? [...this.value] : [this.value]
            }
        },
        watch: {
            value (val) {
                this.val = Array.isArray(val) ? [...val] : [val]
            }
        },
        methods: {
            getDisableStatus (key) {
                if (this.disabled) {
                    return true
                }
                if (
                    'imageRange' in this.field
                    && this.field.imageRange.isMax
                    && this.value.length >= this.field.imageRange.maxNum
                    && !this.value.includes(key)
                ) {
                    return true
                }
                return false
            },
            change (val) {
                this.$emit('change', val)
            }
        }
    }
</script>
<style lang="postcss" scoped>
.bk-form-checkbox {
    margin-right: 24px;
    margin-bottom: 4px;
}
</style>
