<template>
    <div class="operation-select">
        <div
            class="select-item"
            :class="{ active: value === 'edit' }"
            @click="handleChange('edit')">
            <i class="bk-drag-icon bk-drag-huabu" />
            <span>{{ $t('画布') }}</span>
        </div>
        <div
            class="select-item"
            :class="{ active: value === 'vueCode' }"
            v-enStyle="'white-space: nowrap'"
            @click="handleChange('vueCode')">
            <i class="bk-drag-icon bk-drag-yuanma" />
            <span>{{ $t('源码') }}</span>
        </div>
        <div
            class="select-item"
            :class="{ active: value === 'jsonSource' }"
            @click="handleChange('jsonSource')">
            <i class="bk-drag-icon bk-drag-json" />
            <span>JSON</span>
        </div>
        <div
            class="select-item"
            :class="{ active: value === 'pageFunction' }"
            v-enStyle="'white-space: nowrap'"
            @click="handleChange('pageFunction')">
            <i class="bk-drag-icon bk-drag-yemianhanshu" />
            <span>{{ $t('页面函数') }}</span>
        </div>
        <div
            class="select-item"
            :class="{ active: value === 'pageVariable' }"
            v-enStyle="'white-space: nowrap'"
            @click="handleChange('pageVariable')">
            <i class="bk-drag-icon bk-drag-page-variable" />
            <span>{{ $t('页面变量') }}</span>
        </div>
        <div
            class="select-item"
            :class="{ active: value === 'setting' }"
            v-enStyle="'white-space: nowrap'"
            @click="handleChange('setting')">
            <i class="bk-drag-icon bk-drag-set" />
            <span>{{ $t('页面设置') }}</span>
        </div>
    </div>
</template>
<script>
    import LC from '@/element-materials/core'

    export default {
        name: '',
        props: {
            value: {
                type: String,
                default: 'edit'
            }
        },
        methods: {
            handleChange (value) {
                this.$emit('input', value)
                const activeNode = LC.getActiveNode()
                if (activeNode) {
                    activeNode.activeClear()
                }
                LC.triggerEventListener('componentMouserleave', {
                    type: 'componentMouserleave'
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .operation-select{
        display: flex;
        height: 100%;
        .select-item{
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            font-size: 12px;
            height: 100%;
            cursor: pointer;
            min-width: 60px;
            margin-right: 10px;
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
