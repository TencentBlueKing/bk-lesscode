<template>
    <render-wrapper
        @delete="handleDelete"
    >
        <render-type
            :type="action.type"
            @change="handleTypeChange"
        >
            <variable-select
                class="variable-select"
                :options="{}"
                :form-data="{ code: action.id }"
                :remote-config="{}"
                @on-change="handleIdChange"
            />
        </render-type>
        <section class="variable-value">
            <span class="value-equal">=</span>
            <bk-input
                class="value-input"
                v-bk-tooltips="{ content: $t('可以使用 ${args[0]} 的形式获取获取事件参数值') }"
                :value="action.value"
                @change="handleValueChange"
            />
        </section>
    </render-wrapper>
</template>

<script>
    import RenderWrapper from './components/render-wrapper.vue'
    import RenderType from './components/render-type.vue'
    import VariableSelect from '@/components/variable/variable-select/components/variable.vue'

    export default {
        components: {
            RenderWrapper,
            RenderType,
            VariableSelect
        },

        props: {
            action: Object
        },

        methods: {
            handleTypeChange (type) {
                this.$emit('change', {
                    ...this.action,
                    ...type
                })
            },
            handleIdChange (variable) {
                this.$emit('change', {
                    ...this.action,
                    id: variable.code
                })
            },
            handleValueChange (value) {
                this.$emit('change', {
                    ...this.action,
                    value
                })
            },
            handleDelete () {
                this.$emit('delete')
            }
        }
    }
</script>

<style lang="postcss" scoped>
.variable-select {
    width: 165px;
}
.variable-value {
    display: flex;
    align-items: center;
    margin-top: 9px;
    .value-equal {
        display: inline-block;
        width: 32px;
        height: 32px;
        line-height: 32px;
        text-align: center;
        background: #FFFFFF;
        border: 1px solid #C4C6CC;
        border-radius: 2px;
        color: #E76E0B;
        margin-right: 4px;
    }
    .value-input {
        width: 203px;
    }
}
</style>
