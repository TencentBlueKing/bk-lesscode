<template>
    <bk-dialog
        class="select-form-dialog"
        width="704"
        render-directive="if"
        :value="show"
        :auto-close="false"
        :mask-close="false"
        :close-icon="false"
        :loading="pending"
        @confirm="handleConfirm"
        @cancel="close">
        <header slot="header" class="dialog-header">
            <h4>{{$t('请选择已有表单')}}</h4>
            <span>（{{ type === 'COPY_FORM' ? $t('引用') : $t('复用') }}{{$t('已有表单')}}）</span>
        </header>
        <div class="dialog-content" v-bkloading="{ isLoading: listLoading }">
            <div class="search-area">
                <bk-input
                    v-model="searchStr"
                    class="search-input"
                    right-icon="icon-search"
                    :clearable="true"
                    :placeholder="$t('请输入表单名称')"
                    @clear="handleSearch"
                    @enter="handleSearch"
                    @input="handleSearchInput">
                </bk-input>
            </div>
            <div style="margin-bottom: 16px; padding: 0 24px;">
                <bk-alert type="warning" :closable="true" :title="tips"></bk-alert>
            </div>
            <div class="form-list-wrapper">
                <div
                    v-for="item in listData"
                    v-bk-tooltips="{
                        disabled: !item.disabled,
                        placement: 'top',
                        content: $t('当前流程节点中已绑定表单不可复用')
                    }"
                    :key="item.id"
                    :class="['form-card-item', { 'selected': selected === item.id, disabled: item.disabled }]"
                    @click="handleSelect(item)">
                    <div class="selected-label"></div>
                    <span class="preview-btn" @click.stop="$emit('preview', JSON.parse(item.content))">{{ $t('预览') }}</span>
                    <p class="form-name">{{ item.formName }}</p>
                </div>
                <bk-exception
                    v-if="listData.length === 0"
                    type="empty"
                    scene="part"
                    style="margin: 40px 0 80px;">
                    {{ searchStr ? '暂无搜索结果' : '暂无数据' }}
                </bk-exception>
            </div>
        </div>
    </bk-dialog>
</template>
<script>
    import { mapState, mapGetters } from 'vuex'
    import cloneDeep from 'lodash.clonedeep'
    import pinyin from 'pinyin'
    import { uuid } from '@/common/util'
    import { generateFieldKey } from '@/components/render-nocode/common/form'

    // 流程表单不支持的字段类型
    const FIELDS_NO_AVAILABLE_IN_PROCESS = ['DESC', 'DIVIDER', 'FORMULA', 'SERIAL', 'RATE']

    export default {
        name: 'SelectFormDialog',
        props: {
            show: Boolean,
            type: String,
            workflowId: Number
        },
        data () {
            return {
                formList: [],
                listData: [],
                listLoading: true,
                selected: '',
                searchStr: '',
                pending: false
            }
        },
        computed: {
            ...mapState('nocode/nodeConfig', ['nodeData']),
            ...mapState('nocode/flow', ['flowConfig']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            tips () {
                return this.type === 'COPY_FORM'
                    ? this.$t('引用已有表单：引用已有表单快速建表，运行时节点数据不会存入被引用的表中，字段属性可自定义')
                    : this.$t('复用已有表单：运行时节点数据会存入被复用的表中，不支持增加和修改字段属性')
            },
            projectId () {
                return this.$route.params.projectId
            },
        },
        watch: {
            show (val) {
                if (val) {
                    this.getFormList()
                }
            }
        },
        methods: {
            async getFormList () {
                this.listLoading = true
                const params = {
                    projectId: this.projectId,
                    versionId: this.versionId
                }
                const res = await this.$store.dispatch('nocode/form/getFormList', params)
                // 复用表单时，本流程已经绑定的表单不可以复用
                if (this.type === 'USE_FORM') {
                    const formIds = Object.values(JSON.parse(this.flowConfig.formIds || '{}'))
                    res.forEach(item => {
                        if(formIds.includes(item.id)) {
                            item.disabled = true
                        }
                    })
                }
                this.formList = res
                this.listData = [...res]
                this.listLoading = false
            },
            handleSelect (form) {
                if (form.disabled) {
                    return
                }
                this.selected = form.id
            },
            handleSearchInput () {
                if (!this.searchStr) {
                    this.handleSearch()
                }
            },
            handleSearch () {
                if (this.searchStr) {
                    this.listData = this.formList.filter(item => item.formName.toLowerCase().includes(this.searchStr.toLowerCase()))
                } else {
                    this.listData = this.formList.slice(0)
                }
            },
            // 引用表单替换字段Key以及columnId
            getCopiedFields (content) {
                const fields = JSON.parse(content)
                const keysMap = {}
                fields.forEach(field => {
                    const columnId = uuid(8)
                    const newKey = generateFieldKey(field.name, columnId)
                    keysMap[field.key] = newKey
                    field.key = newKey
                    field.columnId = columnId
                })
                let fieldsStr = JSON.stringify(fields)
                Object.keys(keysMap).forEach(key => {
                    const reg = new RegExp(`"${key}"`, 'g')
                    fieldsStr = fieldsStr.replace(reg, `"${keysMap[key]}"`)
                })
                return JSON.parse(fieldsStr)
            },
            // 表单字段保存到itsm
            saveItsmFields (fields) {
                const transformedFields = fields.map(item => {
                    const field = cloneDeep(item)
                    field.id = null // itsm新建的字段需要传null
                    if (field.source_type === 'WORKSHEET') {
                        field.source_type = 'CUSTOM_API'
                        field.meta.data_config.source_type = 'WORKSHEET'
                    }
                    field.workflow = this.workflowId
                    field.state = this.nodeData.id
                    field.meta.columnId = field.columnId // 表单字段需要保存columnId，itsm不支持直接添加，存到meta里
                    delete field.api_instance_id
                    delete field.columnId
                    return field
                })
                const params = {
                    fields: transformedFields,
                    state_id: this.nodeData.id,
                    delete_ids: []
                }
                return this.$store.dispatch('nocode/flow/batchSaveFields', params)
            },
            // 表单配置保存到form表
            saveFormConfig (formConfig) {
                const params = {
                    pageId: this.flowConfig.pageId,
                    id: this.flowConfig.id,
                    nodeId: this.nodeData.id,
                    projectId: this.projectId,
                    versionId: this.versionId,
                    formData: formConfig
                }
                return this.$store.dispatch('nocode/flow/editFlowNode', params)
            },
            // 更新itsm节点数据
            updateItsmNode (formId, fields) {
                // itsm新建服务时,提单节点默认生成一个标题字段，需要保留，默认放到第一个
                if (this.nodeData.is_first_state) {
                    fields.unshift(this.nodeData.fields[0])
                }
                const params = {
                    id: this.nodeData.id,
                    data: {
                        is_draft: false, // 提单节点置为已配置状态，传到itsm做标记
                        extras: {
                            formConfig: {
                                id: formId,
                                type: this.type
                            }
                        },
                        fields
                    }
                }

                return this.$store.dispatch('nocode/flow/patchNodeData', params)
            },
            // 保存表单配置
            async saveData (form) {
                this.pending = true
                try {
                    const { id, formName, tableName: code, content } = form
                    const fieldsToBeSubmitted = this.type === 'COPY_FORM' ? this.getCopiedFields(content) : JSON.parse(content)
                    const itsmFields = await this.saveItsmFields(fieldsToBeSubmitted)
                    const fields = []
                    itsmFields.forEach(field => {
                        if (this.nodeData.is_first_state && field.id === this.nodeData.fields[0]) {
                            return
                        }
                        field.columnId = field.meta.columnId
                        field.disabled = true
                        delete field.meta.columnId
                        if (field.meta.data_config?.source_type === 'WORKSHEET') {
                            field.source_type = 'WORKSHEET'
                        }
                        fields.push(field)
                    })
                    let formConfig = {}
                    if (this.type === 'USE_FORM') {
                        formConfig = { id, formName, code, content: fields, type: 'USE_FORM' }
                    } else {
                        const cnName = pinyin(this.nodeData.name, {
                            style: pinyin.STYLE_NORMAL,
                            heteronym: false
                        }).join('_')

                        const formName = `${this.nodeData.name}_表单`
                        const code = `${cnName}_${this.nodeData.id}_${uuid(4)}`
                        formConfig = { id: '', formName, code, content: fields, type: 'COPY_FORM' }
                    }

                    const res = await this.saveFormConfig(formConfig)
                    this.$store.commit('nocode/nodeConfig/setFormConfig', { ...formConfig, id: res.formId })
                    this.$store.commit('nocode/flow/setFlowNodeFormId', { nodeId: this.nodeData.id, formId: res.formId })
                    this.$store.commit('nocode/nodeConfig/setInitialFieldIds', fields)
                    const fieldIds = fields.map(field => field.id)
                    const nodeConfig = await this.updateItsmNode(res.formId, fieldIds)
                    this.$store.commit('nocode/nodeConfig/setNodeData', nodeConfig)
                    await this.$store.dispatch('nocode/flow/editFlow', { id: this.flowConfig.id, deployed: 0 })
                    this.$store.commit('nocode/flow/setFlowConfig', { deployed: 0 })

                    this.$bkMessage({
                        message: '表单配置关联数据表成功',
                        theme: 'success'
                    })
                    this.close()
                    this.$emit('confirm')
                } catch (e) {
                    console.error(e)
                } finally {
                    this.pending = false
                }
            },
            handleConfirm () {
                const form = this.formList.find(item => item.id === this.selected)
                if (typeof this.selected !== 'number') {
                    this.$bkMessage({
                        message: this.$t('请选择表单'),
                        theme: 'error'
                    })
                    return
                }
                const hasNotAvailable = JSON.parse(form.content).some(item => {
                    return FIELDS_NO_AVAILABLE_IN_PROCESS.includes(item.type)
                })
                if (hasNotAvailable) {
                    this.$bkMessage({
                        theme: 'error',
                        message: '已选表单包含流程不支持的字段控件类型'
                    })
                    return false
                }

                this.saveData(form)
            },
            close () {
                this.selected = ''
                this.$emit('update:show', false)
            }
        }
    }
</script>
<style lang="postcss">
    @import "@/css/mixins/scroller";

    .select-form-dialog {
        .bk-dialog-tool {
            display: none;
        }
        .dialog-header {
            display: flex;
            align-items: center;
            padding-top: 15px;
            h4 {
                margin: 0;
                font-size: 20px;
                line-height: 28px;
                font-weight: normal;
                color: #313238;
            }
            span {
                font-size: 12px;
                color: #63656e;
            }
        }
        .bk-dialog-body {
            padding-left: 0;
            padding-right: 0;
        }
        .search-area {
            padding: 0 24px 10px;
            text-align: right;
            .search-input {
                width: 240px;
            }
        }
        .form-list-wrapper {
            padding: 0 24px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            min-height: 160px;
            max-height: 320px;
            overflow: auto;
            @mixin scroller;
        }
        .form-card-item {
            position: relative;
            margin-bottom: 16px;
            padding: 0 50px 0 16px;
            width: 320px;
            height: 50px;
            line-height: 50px;
            font-size: 12px;
            color: #63656e;
            border: 1px solid #dcdee5;
            border-radius: 2px;
            cursor: pointer;
            &:hover {
                border-color: #3a84ff;
                .preview-btn {
                    display: block;
                }
            }
            &.selected {
                border-color: #3a84ff;
                .selected-label {
                    display: block;
                }
            }
            &.disabled {
                cursor: not-allowed;
                color: #cccccc;
                background-color: #fafbfd;
                border-color: #dcdee5;
            }
            .selected-label {
                display: none;
                position: absolute;
                top: 0;
                right: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 36px 36px 0;
                border-color: transparent #3a84ff transparent transparent;
                &:before {
                    content: '';
                    position: absolute;
                    top: 10px;
                    right: -34px;
                    width: 11px;
                    height: 1px;
                    background: #ffffff;
                    transform: rotate(-45deg);
                    border-bottom-left-radius: 1px;
                }
                &:after {
                    content: '';
                    position: absolute;
                    top: 12px;
                    right: -26px;
                    width: 5px;
                    height: 1px;
                    background: #ffffff;
                    transform: rotate(45deg);
                    border-bottom-right-radius: 1px;
                }
            }
            .preview-btn {
                display: none;
                position: absolute;
                right: 20px;
                top: 18px;
                font-size: 12px;
                line-height: 1;
                color: #3a84ff;
                cursor: pointer;
            }
            .form-name {
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }
    }
</style>
