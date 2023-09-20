<template>
    <render-wrapper
        @delete="handleDelete"
    >
        <render-type
            :type="action.type"
            @change="handleTypeChange"
        >
            <bk-input
                class="link-address"
                v-bk-tooltips="{ content: $t('可以使用 ${args[0]} 的形式获取获取事件参数值') }"
                :value="action.value"
                @change="handleValueChange"
            />
        </render-type>
    </render-wrapper>
</template>

<script>
    import RenderWrapper from './components/render-wrapper.vue'
    import RenderType from './components/render-type.vue'

    export default {
        components: {
            RenderWrapper,
            RenderType
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
.link-address {
    width: 165px;
    height: 32px;
    >>> .bk-input-text, input {
        height: 100%;
    }
}
</style>
