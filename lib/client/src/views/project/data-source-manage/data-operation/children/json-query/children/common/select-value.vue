<template>
    <section class="select-value">
        <bk-input
            class="input-value"
            :placeholder="isPlaceholder"
            :value="value"
            @change="(val) => handleChange('value', val)"
        >
        </bk-input>
        <bk-input
            v-bk-tooltips="{
                content: $t('在生成函数的时候会自动生成同名参数，调用函数的时候传入具体值'),
                width: '300px'
            }"
            class="input-param"
            :placeholder="$t('参数名')"
            :value="param"
            @change="(val) => handleChange('param', val)"
        >
        </bk-input>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent,
        ref
    } from '@vue/composition-api'

    export default defineComponent({
        props: {
            placeholder: {
                type: String,
                default: ''
            },
            value: {
                type: [String, Number],
                default: ''
            },
            param: {
                type: String,
                default: ''
            }
        },

        setup (props, { emit }) {
            const isPlaceholder = props.placeholder || ref(window.i18n.t('请输入值'))
            const handleChange = (key, val) => {
                emit('change', {
                    value: props.value,
                    param: props.param,
                    [key]: val
                })
            }

            return {
                isPlaceholder,
                handleChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .select-value {
        display: flex;
        align-items: center;
        justify-content: center;
        .input-value {
            flex: 1;
            &.control-active {
                z-index: 10;
            }
        }
        .input-param {
            margin-left: -1px;
            width: 80px;
        }
    }
</style>
