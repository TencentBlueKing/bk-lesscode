<template>
    <bk-button
        v-bk-tooltips="{ content: $t('复用表单模式下表单不可编辑'), disabled: editable, placement: 'bottom-end' }"
        theme="primary"
        :class="{ disabled: !editable }"
        @click="handleClick">
        {{ $t('保存') }}
    </bk-button>
</template>
<script>
    import { defineComponent } from '@vue/composition-api'

    export default defineComponent ({
        name: 'SaveBtn',
        props: {
            editable: {
                type: Boolean,
                default: true
            }
        },
        setup (props, { emit }) {

            const handleClick = () => {
                if (!props.editable) return
            }

            return {
                handleClick
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .bk-button {
        min-width: 88px;
        &.disabled {
            background-color: #dcdee5;
            border-color: #dcdee5;
            color: #fff;
        }
    }
</style>