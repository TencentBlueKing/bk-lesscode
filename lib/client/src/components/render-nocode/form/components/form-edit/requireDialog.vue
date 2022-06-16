<template>
    <bk-dialog
        :title="`表格【${[title]}】必填条件设置`"
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
        name: 'requireDialog',
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
                        connector: 'and',
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
                this.$emit('confirm', this.localValue)
            },
            handleChangeValue (val) {
                this.localValue = val
            }
        }
    }
</script>

<style scoped>

</style>
