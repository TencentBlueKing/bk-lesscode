<template>
    <render-wrapper
        @delete="handleDelete"
    >
        <choose-function
            class="choose-function"
            default-variable-format="value"
            :param-tips="$t('可以使用 ${args[0]} 的形式获取获取事件参数值')"
            :show-param-tips="false"
            :format-include="['value']"
            :choosen-function="{
                methodCode: action.id,
                params: action.value
            }"
            @change="handleValueChange"
            @clear="handleValueClear"
        >
            <template v-slot:trigger-prefix>
                <render-type
                    class="render-type"
                    :type="action.type"
                    @click.native.stop
                    @change="handleTypeChange"
                >
                </render-type>
            </template>
        </choose-function>
    </render-wrapper>
</template>

<script>
    import RenderWrapper from './components/render-wrapper.vue'
    import RenderType from './components/render-type.vue'
    import ChooseFunction from '@/components/methods/choose-function/index.vue'

    export default {
        components: {
            RenderWrapper,
            RenderType,
            ChooseFunction
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
            handleValueChange (func) {
                this.$emit('change', {
                    ...this.action,
                    id: func.methodCode,
                    value: func.params
                })
            },
            handleValueClear () {
                this.$emit('change', {
                    ...this.action,
                    id: '',
                    value: ''
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
    height: 31px;
    >>> input {
        height: 31px;
    }
}
</style>

<style lang="postcss" scoped>
.render-type {
    width: 75px;
    margin-right: -1px;
}
</style>
