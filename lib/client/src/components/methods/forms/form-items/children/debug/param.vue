<template>
    <section>
        <ul class="debug-params" v-if="renderParams.length">
            <li
                v-for="(renderParam, index) in renderParams"
                :key="index"
                class="debug-param"
            >
                <span class="param-title">{{ renderParam.key }}</span>
                <bk-input
                    class="param-value"
                    placeholder="请输入参数值"
                    :value="renderParam.value"
                    @change="(val) => changeParam(val, index)"
                ></bk-input>
            </li>
        </ul>
    </section>
</template>

<script>
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'

    export default defineComponent({
        props: {
            params: Array
        },

        setup (props, { emit }) {
            const renderParams = ref([])

            const changeParam = (val, index) => {
                renderParams.value[index].value = val
                emit('param-change', renderParams.value)
            }

            watch(
                () => props.params,
                () => {
                    renderParams.value = props.params
                },
                {
                    immediate: true
                }
            )

            return {
                renderParams,
                changeParam
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .debug-params {
        margin: 18px 16px;
        border-top: 1px solid #333333;
        border-left: 1px solid #333333;
    }
    .debug-param {
        display: flex;
        align-items: center;
        line-height: 32px;
        border-right: 1px solid #333333;
        border-bottom: 1px solid #333333;
        color: #C4C6CC;
    }
    .param-title {
        padding: 0 16px;
        width: 144px;
        border-right: 1px solid #333333;
    }
    .param-value {
        flex: 1;
        /deep/ .bk-form-input {
            background: #212121;
            border: 1px solid #212121;
            color: #C4C6CC;
            &:focus {
                background: #212121 !important;
                color: #C4C6CC !important;
                border: 1px solid #3A84FF;
            }
            &::placeholder {
                color: #63656E;
            }
        }
    }
</style>
