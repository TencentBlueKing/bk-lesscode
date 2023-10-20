<template>
    <section class="compose-components">
        <bk-select
            class="compose-left"
            :value="type"
            :clearable="false"
            @change="handleTypeChange"
        >
            <bk-option
                v-for="typeItem,index in types"
                :key="index"
                :id="typeItem.id"
                :name="typeItem.name"
            />
        </bk-select>
        <slot></slot>
    </section>
</template>

<script>
    import {
        EVENT_ACTION_TYPE
    } from 'shared/function/constant'

    export default {
        props: {
            type: String
        },
        data () {
            return {
                types: [
                    { id: EVENT_ACTION_TYPE.COMPONENT, name: this.$t('组件'), default: [{ key: '', value: '' }] },
                    { id: EVENT_ACTION_TYPE.LINK, name: this.$t('跳转'), default: '' },
                    { id: EVENT_ACTION_TYPE.METHOD, name: this.$t('函数'), default: [] },
                    { id: EVENT_ACTION_TYPE.VARIABLE, name: this.$t('变量'), default: '' }
                ]
            }
        },
        methods: {
            handleTypeChange (type) {
                const defaultValue = this.types.find(item => item.id === type).default
                this.$emit('change', {
                    type,
                    value: defaultValue
                })
            }
        }
    }
</script>

<style lang="postcss" scoped>
.compose-components {
    display: flex;
    align-items: center;
    width: 100%;
}
.compose-left {
    width: 75px;
    margin-right: -1px;
    border-top-right-radius: 0px;
    border-bottom-right-radius: 0px;
    height: 32px;
    &.is-focus {
        z-index: 10;
    }
}
</style>
