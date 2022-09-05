<template>
    <section>
        <div
            class="g-prop-sub-title g-mb6 g-mt8 subline"
            v-bk-tooltips="{
                content: '用于赋值的字段名，不选则为 id',
                placements: ['left-start'],
                boundary: 'window'
            }"
        >id 配置</div>
        <bk-select
            class="g-mb8"
            :value="params.idKey"
            :loading="isLoading"
            @change="val => changeParams('idKey', val)"
        >
            <span
                class="display-value"
                slot="trigger"
            >
                {{ params.idKey }}
                <i class="bk-select-angle bk-icon icon-angle-down"></i>
            </span>
            <bk-option
                v-for="option in options"
                :key="option"
                :id="option"
                :name="option"
            />
        </bk-select>
        <div
            class="g-prop-sub-title g-mb6 g-mt8 subline"
            v-bk-tooltips="{
                content: '用于展示的字段名，不选则为 name',
                placements: ['left-start'],
                boundary: 'window'
            }"
        >name 配置</div>
        <bk-select
            :value="params.nameKey"
            :loading="isLoading"
            @change="val => changeParams('nameKey', val)"
        >
            <span
                class="display-value"
                slot="trigger"
            >
                {{ params.nameKey }}
                <i class="bk-select-angle bk-icon icon-angle-down"></i>
            </span>
            <bk-option
                v-for="option in options"
                :key="option"
                :id="option"
                :name="option"
            />
        </bk-select>
    </section>
</template>

<script lang="ts">
    import {
        defineComponent
    } from '@vue/composition-api'

    export default defineComponent({
        props: {
            params: {
                type: Object,
                default: () => ({})
            },
            options: {
                type: Array,
                default: () => ([])
            },
            isLoading: {
                type: Boolean,
                default: false
            }
        },

        setup (_, { emit }) {
            const changeParams = (key, value) => {
                emit('change', { key, value })
            }

            return {
                changeParams
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .subline {
        cursor: pointer;
        border-bottom: 1px dashed #63656E;
    }
    .display-value {
        display: inline-block;
        line-height: 32px;
        padding: 0 36px 0 10px;
    }
</style>
