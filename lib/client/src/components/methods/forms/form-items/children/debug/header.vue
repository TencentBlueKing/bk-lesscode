<template>
    <ul class="debug-headers" v-enClass="'en-debug-headers'">
        <li
            v-for="panel in panels"
            v-bk-tooltips="{
                content: panel.tips,
                disabled: !panel.tips,
                maxWidth: 400
            }"
            :class="{
                'debug-header': true,
                active: value === panel.name
            }"
            :key="panel.name"
            @click="$emit('input', panel.name)"
        >
            <span>{{ panel.label }}</span>
            <span
                v-if="panel.count"
                :class="{
                    error: panel.isError,
                    'debug-num': true
                }"
            >{{ panel.count }}</span>
        </li>
    </ul>
</template>

<script>
    import {
        defineComponent
    } from '@vue/composition-api'

    export default defineComponent({
        props: {
            panels: Array,
            value: String
        }
    })
</script>

<style lang="postcss" scoped>
    .debug-headers {
        height: 40px;
        background: #2E2E2E;
        display: flex;
        align-items: center;
        .debug-header {
            position: relative;
            cursor: pointer;
            width: 108px;
            text-align: center;
            line-height: 40px;
            color: #C4C6CC;
            position: relative;
            &:not(:last-child):after {
                content: '';
                position: absolute;
                top: 12px;
                right: -0.5px;
                height: 16px;
                width: 1px;
                background: #45464D;
            }
        }
        .active {
            background: #212121;
            color: #F5F7FA;
            &::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                height: 3px;
                width: 103px;
                background: #3A84FF;
            }
        }
        .debug-num {
            padding: 1px 6px;
            border-radius: 20px;
            background: #50525A;
            margin-left: 8px;
            &.error {
                background: #EA3636;
            }
        }
    }
    .en-debug-headers{
        .debug-header {
            width: 150px;
        }
        .active {
            &::before {
                width: 150px;
            }
        }
    }
</style>
