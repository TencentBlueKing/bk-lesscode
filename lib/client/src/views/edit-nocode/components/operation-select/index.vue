<template>
    <div class="operation-select">
        <div
            v-for="item in operationList"
            class="select-item"
            :class="{ active: value === item.key }"
            :key="item.key"
            @click="handleChange(item.key)">
            <i :class="`bk-drag-icon ${item.icon}`" />
            <span>{{item.label}}</span>
        </div>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'

    export default {
        name: '',
        props: {
            value: {
                type: String,
                default: 'edit'
            },
            hideSetting: Boolean,
            hideFunc: Boolean,
            hideJson: Boolean
        },
        computed: {
            ...mapGetters('page', ['pageDetail']),
            operationList () {
                const list = [
                    {
                        key: 'edit',
                        label: ['FLOW_MANAGE', 'FORM_MANAGE'].includes(this.pageDetail.nocodeType) ? window.i18n.t('数据管理设计') : (this.pageDetail.nocodeType === 'FORM' ? window.i18n.t('表单设计') : window.i18n.t('画布')),
                        icon: 'bk-drag-huabu'
                    }
                ]
                if (!this.hideJson) {
                    list.push({
                        key: 'jsonSource',
                        label: 'JSON',
                        icon: 'bk-drag-json'
                    })
                }
                if (!this.hideFunc) {
                    list.push({
                        key: 'pageFunction',
                        label: window.i18n.t('页面函数'),
                        icon: 'bk-drag-yemianhanshu'
                    })
                }
                if (!this.hideSetting) {
                    list.push({
                        key: 'setting',
                        label: window.i18n.t('页面设置'),
                        icon: 'bk-drag-set'
                    })
                }
                return list
            }
        },
        methods: {
            handleChange (value) {
                this.$emit('input', value)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .operation-select{
        display: flex;
        height: 100%;
        align-items: center;
        .select-item{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            margin-right: 10px;
            padding: 0 6px;
            font-size: 12px;
            height: 100%;
            cursor: pointer;
            min-width: 60px;
            &:hover,
            &.active {
                background-color: #e1ecff;
                color: #3a84ff;
            }
            i {
                font-size: 16px;
                margin-bottom: 5px;
            }
        }
    }
</style>
