<template>
    <prop-group :title="$t('表单操作')">
        <div class="operate-actions-setting">
            <bk-checkbox :value="value.submit" @change="handleChange('submit', $event)">{{ $t('显示提交按钮') }}</bk-checkbox>
            <bk-checkbox :value="value.reset" @change="handleChange('reset', $event)">{{ $t('显示重置按钮') }}</bk-checkbox>
        </div>
    </prop-group>
</template>
<script>
import propGroup from './prop-group.vue'

export default {
    name: '',
    components: {
        propGroup
    },
    props: {
      value: {
        type: Object,
        default: () => ({
          submit: false,
          reset: false
        })
      }
    },
    methods: {
      handleChange (key, value) {
        const val = { ...this.value, [key]: value }
        this.$emit('change', val)
      }
    }
}
</script>
<style lang="postcss" scoped>
  .operate-actions-setting {
    >>> .bk-form-checkbox {
      display: block;
      .bk-checkbox-text {
        font-size: 12px;
      }
      &:not(:last-of-type) {
        margin-bottom: 14px;
      }
    }
  }
</style>