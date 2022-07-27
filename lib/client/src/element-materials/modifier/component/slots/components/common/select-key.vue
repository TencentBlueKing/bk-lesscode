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
            @change="val => changeParams('idKey', val)"
        >
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
            @change="val => changeParams('nameKey', val)"
        >
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
</style>
