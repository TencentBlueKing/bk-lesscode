<template>
    <bk-dialog
        :title="`【${[title]}】字段隐藏条件设置`"
        header-position="left"
        ext-cls="formula-config-dialog"
        :mask-close="false"
        :auto-close="false"
        :close-icon="false"
        width="560"
        :value="show"
        @confirm="onConfirm"
        @cancel="$emit('update:show', false)">
        <condition-group :value="value" @change="handleChangeValue" :fields="fieldList">
        </condition-group>
    </bk-dialog>
</template>

<script>
    import conditionGroup from './conditionGroup.vue'
    export default {
        name: 'showTypeDialog',
        components: {
            conditionGroup
        },
        props: {
            show: {
                type: Boolean,
                default: false
            },
            title: {
                type: String,
                default: ''
            },
            value: {
                type: Object,
                default () {
                    return {
                        type: 'and',
                        expressions: [
                            {
                                key: '',
                                condition: '',
                                value: ''
                            }
                        ]

                    }
                }
            },
            fieldList: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                localValue: {}
            }
        },
        methods: {
            onConfirm () {
                if (this.validate()) {
                    this.$emit('confirm', this.localValue)
                }
            },
            validate () {
                if (!('expressions' in this.localValue) || this.localValue.expressions.some(item => item.key === '' || item.condition === '' || item.value === '')) {
                    this.$bkMessage({
                        theme: 'error',
                        message: '条件配置项不能为空'
                    })
                    return false
                }
                return true
            },
            handleChangeValue (val) {
                this.localValue = val
            }
        }
    }
</script>

<style scoped>

</style>
