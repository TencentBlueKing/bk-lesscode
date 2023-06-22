<template>
    <div class="ui-group-box" :class="{ 'box-border-top': showBorderTop }">
        <div class="ui-group-name" @click="handleToggle" v-bk-tooltips="{ content: groupName,disabled: !(groupName && groupName.length > 17), maxWidth: 400 }">
            <i
                class="bk-drag-icon bk-drag-arrow-down toggle-arrow"
                :class="{
                    floded: isFolded
                }" />
            <span>{{ groupName }}</span>
        </div>
        <template v-if="!isFolded">
            <slot />
        </template>
    </div>
</template>
<script>
    export default {
        props: {
            // 分组展示名
            groupName: String,
            // 默认是否折叠
            folded: {
                type: Boolean,
                default: false
            },
            // 默认是否折叠
            showBorderTop: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                isFolded: this.folded
            }
        },
        methods: {
            handleToggle () {
                this.isFolded = !this.isFolded
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .box-border-top {
        border-top: 1px solid #dde4eb;
    }
    .ui-group-box {
        margin-bottom: 8px;
        .ui-group-name {
            margin-left: 6px;
            height: 32px;
            font-size: 12px;
            color: #313238;
            font-weight: Bold;
            position: relative;
            display: flex;
            align-items: center;
            &:hover{
                cursor: pointer;
            }
            .toggle-arrow {
                position: absolute;
                display: block;
                line-height: 32px;
                top: 0;
                left: 0;
                font-size: 24px;
                color: #63656E;
                transition: all .1s linear;
                &.floded {
                    transform: rotate(-90deg);
                }
            }
            span {
                display: block;
                position: absolute;
                top: 0;
                left: 24px;
                line-height: 32px;
            }
        }
    }
</style>
