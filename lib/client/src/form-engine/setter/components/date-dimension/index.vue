<template>
  <section>
      <setter-form-item :title="$t('form_日期选择维度')">
        <bk-radio-group
            class="g-prop-radio-group date-dimension-radios"
            :value="value"
            @change="$emit('change', $event)">
            <bk-radio-button
                v-for="item in dimensions"
                :disabled="disabled"
                :key="item"
                :value="item">
                {{ item }}
            </bk-radio-button>
        </bk-radio-group>
      </setter-form-item>
  </section>
</template>
<script>
  import setterFormItem from '../../common/setter-form-item.vue'

  export default {
      name: 'setter-date-dimension',
      inheritAttrs: false,
      components: {
          setterFormItem
      },
      props: {
          field: {
              type: Object,
              default: () => ({})
          },
          disabled: Boolean,
          value: {
              type: String,
              default: 'date'
          }
      },
      data () {
          return {
            dimensions: ['date', 'datetime', 'month', 'year']
          }
      }
  }
</script>
<style lang="postcss" scoped>
  .date-dimension-radios {
    /deep/ .bk-radio-button-text {
      padding: 0;
    }
  }
</style>
