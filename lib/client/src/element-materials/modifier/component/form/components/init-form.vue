<template>
    <section>
        <div class="form-title">
            {{ $t('初始化表单数据（更新将会覆盖已有数据）') }} </div>
        <bk-radio-group
            class="g-prop-radio-group"
            v-model="initData.initType"
        >
            <bk-radio-button value="remote">
                {{ $t('函数') }} </bk-radio-button>
            <bk-radio-button value="table-data-source">
                {{ $t('数据表') }} </bk-radio-button>
        </bk-radio-group>
        <remote
            v-if="initData.initType === 'remote'"
            name="initFormData"
            :auto-get-data="false"
            :show-data-buttun="false"
            :default-value="{}"
            :payload="initData.remoteData || {}"
            :remote-validate="validateObjectMethod"
            :change="transformRemoteDataToNode"
            :describe="formConfig" />
        <section v-if="initData.initType === 'table-data-source'">
            <bk-select
                searchable
                :placeholder="$t('请选择数据表')"
                :clearable="false"
                :loading="tableInfo.isLoadingList"
                :value="initData.tableData.tableName"
            >
                <bk-option
                    v-for="table in tableInfo.tableList"
                    :key="table.tableName"
                    :id="table.tableName"
                    :name="table.tableName"
                    @click.native="chooseTable(table.tableName)">
                </bk-option>
            </bk-select>
            <bk-select
                style="margin: 10px 0"
                :placeholder="$t('请选择数据表字段')"
                v-model="initTableData.selectCols"
                :clearable="false"
                :searchable="false"
                :multiple="true"
            >
                <bk-option
                    v-for="field in tableInfo.colList"
                    :key="field.name"
                    :id="field.name"
                    :name="field.name">
                </bk-option>
            </bk-select>
            <bk-button
                theme="primary"
                size="small"
                @click="initFromTableCol"
            >{{ $t('获取数据') }}</bk-button>
        </section>
    </section>
</template>

<script>
    import remote from '@/element-materials/modifier/component/props/components/strategy/remote'

    const getFormTypeFromTableColType = (type) => {
        if (type === 'date') {
            return 'date-picker'
        } else if (type === 'datetime') {
            return 'time-picker'
        } else {
            return 'input'
        }
    }

    const getFormTypeFromValue = (val) => {
        if (typeof val === 'boolean') {
            return 'switcher'
        } else if (Array.isArray(val)) {
            return 'checkbox-group'
        }
        return 'input'
    }

    export default {
        components: {
            remote
        },
        props: {
            componentNode: {
                type: Object,
                default: () => ({})
            },
            handleSubmitFormItem: {
                type: Function,
                required: true
            }
        },
        data () {
            return {
                // 数据示例基于配置的value来展示值，这里需要传入一份配置的标准值
                formConfig: {
                    val: {
                        'string': '',
                        'boolean': false,
                        'array': [
                            1,
                            2,
                            3
                        ]
                    }
                },
                initData: {},
                tableInfo: {
                    isLoadingList: false,
                    tableList: [],
                    colList: []
                },
                defaultInitData: {
                    initType: 'remote',
                    remoteData: {
                        methodCode: '',
                        params: []
                    },
                    tableData: {
                        tableName: '',
                        selectCols: []
                    }
                }
            }
        },
        computed: {
            projectId () {
                return this.$route.params.projectId
            },
            initTableData () {
                return this.initData.tableData || {}
            }
        },
        created () {
            this.getTableInfo()
            // 解析model属性中的initData数据
            const modelProps = this.componentNode.renderProps?.model || {}
            const modelPayload = modelProps.payload || {}
            this.initData = Object.assign({}, this.defaultInitData, modelPayload)
            delete this.initData.customVariableCode
        },
        beforeDestroy () {
            // 将initData数据存放到model属性里
            this.saveInitData()
        },
        methods: {
            async getTableInfo () {
                this.tableInfo.isLoadingList = true
                try {
                    const res = await this.$store.dispatch('dataSource/list', { projectId: this.projectId, dataSourceType: 'preview' })
                    this.tableInfo.tableList = res.list || []
                    if (this.initData.tableData?.tableName) {
                        this.getColList(this.initData.tableData?.tableName)
                    }
                } catch (err) {
                    this.$bkMessage({
                        message: err.message || err,
                        theme: 'error'
                    })
                } finally {
                    this.tableInfo.isLoadingList = false
                }
            },
            getColList (tableName) {
                const table = this.tableInfo.tableList.find(item => item.tableName === tableName)
                this.tableInfo.colList = (table?.columns || []).filter(item => ['id', 'createUser', 'createTime', 'updateUser', 'updateTime'].indexOf(item.name) === -1)
            },
            saveInitData () {
                const modelProps = this.componentNode.renderProps?.model || {}
                const modelPayload = modelProps.payload || {}
                this.componentNode.setProp({
                    'model': {
                        ...modelProps,
                        payload: Object.assign({}, modelPayload, this.initData)
                    }
                })
            },
            /**
             * @desc 验证远程数据
             * @param { Object } res
             * @returns { String }
             */
            validateObjectMethod (res) {
                let msg = ''
                if (Object.prototype.toString.call(res) !== '[object Object]') {
                    msg = this.$t('请确保函数返回值为object类型')
                }
                return msg
            },
            /**
             * @desc 通过远程数据生成 form-item 节点
             * @param { String } name
             * @param { Array } data
             */
            transformRemoteDataToNode (name, data, type, remoteData) {
                Object.assign(this.initData, { remoteData })
                const arr = Object.keys(data)
                if (arr.length === 0) return
                this.componentNode.children.forEach((node) => {
                    this.componentNode.removeChild(node)
                })
                arr.forEach((key) => {
                    this.handleSubmitFormItem({
                        type: getFormTypeFromValue(data[key]),
                        label: key,
                        property: key,
                        required: false,
                        validate: []
                    })
                })
                this.saveInitData()
            },
            // 选择数据表
            chooseTable (tableName) {
                Object.assign(this.initData, {
                    tableData: {
                        tableName,
                        selectCols: []
                    }
                })
                this.getColList(tableName)
            },
            // 根据选择的table表字段生成form-item
            initFromTableCol () {
                const { selectCols } = this.initTableData
                const { colList } = this.tableInfo
                const cols = colList.filter(item => selectCols.indexOf(item.name) !== -1)
                if (selectCols.length === 0 || cols.length === 0) {
                    this.$bkMessage({
                        message: this.$t('请先选择数据表字段'),
                        theme: 'error'
                    })
                    return
                }
                this.componentNode.children.forEach((node) => {
                    this.componentNode.removeChild(node)
                })
                cols.forEach((item) => {
                    this.handleSubmitFormItem({
                        type: getFormTypeFromTableColType(item.type),
                        label: item.name,
                        property: item.name,
                        required: false,
                        validate: []
                    }, this.initData)
                })
                this.saveInitData()
            }
        }
    }
</script>
