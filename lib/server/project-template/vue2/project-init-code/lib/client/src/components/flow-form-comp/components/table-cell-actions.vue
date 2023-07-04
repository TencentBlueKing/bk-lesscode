<template>
    <section class="table-cell-actions">
        <bk-button
            v-for="button in buttons.slice(0, 3)"
            v-bind="getProperties(button)"
            :key="button.id"
            text
            @click="handleClick(button)">
            {{ button.name }}
        </bk-button>
        <bk-popover
            v-if="buttons.length > 3"
            ref="popover"
            ext-cls="actions-list-popover"
            placement="bottom-start"
            :tippy-options="{ theme: 'light', arrow: false, distance: 5, hideOnClick: false }"
            :on-show="popShow"
            :on-hide="popHide">
            <i :class="['bk-icon icon-more more-actions-icon', { active: isPopOpen }]" @click="$refs.popover.showHandler()"></i>
            <ul class="actions-list" slot="content">
                <li
                    v-for="button in buttons.slice(3)"
                    :key="button.id"
                    class="action-item"
                    @click="handleClick(button)">
                    {{ button.name }}
                </li>
            </ul>
        </bk-popover>
    </section>
</template>
<script>
    export default {
        name: 'TableCellActions',
        props: {
            buttons: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                isPopOpen: false
            }
        },
        methods: {
            getProperties (button) {
                const props = {}
                Object.keys(button.props).forEach(key => {
                    props[key] = button.props[key].val
                })
                return props
            },
            popShow () {
                this.isPopOpen = true
            },
            popHide () {
                this.isPopOpen = false
            },
            handleClick (button) {
                this.$emit('click', button)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .table-cell-actions {
        display: flex;
        align-items: center;
    }
    .bk-button-text:not(:first-of-type) {
        margin-left: 8px;
    }
    .more-actions-icon {
        display: inline-block;
        height: 16px;
        width: 16px;
        color: #63656e;
        font-size: 16px;
        background: transparent;
        border-radius: 50%;
        cursor: pointer;
        &:hover,
        &.active {
            color: #3a84ff;
            background: #f5f7fa;
        }
    }
</style>
<style lang="postcss">
    .actions-list-popover .tippy-tooltip {
        padding: 0;
        .actions-list {
            padding: 5px 0;
            max-height: 138px;
            background: #ffffff;
            overflow: auto
        }
        .action-item {
            padding: 0 8px;
            min-width: 80px;
            height: 32px;
            line-height: 32px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            &:hover {
                background: #f0f1f5;
                color: #3a84ff;
                cursor: pointer;
            }
        }
    }
</style>
