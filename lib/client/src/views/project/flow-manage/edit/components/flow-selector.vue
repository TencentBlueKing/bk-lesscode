<template>
    <div class="flow-selector-wrapper">
        <bk-select
            style="width: 340px;"
            ext-cls="flow-selector"
            ext-popover-cls="select-flow-dropdown"
            :value="flowConfig.id"
            :clearable="false"
            :searchable="true"
            @change="handleFlowChange">
            <div class="selected-flow-trigger" slot="trigger">
                <i class="bk-drag-icon bk-drag-flow-fill"></i>
                <div class="flow-name">{{ flowConfig.name }}</div>
                <i class="bk-select-angle bk-icon icon-angle-down" />
            </div>
            <bk-option
                v-for="flow in flowList"
                :key="flow.id"
                :id="flow.id"
                :name="flow.name">
            </bk-option>
        </bk-select>
    </div>
</template>
<script>
    export default {
        name: 'FlowSelector',
        props: {
            flowConfig: {
                type: Object,
                default () {
                    return {}
                }
            }
        },
        data () {
            return {
                flowList: []
            }
        },
        methods: {
            handleFlowChange () {}
        }
    }
</script>
<style lang="postcss" scoped>
    .flow-selector {
        background: #f5f7fa;
        border: none;
        border-radius: 2px;
        &:hover {
            background: #dedee5;
        }
        &.is-focus {
            box-shadow: none;
            background: #dedee5;
        }
    }
    .selected-flow-trigger {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin: 0 24px 0 10px;
        height: 32px;
    }
    .flow-name {
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
