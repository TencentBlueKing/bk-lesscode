<template>
    <section class="custom-buttons">
        <bk-button
            v-for="button in buttons.slice(0, 4)"
            v-bind="getProperties(button)"
            :key="button.id">
            {{ button.name }}
        </bk-button>
        <bk-dropdown-menu
            v-if="buttons.length > 4"
            ref="dropdown"
            @show="isDropdownShow = true"
            @hide="isDropdownShow = false">
            <div class="more-buttons-trigger" slot="dropdown-trigger">
                更多
                <i :class="['bk-icon icon-angle-down angle-icon', { 'active': isDropdownShow }]"></i>
            </div>
            <ul class="more-btns-list" slot="dropdown-content">
                <li v-for="button in buttons.slice(4)" :key="button.id" class="button-item">{{ button.name }}</li>
            </ul>
        </bk-dropdown-menu>
    </section>
</template>
<script>
    export default {
        name: 'CustomButtons',
        props: {
            buttons: Array
        },
        data () {
            return {
                isDropdownShow: false
            }
        },
        methods: {
            getProperties (button) {
                const props = {}
                Object.keys(button.props).forEach(key => {
                    props[key] = button.props[key].val
                })
                return props
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .custom-buttons {
        display: flex;
        align-items: center;
        .bk-button {
            margin-right: 8px;
        }
    }
    .more-buttons-trigger {
        margin-right: 8px;
        padding: 0 8px 0 16px;
        height: 32px;
        line-height: 32px;
        font-size: 14px;
        color: #63656e;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        cursor: pointer;
        .angle-icon {
            display: inline-block;
            font-size: 20px;
            transition: transform .3s cubic-bezier(.4, 0, .2, 1);
            &.active {
                transform: rotate(-180deg);
            }
        }
    }
    .more-btns-list {
        .button-item {
            padding: 0 16px;
            height: 32px;
            line-height: 32px;
            font-size: 14px;
            color: #63656e;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
                background: #f0f1f5;
            }
        }
    }
</style>
