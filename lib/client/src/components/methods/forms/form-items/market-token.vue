<template>
    <lc-form :label-width="200" :model="copyForm" ref="funcForm" :form-type="formType" v-if="copyForm.funcType === 1">
        <lc-form-item property="withToken" class="token-item">
            <bk-checkbox :true-value="1"
                :false-value="0"
                v-model="copyForm.withToken"
                @change="(val) => updateValue('withToken', val)"
            >{{ $t('蓝鲸应用认证') }}</bk-checkbox>
        </lc-form-item>
    </lc-form>
</template>

<script>
    import mixins from './form-item-mixins'

    export default {
        mixins: [mixins]
    }
</script>

<style lang="postcss">
    .token-item {
        margin: 10px 0 -10px;
    }
    .token-tip {
        font-size: 12px;
        line-height: 16px;
        a {
            color: #3a84ff;
        }
    }
</style>
