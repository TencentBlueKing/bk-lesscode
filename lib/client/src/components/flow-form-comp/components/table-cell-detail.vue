<template>
    <bk-sideslider
        :title="`详情【${tableName}】`"
        ext-cls="table-cell-detail-sidelider"
        :width="800"
        :is-show="show"
        :quick-close="true"
        :show-mask="true"
        :before-close="handleClose">
        <div slot="content" class="custom-detail-form" style="min-height: 400px;" v-bkloading="{ isLoading: loading }">
            <bk-form v-if="!loading" :label-width="150">
                <bk-form-item v-for="field in fields" :label="`${field.name}:`" :key="field.key">
                    <span v-if="DATA_SOURCE_FIELD.includes(field.type)">
                        {{ transformFields(field) }}
                    </span>
                    <div v-else-if="field.type === 'RICHTEXT'">
                        <rich-text :disabled="true" :value="value[field.key] || '--'" />
                    </div>
                    <span v-else-if="field.type === 'IMAGE'">
                        <image-file :view-mode="true" :value="value[field.key]" v-if="value[field.key] && value[field.key].length !== 0"></image-file>
                        <span v-else>--</span>
                    </span>
                    <span v-else-if="field.type === 'TABLE'">
                        <bk-table :data="value[field.key]" v-if="value[field.key] && value[field.key].length !== 0">
                            <template v-for="col in field.choice">
                                <bk-table-column :label="col.name" :key="col.key">
                                    <template slot-scope="{ row }">
                                        <span>{{ row[col.key] }}</span>
                                    </template>
                                </bk-table-column>
                            </template>
                        </bk-table>
                        <span v-else>--</span>
                    </span>
                    <span v-else-if="field.type === 'FILE'">
                        <bk-button
                            v-if="value[field.key]"
                            theme="primary"
                            style="margin-right: 8px"
                            @click="handleDownload(value[field.key])"
                            text>
                            点击下载
                        </bk-button>
                        <span v-else>--</span>
                    </span>
                    <span v-else-if="field.type === 'TEXT'" v-html="textTrans(value[field.key])">
                    </span>
                    <span v-else>{{ value[field.key] || '--' }}</span>
                </bk-form-item>
            </bk-form>
        </div>
    </bk-sideslider>
</template>
<script>
    import ImageFile from '../form/fields/imageFile.vue'
    import RichText from '../form/fields/richText.vue'
    import { DATA_SOURCE_FIELD } from '../form/constants/forms.js'

    export default {
        name: 'TableCellDetail',
        components: {
            ImageFile,
            RichText
        },
        props: {
            tableName: String,
            id: Number,
            fields: {
                type: Array,
                default: () => []
            }
        },
        data () {
            return {
                show: true,
                DATA_SOURCE_FIELD,
                value: {},
                loading: true
            }
        },
        created () {
            this.initChoice()
            this.getData()
        },
        methods: {
            async getData () {
                try {
                    this.loading = true
                    const res = await this.$http.get(`/data-source/user/tableName/${this.tableName}/id/${this.id}`)
                    this.value = res.data
                } catch (e) {
                    console.log(e.message || e)
                } finally {
                    this.loading = false
                }
            },
            initChoice () {
                this.fields.forEach(field => {
                    const { type, source_type: sourceType } = field
                    if (DATA_SOURCE_FIELD.includes(type) && sourceType !== 'CUSTOM_TYPE') {
                        this.setSourceData(field)
                    }
                })
            },
            transformFields (field) {
                let showValue = ''
                if (DATA_SOURCE_FIELD.includes(field.type)) {
                    if (['MULTISELECT', 'CHECKBOX'].includes(field.type)) {
                        const tempArr = []
                        field.choice.forEach((item) => {
                            const val = this.value[field.key]
                            if (val && Array.isArray(val.split(','))) {
                                val.split(',').forEach((val) => {
                                    if (item.key === val) {
                                        tempArr.push(item.name)
                                    }
                                })
                            }
                        })
                        showValue = tempArr.toString()
                    } else {
                        field.choice.forEach((item) => {
                            if (item.key === this.value[field.key]) {
                                showValue = item.name
                            }
                        })
                    }
                }
                return showValue || '--'
            },
            handleDownload (val) {
                val.forEach((item) => {
                    window.open(`${window.location.origin}${window.SITE_URL}api/misc/download_file/?file_name=${item.file_name}&origin_name=${item.origin_name}&download_flag=1`)
                })
            },
            setSourceData (field) {
                if (field.source_type === 'API') {
                    this.setApiData(field)
                } else if (field.source_type === 'WORKSHEET') {
                    this.setWorksheetData(field)
                }
            },
            async setApiData (field) {
                try {
                    const { id, api_info, api_instance_id, kv_relation } = field
                    const params = {
                        id,
                        api_instance_id,
                        kv_relation,
                        api_info: {
                            api_instance_info: api_info,
                            remote_api_info: api_info.remote_api_info
                        }
                    }
                    const resp = await this.$store.dispatch('setting/getSourceData', params)
                    field.choice = resp.data.map((item) => {
                        const { key, name } = item
                        return { key, name }
                    })
                } catch (e) {
                    console.error(e)
                }
            },
            textTrans (val) {
                return val.replaceAll('\n', '</br>') || '--'
            },
            async setWorksheetData (field) {
                try {
                    const { field: fieldId, conditions, tableName } = field.meta.data_config
                    if (!tableName) {
                        return
                    }
                    // 如果字段配置了表单数据源，并且筛选条件使用了变量，则去掉该条件
                    const expressions = conditions.expressions.slice()
                    conditions.expressions = expressions.filter(item => item.type === 'const')
                    const params = {
                        field: fieldId,
                        group: fieldId,
                        conditions
                    }
                    const resp = await this.$http.post(`/nocode/filterTableData/conditions/tableName/${tableName}`, params)
                    field.choice = resp.data.map((item) => {
                        const val = item[fieldId]
                        return { key: val, name: val }
                    })
                } catch (e) {
                    console.error(e)
                }
            },
            handleClose () {
                this.$emit('update:id', '')
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .table-cell-detail-sidelider {
        .custom-detail-form {
            padding: 40px;
            .bk-label-text {
                font-size: 12px;
                line-height: 20px;
                color: #63656e;
            }
            .bk-form-content {
                font-size: 12px;
                color: #313238;
            }
        }
    }
</style>
