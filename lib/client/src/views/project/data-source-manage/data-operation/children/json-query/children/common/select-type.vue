<template>
    <bk-dropdown-menu
        align="right"
        class="dropdown-menu"
        ref="dropdownRef"
        :disabled="disable"
    >
        <slot
            slot="dropdown-trigger"
            name="dropdown-trigger"
        >
            <span class="dropdown-trigger">{{ displayValue }}</span>
        </slot>
        <ul
            slot="dropdown-content"
            class="bk-dropdown-list"
        >
            <li
                v-for="(item, index) in list"
                :key="index"
                :class="item.disabled ? 'disabled' : ''"
                @click="handleChooseType(item)"
            >{{ item.name }}</li>
        </ul>
    </bk-dropdown-menu>
</template>

<script lang="ts">
    import {
        defineComponent,
        PropType,
        computed,
        ref,
        onMounted,
        getCurrentInstance
    } from '@vue/composition-api'

    type item = {
        disabled: boolean,
        name: string,
        id: string
    }

    export default defineComponent({
        props: {
            list: {
                type: Array as PropType<item[]>
            },
            value: {
                type: String,
                default: ''
            },
            disable: {
                type: Boolean,
                default: false
            }
        },

        emits: ['change'],

        setup (props, { emit }) {
            const instance = getCurrentInstance()
            const dropdownRef = ref()
            const displayValue = computed(() => {
                const current = props.list?.find(item => item.id === props.value) || { name: '' }
                return current.name || props.value
            })

            const handleChooseType = (item) => {
                if (item.disabled) return

                dropdownRef.value.hide()
                emit('change', item.id)
            }

            // fix 组件库样式
            const deleteDiv = () => {
                instance.proxy.$el.removeChild(instance.proxy.$el.children[1])
            }

            onMounted(deleteDiv)

            return {
                dropdownRef,
                displayValue,
                handleChooseType
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .bk-dropdown-list {
        li {
            cursor: pointer;
            line-height: 32px;
            padding: 0 12px;
            font-size: 12px;
            width: 100%;
            min-width: max-content;
            &:hover {
                background: #E1ECFF;
                color: #3A84FF;
            }
        }
    }
    .dropdown-trigger {
        cursor: pointer;
        display: inline-block;
        background: #FFFFFF !important;
        border: 1px solid #C4C6CC !important;
        border-radius: 2px;
        width: 65px;
        font-weight: 400;
        font-size: 12px;
        color: #E76E0B;
        text-align: center;
        line-height: 30px;
    }
</style>
