<template>
    <section class="setter-hidden">
        <bk-checkbox :value="value.enable" :disabled="disabled" @change="handleChange('enable', $event)">{{ $t('隐藏') }}</bk-checkbox>
        <bk-button v-if="value.enable" text size="small" theme="primary" @click="isConditionDialogShow = true">{{ $t('条件编辑') }}</bk-button>
        <condition-edit
            :show.sync="isConditionDialogShow"
            :title="`【${field.configure.name}】${$t('字段隐藏条件设置')}`"
            :field="field"
            :list="list"
            :config="value.config"
            :disabled="disabled"
            @change="handleChange('config', $event)" />
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
            list: Array,
            disabled: Boolean,
            value: {
                type: Object,
                default: () => {
                    return {
                        enable: false,
                        config: {
                            logic: 'and',
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
