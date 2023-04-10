<template>
    <div class="tab-div">
        <div class="select-tab">
            <template v-for="item in tabList">
                <div :key="item.id" class="tab-item" :class="{ 'active-tab': activeItem === item.id }" :style="{ color: activeItem === item.id ? activeColor : '' }" @click="itemChange(item.id)">
                    <i v-if="item.icon" :class="item.icon"></i>
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
            },
            activeColor: {
                type: String
                // default: '#fff'
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
                i {
                    margin-right: 2px;
                }
            }
            .active-tab {
                background: #fff;
            }
        }
    }
</style>
