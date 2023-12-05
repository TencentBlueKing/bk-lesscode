<template>
    <section>
        <setter-form-item :title="$t('form_校验方式')">
            <bk-select
                :value="value"
                :clearable="false"
                :searchable="true"
                :disabled="disabled"
                @selected="handleChange">
                <bk-option
                    v-for="option in regexList"
                    :key="option.id"
                    :id="option.id"
                    :name="option.name">
                </bk-option>
            </bk-select>
        </setter-form-item>
    </section>
</template>
<script>
    import { getFieldRegexList } from '../../../utils/index'
    import setterFormItem from '../../common/setter-form-item.vue'

    export default {
        name: 'setter-validate',
        inheritAttrs: false,
        components: {
            setterFormItem
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean,
            value: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                regexList: []
            }
        },
        watch: {
            field: {
                handler (val) {
                    this.regexList = getFieldRegexList(val.type)
                },
                immediate: true
            }
        },
        methods: {
            handleChange (val) {
                this.$emit('change', val)
            }
        }
    }
</script>
