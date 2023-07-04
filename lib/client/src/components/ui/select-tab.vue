<template>
    <div class="tab-div">
        <div class="select-tab">
            <template v-for="item in tabList">
                <div
                    :key="item.id"
                    class="tab-item"
                    :class="{ 'active-tab': activeItem === item.id }"
                    @click="itemChange(item.id)"
                    v-bk-tooltips="{
                        content: item.tips,
                        disabled: !item.tips,
                        maxWidth: 400
                    }"
                >
                    <i v-if="item.icon" :class="`${item.icon} ${!item.name ? 'only-icon' : ''}`"></i>
                    <span>{{item.name}}</span>
                </div>
            </template>
        </div>
    </div>
</template>

<script>
    export default {
        props: {
            tabList: {
                type: Array,
                required: true
            },
            activeItem: {
                type: String,
                required: true
            },
            itemChange: {
                type: Function,
                default: () => {}
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/variable";
    .tab-div {
        background: #F0F1F5;
        padding: 4px 5px;
        border-radius: 2px;
        .select-tab {
            display: flex;
            .tab-item {
                flex: 1;
                font-size: 12px;
                color: #63656E;
                height: 24px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                &:hover {
                    background: #EAEBF0;
                }
                i {
                    margin-right: 2px;
                }
                .only-icon {
                    font-size: 14px;
                }
            }
            .active-tab {
                color: $primaryColor;
                background: #fff !important;
            }
        }
    }
</style>
