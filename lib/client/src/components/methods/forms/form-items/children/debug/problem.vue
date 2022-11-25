<template>
    <ul class="debug-problems">
        <li
            v-for="(problem, index) in problems"
            :key="index"
            class="debug-problem"
            @click="$emit('show-problem', problem)"
        >
            <i class="bk-icon icon-close-circle-shape problem-icon"></i>
            {{ problem.message }} ({{ problem.ruleId }})
        </li>
    </ul>
</template>

<script>
    import {
        defineComponent
    } from '@vue/composition-api'

    export default defineComponent({
        props: {
            problems: Array
        }
    })
</script>

<style lang="postcss" scoped>
    .debug-problem {
        cursor: pointer;
        display: flex;
        align-items: flex-start;
        line-height: 23px;
        color: #DCDEE5;
        font-family: Consolas, "Courier New", monospace;
        .problem-icon {
            margin: 0 8px 0 20px;
            font-size: 12px;
            color: #B34747;
            line-height: 23px;
        }
        &:hover {
            background: #313238;
        }
    }
</style>
