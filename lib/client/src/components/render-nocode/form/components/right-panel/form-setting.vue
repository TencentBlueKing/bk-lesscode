<template>
    <!--    <div>form-setting</div>-->
    <div :class="['config-panel',{ 'config-empty': !Object.keys(configData).length }]">
        <div v-if="Object.keys(configData).length" class="field-setting">
            <div class="panel-title">{{ fieldType[configData.type] || $t('组件名称')}}</div>
            <div class="config-wrapper">
                <field-edit
                    v-if="field.type"
                    v-model="configData"
                    :list="list"
                    :disabled="disabled"
                    @change="$emit('update', $event)">
                </field-edit>
            </div>
        </div>
        <div class="empty-field" v-else>
            {{ $t('请从左侧拖入组件或者选中组件') }} </div>
    </div>
</template>

<script>
    import cloneDeep from 'lodash.clonedeep'
    import { FIELDS_TYPES_MAPS } from '../../../common/form'
    import fieldEdit from '../form-edit/fieldEdit.vue'
    export default {
        name: 'FormSetting',
        components: {
            fieldEdit
        },
        props: {
            disabled: Boolean,
            field: {
                type: Object,
                default: () => ({})
            },
            list: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                configData: cloneDeep(this.field),
                fieldType: FIELDS_TYPES_MAPS
            }
        },
        watch: {
            field (val) {
                this.configData = cloneDeep(val)
            }
        }
    }
</script>

<style lang="postcss" scoped>
@import "@/css/mixins/scroller";
.config-panel {
  position: relative;
  height: 100%;
  background: #ffffff;
  z-index: 1;
  .field-setting{
    height: 100%;
  }
}

.config-empty{
  display: flex;
  align-items: center;
  justify-content: center;
}
.panel-title {
  padding: 0 16px;
  height: 40px;
  line-height: 40px;
  font-size: 14px;
  color: #313238;
  text-align: center;
  background: #ffffff;
  border-top: 1px solid #dcdee5;
  border-bottom: 1px solid #dcdee5;
}

.config-wrapper {
  padding: 0 12px;
  height: 100%;
  overflow-y: auto;
  @mixin scroller;
  overflow-x: hidden;
}
.empty-field{
  background: #FFFFFF;
  font-size: 14px;
  color: #63656E;
  text-align: center;
}
</style>
