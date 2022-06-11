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
                        v-model="localValIsDisplayTag">
                        是否启用白名单
                    </bk-checkbox>
                </div>
            </div>
        </div>
        <data-source
            v-if="show"
            ref="dataSource"
            :app-id="appId"
            :source-type="sourceType"
            :field-type="fieldType"
            :use-variable="false"
            :value="localVal"
            :api-detail="apiDetail"
            :res-array-tree-data="resArrayTreeData"
            @change="localVal = $event">
        </data-source>
    </bk-dialog>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import DataSource from './dataSource/index.vue'

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
            appId: String,
            sourceType: String,
            fieldType: String,
            value: [Array, Object] // 自定义数据为Array，api数据、表单数据为Object`
        },
        data () {
            return {
                localVal: cloneDeep(this.value),
                localValIsDisplayTag: this.isDisplayTag
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
                    return '配置自定义数据'
                } else if (this.sourceType === 'API') {
                    return '配置接口数据源'
                } else {
                    return '配置表单数据'
                }
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
}
.custom-selection{
  position: absolute;
  top: 2px;
  left: 164px;
}
</style>
<style lang="postcss">
.data-source-dialog .bk-dialog-body {
  padding: 0;
}
</style>
