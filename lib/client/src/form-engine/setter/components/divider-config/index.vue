<template>
    <section>
        <setter-form-item :title="$t('form_展示文字')">
            <bk-input :disabled="disabled" :value="value.text" @change="handleChange('text', $event)" />
        </setter-form-item>
        <setter-form-item :title="$t('form_文字位置')">
            <bk-select
                :disabled="disabled"
                :value="value.align"
                :clearable="false"
                @selected="handleChange('align', $event)">
                <bk-option v-for="option in alignList" :key="option.id" :id="option.id" :name="option.name"></bk-option>
            </bk-select>
        </setter-form-item>
        <setter-form-item :title="$t('form_线条颜色')">
            <bk-color-picker
                transfer
                size="small" 
                :disabled="disabled"
                :value="value.color"
                @change="handleChange('color', $event)" />
        </setter-form-item>
    </section>
</template>
<script>
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'setter-divider-config',
        inheritAttrs: false,
        components: {
            setterFormItem
        },
        props: {
            disabled: Boolean,
            value: {
                type: Object,
                default: () => ({
                    text: '',
                    align: 'center',
                    lineColor: '#787A7F'
                })
            }
        },
        data () {
            return {
                alignList: [
                    { id: 'left', name: this.$t('居左') },
                    { id: 'right', name: this.$t('居右') },
                    { id: 'center', name: this.$t('居中') }
                ]
            }
        },
        methods: {
            handleChange (key, value) {
                this.$emit('change', {
                    ...this.value,
                    [key]: value
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .bk-color-picker.bk-color-picker-small.bk-color-picker-show-value {
        width: 100%;
    }
</style>
