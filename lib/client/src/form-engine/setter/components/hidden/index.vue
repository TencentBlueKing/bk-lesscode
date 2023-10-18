<template>
    <section class="setter-hidden">
        <bk-checkbox :value="value.enable" :disabled="disabled" @change="handleChange('enable', $event)">隐藏</bk-checkbox>
        <bk-button v-if="value.enable" text size="small" theme="primary" @click="isConditionDialogShow = true">条件编辑</bk-button>
        <condition-edit
            :show.sync="isConditionDialogShow"
            :title="`【${field.configure.name}】隐藏条件设置`"
            :field="field"
            :config="value.config"
            :disabled="disabled"
            @change="handleChange('condition', $event)" />
    </section>
</template>
<script>
    import conditionEdit from '../../common/condition-edit'

    export default {
        name: 'setter-hidden',
        inheritAttrs: false,
        components: {
            conditionEdit
        },
        props: {
            field: {
                type: Object,
                default: () => ({})
            },
            disabled: Boolean,
            value: {
                type: Object,
                default: () => {
                    return {
                        enable: false,
                        config: {
                            logic: 'AND',
                            conditions: []
                        }
                    }
                }
            }
        },
        data () {
            return {
                isConditionDialogShow: false
            }
        },
        methods: {
            handleChange (key, val) {
                const localVal = { ...this.value }
                localVal[key] = val
                this.$emit('change', localVal)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .setter-hidden {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .bk-button-text.bk-button-small {
        padding: 0;
        height: 20px;
        line-height: 20px;
    }
    /deep/ {
        .bk-checkbox-text {
            font-size: 12px;
        }
    }
</style>
