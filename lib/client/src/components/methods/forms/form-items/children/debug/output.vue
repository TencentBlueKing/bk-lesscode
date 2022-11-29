<template>
    <ul class="debug-outputs">
        <li
            v-for="(output, index) in outputs"
            :key="index"
            class="debug-output"
        >
            <i :class="[output.icon, 'message-icon']"></i>
            {{ output.content }}
        </li>
    </ul>
</template>

<script>
    import {
        defineComponent
    } from '@vue/composition-api'

    export default defineComponent({
        props: {
            outputs: Array
        }
    })
</script>

<style lang="postcss" scoped>
    .debug-output {
        display: flex;
        align-items: flex-start;
        line-height: 23px;
        color: #DCDEE5;
        font-family: Consolas, "Courier New", monospace;
        .message-icon {
            margin: 0 8px 0 20px;
            font-size: 12px;
            color: #979BA5;
            line-height: 23px;
        }
        .error {
            color: #B34747;
        }
        &:hover {
            background: #313238;
        }
    }
</style>
