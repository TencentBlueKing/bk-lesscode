<template>
    <div class="category-tabs">
        <slot />
        <template v-for="tab in renderList">
            <div
                :key="tab.key"
                class="tab-item"
                :class="{ active: tab.key === currentTab }"
                @click="handleChangeTab(tab.key)">
                <span class="tab-item-label">{{ tab.name }}</span>
            </div>
        </template>
    </div>
</template>

<script>
    import { defineComponent, toRef } from '@vue/composition-api'

    export default defineComponent({
        props: {
            tabList: {
                type: Array,
                required: true
            },
            current: {
                type: String,
                required: true
            },
            changeTab: {
                type: Function,
                required: true
            }
        },
        setup (props) {
            const renderList = toRef(props, 'tabList')
            const currentTab = toRef(props, 'current')

            const handleChangeTab = (key) => {
                props.changeTab(key)
            }

            return {
                currentTab,
                renderList,
                handleChangeTab
            }
        }
    })
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";
    @import "@/css/mixins/scroller";

    .category-tabs {
        display: flex;
        height: 42px;
        user-select: none;

        .tab-item {
            display: flex;
            justify-content: center;
            /* align-items: center; */
            height: 42px;
            line-height: 42px;
            background: #F5F7FA;
            border-bottom: 1px solid #EAEBF0;
            border-right: 1px solid #EAEBF0;
            flex: 1 1;
            font-size: 12px;
            padding: 0 10px;
            white-space: nowrap;
            cursor: pointer;
            user-select: none;
            &:hover {
                color: #3A84FF;
            }
            &:first-child{
                margin-right: auto;
            }
            &.active {
                color: #3A84FF;
                background: #FFF;
                border-bottom: none;
            }
            .tab-item-label {
                font-size: 12px;
                @mixin ellipsis 110px;
            }
            .toggle-icon {
                line-height: 42px;
                overflow: hidden;
                display: inline-block;
            }
        }
    }
</style>
