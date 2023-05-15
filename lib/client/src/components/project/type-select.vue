<template>
    <bk-select
        v-model="type"
        :clearable="false"
        :ext-cls="'type-select'"
        @change="handleChange">
        <bk-option v-for="option in typeList"
            :key="option.id"
            :id="option.id"
            :name="option.name">
        </bk-option>
    </bk-select>
</template>

<script>
    const typeSelectList = [
        {
            id: 'ALL',
            name: window.i18n.t('全部')
        },
        {
            id: 'PC',
            name: window.i18n.t('PC端')
        },
        {
            id: 'MOBILE',
            name: window.i18n.t('移动端')
        }
    ]

    export default {
        name: 'type-select',
        data () {
            return {
                type: 'ALL',
                typeList: typeSelectList
            }
        },
        methods: {
            handleChange () {
                this.$emit('select-change', this.type)
            }
        }
    }
</script>

<style lang="postcss"  scoped>
    .type-select {
        width: 90px;
        background: #fff;
        display: inline-block;
        margin-right: 8px;
    }
</style>
