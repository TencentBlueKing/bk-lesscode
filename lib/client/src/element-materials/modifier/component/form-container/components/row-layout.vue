<template>
    <prop-group :title="$t('表单布局')">
        <div class="row-layout-setting">
            <bk-radio-group :value="value" class="setting-radios" @change="$emit('change', $event)">
              <bk-radio value="full">{{ $t('一行一排') }}</bk-radio>
              <bk-radio value="half">{{ $t('一行两排') }}</bk-radio>
            </bk-radio-group>
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
        type: String,
        default: 'full'
      }
    }
}
</script>
<style lang="postcss" scoped>
  .setting-radios {
    >>> .bk-radio-text {
      min-width: 100px;
      font-size: 12px;
    }
  }
</style>
