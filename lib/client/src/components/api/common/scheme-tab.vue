<template>
    <section class="scheme-main">
        <bk-tab
            class="tab-main"
            type="unborder-card"
            :active="active"
            :label-height="42"
            @tab-change="handleTabChange"
        >
            <template slot="setting">
                <slot name="tool"></slot>
            </template>
            <bk-tab-panel
                v-for="(panel, index) in tabs"
                v-bind="panel"
                :key="index">
            </bk-tab-panel>
        </bk-tab>
        <section class="tab-component">
            <slot></slot>
        </section>
    </section>
</template>

<script>
    import {
        defineComponent
    } from '@vue/composition-api'
    
    export default defineComponent({
        props: {
            tabs: Array,
            active: String
        },

        setup (_, { emit }) {
            const handleTabChange = (tabName) => {
                emit('update:active', tabName)
            }

            return {
                handleTabChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .scheme-main {
        background: #FAFBFD;
        padding-bottom: 20px;
    }
    .tab-main {
        /deep/ .bk-tab-section {
            padding: 0;
        }
        /deep/ .bk-tab-header {
            height: 42px;
            background-image: none !important;
            .bk-tab-label-list {
                height: 42px !important;
                .bk-tab-label-item {
                    line-height: 42px !important;
                }
                .bk-tab-label {
                    font-size: 12px;
                }
            }
        }
    }
    .tab-component {
        margin-top: 16px;
    }
</style>
