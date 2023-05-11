<template>
    <bk-dialog
        header-position="left"
        ext-cls="data-source-dialog"
        :mask-close="false"
        :auto-close="false"
        :width="sourceType === 'API' ? 960 : 780"
        :show-type-select="false"
        :value="show"
        @confirm="onConfirm"
        @cancel="onCancel">
        <div slot="header">
            <div class="title-contianer">
                <div class="title">{{ getTitle() }}</div>
                <div v-if="sourceType === 'CUSTOM'" class="custom-selection">
                    <bk-checkbox
                        :true-value="true"
                        :false-value="false"
                        :disabled="disabled"
                        v-model="localValIsDisplayTag">
                        <span v-bk-tooltips="showTagToolTips">{{ $t('显示为标签') }}</span>
                    </bk-checkbox>
                </div>
            </div>
        </div>
        <data-source
            v-if="show"
            ref="dataSource"
            :source-type="sourceType"
            :field-type="fieldType"
            :use-variable="true"
            :value="localVal"
            :disabled="disabled"
            :local-val-is-display-tag="localValIsDisplayTag"
            :api-detail="apiDetail"
            :res-array-tree-data="resArrayTreeData"
            @change="localVal = $event">
        </data-source>
        <div id="showTagToolTips" class="show-tag-tooltips" v-if="sourceType === 'CUSTOM'">
            <bk-table :data="toolTipData" ref="table" size="small" :outer-border="false">
                <bk-table-column
                    :label="$t('选项')"
                    prop="status"
                    :render-header="renderHeader">
                    <bk-tag ext-cls="choice-one">{{ $t('选项一') }}</bk-tag>
                    <bk-tag ext-cls="choice-two">{{ $t('选项二') }}</bk-tag>
                </bk-table-column>
            </bk-table>
        </div>
    </bk-dialog>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import DataSource from './data-source/index.vue'

    export default {
        name: 'DataSourceDialog',
        components: {
            DataSource
        },
        props: {
            show: {
                type: Boolean,
                default: false
            },
            apiDetail: {
                type: Object,
                default: () => ({})
            },
            resArrayTreeData: {
                type: Array,
                default: () => ([])
            },
            isDisplayTag: {
                type: Boolean,
                default: false
            },
            sourceType: String,
            fieldType: String,
            value: [Array, Object], // 自定义数据为Array，api数据、表单数据为Object`
            disabled: Boolean
        },
        data () {
            return {
                localVal: cloneDeep(this.value),
                localValIsDisplayTag: this.isDisplayTag,
                showTagToolTips: {
                    allowHtml: true,
                    width: 210,
                    content: '#showTagToolTips',
                    theme: 'light',
                    placement: 'top',
                    boundary: 'scrollParent',
                    appendTo: () => document.body
                },
                toolTipData: [{}, {}, {}]
            }
        },
        watch: {
            value (val) {
                this.localVal = cloneDeep(val)
            },
            isDisplayTag () {
                this.localValIsDisplayTag = this.isDisplayTag
            }
        },
        methods: {
            async onConfirm () {
                if (this.$refs.dataSource.validate()) {
                    this.$emit('confirm', { localVal: this.localVal, localValIsDisplayTag: this.localValIsDisplayTag })
                }
            },
            onCancel () {
                this.$emit('update:show', false)
                this.localVal = cloneDeep(this.value)
            },
            getTitle () {
                if (this.sourceType === 'CUSTOM') {
                    return this.$t('配置自定义数据')
                } else if (this.sourceType === 'API') {
                    return this.$t('配置接口数据源')
                } else {
                    return this.$t('配置表单数据')
                }
            },
            renderHeader (h, data) {
                return (
                <div>
                  <span class="custom-header-cell">{data.column.label} </span>
                  <span class="bk-table-column-filter-trigger bk-icon icon-funnel"></span>
                </div>
            )
            }
        }
    }
</script>
<style lang="postcss" scoped>
.data-source-content {
  padding: 3px 24px 26px;
  max-height: 384px;
  overflow: auto;
}
.title{
  font-size: 20px;
  color: #313238;
  height: 26px;
}
.title-contianer{
  position: relative;
  span{
    border-bottom: 1px dashed #C4C6CC;
  }
}
.show-tag-tooltips{
  >>> .bk-table {
    &:before {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      height: 0;
      content: "";
    }
  }
  padding: 8px;
   .choice-one{
     background:#3a84ff;
     color: #ffffff;
     font-size: 12px;

   }
    .choice-two{
      background:#2dcb56;
      color: #ffffff;
      font-size: 12px;

    }
}
.custom-selection{
  position: absolute;
  top: 2px;
  right: 20px;
}
</style>
<style lang="postcss">
.data-source-dialog .bk-dialog-body {
  padding: 0;
}
</style>
