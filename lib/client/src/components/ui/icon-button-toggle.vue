<template>
    <div class="icon-button-toggle">
        <div
            v-for="(item, index) in icons"
            :key="index"
            :class="['icon-button', { active: active === item }]"
            @click="handleToggle(item)">
            <i :class="['bk-drag-icon', `bk-drag-${item.icon}`]"></i>
        </div>
    </div>
</template>

<script lang="ts">
    import { defineComponent, ref, PropType, watch } from '@vue/composition-api'

    interface IButton {
        name: string
        icon: string
    }

    export default defineComponent({
        props: {
            icons: {
                type: Array as PropType<IButton[]>,
                default: () => []
            }
        },
        setup (props, { emit }) {
            const active = ref<IButton>(null)

            watch(() => props.icons, (icons) => {
                active.value = props.icons?.[0]
            }, { immediate: true })

            const handleToggle = (item: IButton) => {
                active.value = item
                emit('toggle', item.name, item)
            }

            return {
                active,
                handleToggle
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .icon-button-toggle {
        display: flex;
        align-items: center;
        height: 32px;
        padding: 0 4px;
        margin-left: 8px;
        background: #eaebf0;
        border-radius: 2px;
        .icon-button {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 24px;
            height: 24px;
            font-size: 16px;
            color: #979BA5;
            cursor: pointer;

            &.active,
            &:hover {
                color: #63656E;
                background: #fff;
            }

            & + .icon-button {
                margin-left: 4px;
            }
        }
    }
</style>
