<template>
    <div class="field-edit">
        <div v-if="fieldData.type === 'SERIAL'" class="serial-tips">{{ $t('自动编号控件在表单填写时不可见，表单值由配置规则确定') }}</div>
        <!-- 表单右边设置区域  -->
        <bk-form form-type="vertical">
            <div v-if="fieldData.type === 'DESC'" class="field-container">
                <bk-form-item :label="$t('内容')" ext-cls="richtext-container">
                    <rich-text @change="handleDescValueChange" is-full-screen :value="fieldData.value"></rich-text>
                </bk-form-item>
            </div>
            <div v-else-if="fieldData.type === 'DIVIDER'" class="field-container">
                <bk-form-item :label="$t('form_展示文字')">
                    <bk-input v-model.trim="fieldData.default" :disabled="disabled" @change="change"></bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('form_文字位置')">
                    <bk-select
                        v-model="fieldData.deviderAttr.align"
                        :disabled="disabled"
                        @selected="change">
                        <bk-option v-for="option in alignList" :key="option.id" :id="option.id" :name="option.name"></bk-option>
                    </bk-select>
                </bk-form-item>
                <bk-form-item :label="$t('form_线条颜色')">
                    <bk-color-picker v-model="fieldData.deviderAttr.color" size="small" ::disabled="disabled" @change="change" transfer>
                    </bk-color-picker>
                </bk-form-item>
            </div>
            <div class="field-container" v-else>
                <div class="group-name" @click="basicIsFolded = !basicIsFolded">
                    <i
                        class="bk-drag-icon bk-drag-arrow-down toggle-arrow"
                        :class="{
                            floded: basicIsFolded
                        }"
                    />
                    <span>{{ $t('基础属性') }}</span>
                </div>
                <bk-form-item :label="$t('form_字段名称')" v-if="!basicIsFolded">
                    <bk-input v-model.trim="fieldData.name" :disabled="disabled" @change="change" @blur="onNameBlur"></bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('form_唯一标识')" v-if="!basicIsFolded"
                    desc-type="icon"
                    :desc="uniqe"
                    desc-icon="bk-icon icon-question-circle">
                    <bk-input v-model.trim="fieldData.key" :disabled="disabled || fieldData.disabled" @change="change" @blur="onNameBlur"></bk-input>
                </bk-form-item>
                <bk-form-item :label="$t('布局')" v-if="!basicIsFolded && fieldData.type !== 'SERIAL'">
                    <bk-radio-group v-model="fieldData.layout" @change="change">
                        <bk-radio value="COL_6" :disabled="disabled || fieldProps.fieldsFullLayout.includes(fieldData.type)">{{ $t('半行') }}</bk-radio>
                        <bk-radio value="COL_12" :disabled="disabled || fieldProps.fieldsFullLayout.includes(fieldData.type)">{{ $t('整行') }}</bk-radio>
                    </bk-radio-group>
                </bk-form-item>
                <bk-form-item :label="$t('form_上传模板附件')" v-if="fieldData.type === 'FILE' && !handleIsFolded" :ext-cls="'input-position '">
                    <bk-button :theme="'default'" :title="$t('点击上传')" :disabled="disabled">
                        {{ $t('点击上传') }} </bk-button>
                    <input type="file" :value="fileVal" class="input-file" :disabled="disabled" @change="handleAddFiles">
                    <ul class="file-list">
                        <li v-for="(item, index) in fieldData.fileTemplate" :key="index">
                            <span class="file-success">
                                <i class="bk-icon icon-check-1"></i>
                            </span>
                            <span>{{ item.name }}</span>
                            <span class="file-delete" @click="handleDelete(item, index)">×</span>
                        </li>
                    </ul>
                </bk-form-item>
                <bk-form-item :label="$t('数据源')" v-if="fieldProps.fieldsDataSource.includes(fieldData.type)">
                    <!-- <bk-select
                        :value="fieldData.source_type"
                        :clearable="false"
                        :disabled="disabled"
                        @selected="handleSourceTypeChange">
                        <bk-option v-for="item in sourceTypeList" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                    </bk-select> -->
                    <bk-radio-group class="g-prop-radio-group" :value="fieldData.source_type" @change="handleSourceTypeChange">
                        <bk-radio-button
                            v-for="item in sourceTypeList"
                            :disabled="isFromFlow && item.id === 'FUNCTION'"
                            :key="item.id"
                            :value="item.id">
                            {{ item.name }}
                        </bk-radio-button>
                    </bk-radio-group>
                    <function-data
                        v-if="fieldData.source_type === 'FUNCTION'"
                        :key="fieldData.key"
                        :config="fieldData.meta.function_data_source_config"
                        @change="handleFunctionDataSourceChange">
                    </function-data>
                     <bk-button
                        v-else
                        style="margin-top: 8px;"
                        theme="primary"
                        size="small"
                        :title="$t('配置')"
                        @click="dataSourceDialogShow = true">
                        {{ $t('配置数据源') }}
                    </bk-button>
                    <!-- <bk-select
                        class="mt8"
                        v-if="fieldData.source_type === 'API'"
                        v-model="fieldData.api_info.remote_system_id"
                        :placeholder="$t('请选择API')"
                        :clearable="false"
                        :disabled="disabled || systemListLoading"
                        :loading="systemListLoading"
                        @selected="handleSelectSystem">
                        <bk-option v-for="item in systemList" :key="item.id" :id="item.id" :name="item.name"></bk-option>
                    </bk-select> -->
                </bk-form-item>
                <bk-divider />
                <div class="group-name" @click="handleIsFolded = !handleIsFolded">
                    <i
                        class="bk-drag-icon bk-drag-arrow-down toggle-arrow"
                        :class="{
                            floded: handleIsFolded
                        }"
                    />
                    <span>{{ $t('填写属性') }}</span>
                </div>
                <bk-form-item :label="$t('form_表头配置')" v-if="fieldData.type === 'TABLE' && !handleIsFolded">
                    <table-header-setting
                        :list="fieldData.choice"
                        @move="handleChangeTableHeader"
                        @remove="handleRemoveChocie"
                        @update="handleUpdateChocie">
                    </table-header-setting>
                    <span class="add-chocie" @click="handleAddTableChoice">{{ $t('添加') }}</span>
                </bk-form-item>
                <bk-form-item v-if="!handleIsFolded && fieldData.type !== 'SERIAL'">
                    <div class="attr-value">
                        <div class="contidion">
                            <bk-checkbox
                                :true-value="true"
                                :false-value="false"
                                :disabled="disabled"
                                v-model="fieldData.is_readonly"
                                @change="change">
                                {{ $t('只读') }} </bk-checkbox>
                            <span v-show="fieldData.is_readonly === true" @click="readerOnlyShow = true">{{ $t('条件编辑') }}</span>
                        </div>
                        <div class="contidion">
                            <div id="require-tips" class="demo-html1">
                                <p>{{ $t('选择为必填时，请确保字段配置满足以下两种情形之一，否则表单可能无法提交：') }}</p>
                                <p>1、{{ $t('字段已设置默认值') }}</p>
                                <p>2、{{ $t('字段可编辑且非隐藏') }}</p>
                            </div>
                            <bk-checkbox
                                :true-value="'REQUIRE'"
                                :false-value="'OPTION'"
                                :disabled="disabled"
                                v-model="fieldData.validate_type"
                                @change="handleChangeValidataType">
                                {{ $t('必填') }} <span v-bk-tooltips="htmlConfig"
                                    style="color:#313238 ">
                                    <i class="bk-icon icon-question-circle"></i>
                                </span>
                            </bk-checkbox>
                            <span v-show="fieldData.validate_type === 'REQUIRE'" @click="requireConfigShow = true">{{ $t('条件编辑') }}</span>
                        </div>
                        <div class="contidion">
                            <bk-checkbox
                                :true-value="0"
                                :false-value="1"
                                :disabled="disabled"
                                :value="fieldData.show_type"
                                @change="handleShowTypeChange">
                                {{ $t('隐藏') }} </bk-checkbox>
                            <span v-show="fieldData.show_type === 0" @click="showTypeShow = true">{{ $t('条件编辑') }}</span>
                        </div>
                    </div>
                </bk-form-item>
                <bk-form-item :label="$t('form_控制上传范围')" v-if="fieldData.type === 'IMAGE' && !handleIsFolded">
                    <div>
                        <div class="range-control">
                            <bk-checkbox
                                :disabled="disabled || fieldData.validate_type === 'REQUIRE'"
                                :true-value="true"
                                :false-value="false"
                                v-model="fieldData.imageRange.isMin"
                                @change="change">
                                {{ $t('至少上传') }} </bk-checkbox>
                            <bk-input
                                class="up-load-input"
                                type="number"
                                :max="99"
                                :min="1"
                                :disabled="disabled"
                                v-model="fieldData.imageRange.minNum"
                                @change="change">
                            </bk-input>
                            {{ $t('张图') }} </div>
                        <div class="range-control">
                            <bk-checkbox
                                :true-value="true"
                                :false-value="false"
                                :disabled="disabled"
                                v-model="fieldData.imageRange.isMax"
                                @change="change">
                                {{ $t('最多上传') }} </bk-checkbox>
                            <bk-input
                                class="up-load-input"
                                type="number"
                                style="width: 80px"
                                :max="99"
                                :min="1"
                                :disabled="disabled"
                                v-model="fieldData.imageRange.maxNum"
                                @change="change">
                            </bk-input>
                            {{ $t('张图') }} </div>
                    </div>
                </bk-form-item>
                <!-- <bk-form-item :label="$t('form_控制选择范围')" v-if="['MULTISELECT','CHECKBOX'].includes(fieldData.type) && !handleIsFolded">
                    <div>
                        <div class="range-control">
                            <bk-checkbox
                                :disabled="disabled || fieldData.validate_type === 'REQUIRE'"
                                :true-value="true"
                                :false-value="false"
                                v-model="fieldData.imageRange.isMin"
                                @change="handleSelectMinChoice">
                                {{ $t('至少选择') }} </bk-checkbox>
                            <bk-input
                                class="up-load-input"
                                type="number"
                                :max="99"
                                :min="1"
                                :disabled="disabled"
                                v-model="fieldData.imageRange.minNum"
                                @change="change">
                            </bk-input>
                            {{ $t('个选项') }} </div>
                        <div class="range-control">
                            <bk-checkbox
                                :true-value="true"
                                :false-value="false"
                                :disabled="disabled"
                                v-model="fieldData.imageRange.isMax"
                                @change="change">
                                {{ $t('最多选择') }} </bk-checkbox>
                            <bk-input
                                class="up-load-input"
                                type="number"
                                style="width: 80px"
                                :max="99"
                                :min="1"
                                :disabled="disabled"
                                v-model="fieldData.imageRange.maxNum"
                                @change="change">
                            </bk-input>
                            {{ $t('个选项') }} </div>
                    </div>
                </bk-form-item> -->
                <bk-form-item :label="$t('form_校验方式')" v-if="!handleIsFolded && fieldData.type !== 'SERIAL'">
                    <bk-select
                        v-model="fieldData.regex"
                        :clearable="false"
                        :searchable="true"
                        :disabled="
                            disabled ||
                                fieldData.source === 'TABLE' ||
                                (fieldData.meta && fieldData.meta.code === 'APPROVE_RESULT')
                        "
                        @selected="change">
                        <bk-option v-for="option in regexList" :key="option.id" :id="option.id" :name="option.name"></bk-option>
                    </bk-select>
                </bk-form-item>
                <template v-if="fieldProps.fieldsShowDefaultValue.includes(fieldData.type) && fieldData.source_type === 'CUSTOM' && !handleIsFolded">
                    <bk-form-item ext-cls="default-val" :label="$t('默认值')">
                        <default-value
                            :field="fieldData"
                            :disabled="disabled"
                            @change="handleDefaultValChange">
                        </default-value>
                    </bk-form-item>
                    <bk-form-item :label="$t('form_值联动规则')">
                        <association-value
                            :field="fieldData"
                            :disabled="disabled"
                            @change="updateFieldData">
                        </association-value>
                    </bk-form-item>
                </template>
                <!-- 计算组件 -->
                <bk-form-item :label="$t('form_计算类型')" v-if="fieldData.type === 'COMPUTE' && !handleIsFolded">
                    <ComputeEdit
                        :field="fieldData"
                        :disabled="disabled"
                        @change="updateFieldData" />
                </bk-form-item>
                <!-- 自动编号 -->
                <bk-form-item v-if="fieldData.type === 'SERIAL' && !handleIsFolded">
                    <SerialEdit
                        :field="fieldData"
                        :disabled="disabled"
                        @change="updateFieldData" />
                </bk-form-item>
                <bk-form-item :label="$t('form_填写说明')" v-if="!handleIsFolded && fieldData.type !== 'SERIAL'">
                    <bk-input v-model.trim="fieldData.desc" type="textarea" :disabled="disabled" :rows="4" @change="change"></bk-input>
                    <div>
                        <div class="form-tip">
                            <span><bk-checkbox v-model="checkTips" :disabled="disabled" @change="handleShowTipsChange">{{ $t('添加额外填写说明') }}</bk-checkbox></span>
                            <span class="tips" v-show="checkTips" v-bk-tooltips.top="{ 'content': fieldData.tips, maxWidth: 400, allowHTML: false, 'extCls': 'custom-require-tips' }">{{ $t('效果预览') }}</span>
                        </div>
                        <bk-input
                            v-if="checkTips"
                            class="check-tips-input"
                            v-model.trim="fieldData.tips"
                            type="textarea"
                            :rows="4"
                            :disabled="disabled"
                            @change="change">
                        </bk-input>
                    </div>
                </bk-form-item>
            </div>
        </bk-form>
        <read-only-dialog
            :field-list="list"
            :title="fieldData.name"
            :show.sync="readerOnlyShow"
            :value="fieldData.read_only_conditions"
            :disabled="disabled"
            @confirm="(val) => onConfirm('read_only_conditions',val)">
        </read-only-dialog>
        <require-dialog
            :field-list="list"
            :title="fieldData.name"
            :show.sync="requireConfigShow"
            :value="fieldData.mandatory_conditions"
            :disabled="disabled"
            @confirm="(val) => onConfirm('mandatory_conditions',val)">
        </require-dialog>
        <show-type-dialog
            :field-list="list"
            :title="fieldData.name"
            :show.sync="showTypeShow"
            :value="fieldData.show_conditions"
            :disabled="disabled"
            @confirm="(val) => onConfirm('show_conditions',val)">
        </show-type-dialog>
        <data-source-dialog
            :show.sync="dataSourceDialogShow"
            :app-id="'1'"
            :source-type="fieldData.source_type"
            :field-type="fieldData.type"
            :value="sourceData"
            :disabled="disabled"
            :is-display-tag="fieldData.isDisplayTag"
            @confirm="handleDataSourceChange">
        </data-source-dialog>
        <config-desc-comp-value-dialog
            :show.sync="descCompValueShow"
            :value="fieldData.value"
            :disabled="disabled"
            @confirm="handleDescValueChange">
        </config-desc-comp-value-dialog>
    </div>
</template>
<script>
    import cloneDeep from 'lodash.clonedeep'
    import DefaultValue from './default-value.vue'
    import AssociationValue from './association-value/index.vue'
    import ReadOnlyDialog from './readOnlyDialog.vue'
    import RequireDialog from './requireDialog.vue'
    import ShowTypeDialog from './showTypeDialog.vue'
    import DataSourceDialog from './dataSourceDialog.vue'
    import FunctionData from './data-source/function-data.vue'
    import ConfigDescCompValueDialog from './configDescCompValueDialog'
    import TableHeaderSetting from './tableHeaderSetting.vue'
    import RichText from '@/components/flow-form-comp/form/fields/richText.vue'
    import ComputeEdit from './components/computeEdit/index.vue'
    import SerialEdit from './components/serialEdit.vue'
    import {
        FIELDS_FULL_LAYOUT,
        FIELDS_SHOW_DEFAULT_VALUE,
        FIELDS_SOURCE_TYPE
    } from '../../../common/form'
    import { DATA_SOURCE_FIELD } from '@/components/flow-form-comp/form/constants/forms'
    import { REGX_CHIOCE_LIST } from '../../../../../../../shared/no-code/constant'
    import { mapGetters } from 'vuex'
        
    export default {
        name: 'formEdit',
        components: {
            AssociationValue,
            DefaultValue,
            TableHeaderSetting,
            ReadOnlyDialog,
            RequireDialog,
            ShowTypeDialog,
            DataSourceDialog,
            FunctionData,
            ConfigDescCompValueDialog,
            RichText,
            ComputeEdit,
            SerialEdit
        },
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            isFromFlow: Boolean,
            value: {
                type: Object,
                default: () => ({})
            },
            list: {
                type: Array,
                default: () => []
            },
            disabled: Boolean
        },
        data () {
            return {
                fieldData: cloneDeep(this.value),
                checkTips: '',
                regexList: this.getRegexList(this.value),
                basicIsFolded: false,
                handleIsFolded: false,
                fieldProps: {
                    fieldsFullLayout: FIELDS_FULL_LAYOUT,
                    fieldsShowDefaultValue: FIELDS_SHOW_DEFAULT_VALUE,
                    fieldsDataSource: DATA_SOURCE_FIELD
                },
                alignList: [{ id: 'left', name: this.$t('居左') }, { id: 'right', name: this.$t('居右') }, { id: 'center', name: this.$t('居中') }],
                dataSourceDialogShow: false,
                readerOnlyShow: false,
                requireConfigShow: false,
                showTypeShow: false,
                descCompValueShow: false,
                fileVal: '',
                htmlConfig: {
                    allowHtml: true,
                    width: 232,
                    content: '#require-tips',
                    placement: 'top',
                    extCls: 'custom-require-tips',
                    appendTo: () => document.body
                },
                uniqe: {
                    content: this.$t('用作数据库字段名， 保存成功后不允许修改'),
                    placement: 'top',
                    extCls: 'custom-require-tips',
                    appendTo: () => document.body
                }
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            sourceTypeList () {
                if (this.fieldData.type === 'TABLE') {
                    return FIELDS_SOURCE_TYPE.filter(item => item.id === 'CUSTOM')
                }
                return FIELDS_SOURCE_TYPE
            },
            sourceData () {
                const { source_type: sourceType, choice, meta } = this.fieldData
                let data = {}
                switch (sourceType) {
                    case 'CUSTOM':
                        data = choice
                        break
                    case 'WORKSHEET':
                        data = meta.data_config
                        break
                }
                return data
            }
        },
        watch: {
            value (val, oldVal) {
                if (val.type !== oldVal.type) {
                    this.regexList = this.getRegexList(val)
                }
                if (val.key !== oldVal.key) {
                    this.basicIsFolded = false
                    this.handleIsFolded = false
                }
                this.fieldData = cloneDeep(val)
            }
        },
        methods: {
            
            getRegexList (val) {
                const result = REGX_CHIOCE_LIST().filter(item => item.type === val.type
                    || (Array.isArray(val.type) && item.type.includes(val.type)) // 主要是为了区分text 和 string 类型的正则规则  同时去除DATE DATETIME 的影响
                    || !item.type)
                return result
            },
            onNameBlur () {
                if (this.fieldData.name === '') {
                    this.fieldData.name = this.$t('字段名称')
                    this.change()
                }
            },
            handleAddFiles (e) {
                const fileInfo = e.target.files[0]
                const maxSize = 100000
                const fileSize = fileInfo.size / 1024
                const fileName = fileInfo.name
                for (let i = 0; i < this.fileList.length; i++) {
                    if (fileName === this.fieldData.fileTemplate.name) {
                        this.$bkMessage({
                            message: this.$t('此文件已经上传'),
                            theme: 'error'
                        })
                        break
                    }
                }
                if (fileSize <= maxSize) {
                    const data = new FormData()
                    data.append('field_file', fileInfo)
                    // todo ajax
                } else {
                    this.fileVal = ''
                    this.$bkMessage({
                        message: this.$t('该文件大小超过100MB'),
                        theme: 'error'
                    })
                }
                this.change()
            },
            handleDelete (item, index) {
                this.fieldData.fileTemplate.splice(index, 1)
                this.change()
            },
            // 是否显示表单tips切换
            handleShowTipsChange () {
                this.fieldData.tips = ''
                this.change()
            },
            // 数据源配置变更
            handleDataSourceChange (val) {
                const { source_type: sourceType } = this.fieldData
                this.dataSourceDialogShow = false
                if (sourceType === 'CUSTOM') {
                    this.fieldData.choice = val.localVal
                    this.fieldData.default = val.localVal.find(item => item.isDefaultVal)?.key || ''
                    this.fieldData.isDisplayTag = !!val?.localValIsDisplayTag
                } else if (sourceType === 'WORKSHEET') {
                    this.fieldData.meta.data_config = val.localVal
                }
                this.change()
            },
            // 数据源类型切换
            handleSourceTypeChange (val) {
                this.fieldData.source_type = val
                if (val === 'CUSTOM') {
                    if (!this.fieldData.choice || this.fieldData.choice.length === 0) {
                        this.fieldData.choice = [
                            { key: 'XUANXIANG1', name: this.$t('选项1'), color: '#3a84ff', isDefaultVal: true },
                            { key: 'XUANXIANG2', name: this.$t('选项2'), color: '#2dcb56', isDefaultVal: false }
                        ]
                    }
                } else if (val === 'WORKSHEET') {
                    if (!this.fieldData.meta.data_config) {
                        this.fieldData.meta.data_config = {
                            formId: '',
                            tableName: '',
                            field: '',
                            conditions: {
                                type: 'and',
                                expressions: []
                            }
                        }
                    }
                } else if (val === 'FUNCTION') {
                    if (!this.fieldData.meta.function_data_source_config) {
                        this.fieldData.meta.function_data_source_config = {
                            payload: {
                                methodData: {
                                    methodCode: '',
                                    params: []
                                }
                            },
                            returnedValue: [],
                            keys: {}
                        }
                    }
                }
                this.change()
            },
            // 函数数据源配置变更
            handleFunctionDataSourceChange (val) {
                // 防止接口返回速度慢的情况下，切换数据源类型之后再更新数据
                if (this.fieldData.source_type === 'FUNCTION') {
                    this.fieldData.meta.function_data_source_config = val
                    this.change()
                }
            },
            // 默认值修改
            handleDefaultValChange (val) {
                this.fieldData.default = ['MULTISELECT', 'CHECKBOX', 'MEMBER', 'MEMBERS'].includes(this.fieldData.type)
                    ? val.join(',')
                    : val
                this.change()
            },
            // 隐藏条件修改
            handleShowTypeChange (val) {
                this.fieldData.show_type = val
                this.fieldData.show_conditions = val ? {} : { type: 'and', expressions: [{ key: '', condition: '', value: '' }] }
                this.change()
            },
            // 设置描述组件的值
            handleDescValueChange (val) {
                this.descCompValueShow = false
                this.fieldData.value = val
                this.change()
            },
            handleChangeValidataType (val) {
                if (val === 'REQUIRE' && this.fieldData.type === 'IMAGE') {
                    this.fieldData.imageRange.isMin = true
                }
                this.change()
            },
            handleSelectMinChoice (val) {
                if (val) {
                    this.fieldData.validate_type = 'REQUIRE'
                }
                this.change()
            },
            handleChangeTableHeader (newIndex, oldIndex) {
                this.fieldData.timeStamp = Date.parse(new Date())
                const field = this.fieldData.choice.splice(oldIndex, 1)
                this.fieldData.choice.splice(newIndex, 0, field[0])
                this.change()
            },
            handleRemoveChocie (index) {
                this.fieldData.choice.splice(index, 1)
                this.change()
            },
            handleUpdateChocie ($event, index) {
                this.fieldData.choice.splice(index, 1, $event)
                this.change()
            },
            // 增加表单选项
            handleAddTableChoice () {
                const len = this.fieldData.choice.length
                this.fieldData.choice.push({
                    choice: [],
                    display: '',
                    name: this.$t('列{0}', [len + 1]),
                    required: false
                })
                this.change()
            },
            updateFieldData (val) {
                this.fieldData = val
                this.change()
            },
            change () {
                this.fieldData.timeStamp = Date.parse(new Date())
                this.$emit('change', this.fieldData)
            },
            // 属性配置保存
            onConfirm (type, val) {
                this.fieldData[type] = val
                if (type === 'read_only_conditions') {
                    this.readerOnlyShow = false
                } else if (type === 'mandatory_conditions') {
                    this.requireConfigShow = false
                } else {
                    this.showTypeShow = false
                }
                this.change()
            }
        }
    }
</script>

<style scoped lang="postcss">
@import "@/css/mixins/scroller";
.field-edit {
  height: 100%;
  @mixin scroller;
  /deep/ .bk-form .bk-label{
    font-size: 12px;
  }
  /deep/ .bk-form-radio{
    font-size: 12px;
  }
  /deep/ .bk-form-checkbox .bk-checkbox-text{
    font-size: 12px;
  }
  .serial-tips {
    font-size: 12px;
    margin: 10px 0 5px;
  }
}
/deep/ .bk-form-control {
  & > .bk-form-radio,
  & > .bk-form-checkbox {
    margin-right: 24px;
  }
}

.richtext-container{
  overflow: hidden;
}
.form-tip {
  margin-top: 8px;
  display: flex;
  justify-content: space-between;

  .tips {
    display: block;
    color: #3a84ff;
    font-size: 12px;
    &:hover {
      cursor: pointer;
    }
  }
}

.attr-value {
  display: flex;
  flex-direction: column;

  /deep/ .bk-form-checkbox {
    margin-top: 8px;
  }

  .contidion {
    display: flex;
    justify-content: space-between;

    span {
      color: #3a84ff;
      font-size: 12px;
      &:hover {
        cursor: pointer;
      }
    }
  }
}

.source-data {
  display: flex;
  justify-content: space-between;
}

.mt12-item {
  margin-top: 12px !important;
}

.up-load-input {
  width: 80px;
  margin: 8px;
}

.input-position {
  position: relative;

  .input-file {
    position: absolute;
    top: 0;
    left: 0;
    width: 96px;
    height: 36px;
    overflow: hidden;
    opacity: 0;
    cursor: pointer;
  }

  .file-list {
    margin-top: 10px;
    line-height: 25px;
    font-size: 12px;
    color: #424950;

    li {
      &:hover {
        background-color: #dfeeff;
      }
    }

    .file-success {
      color: #30d878;
      font-size: 12px;
    }

    .file-delete {
      float: right;
      font-size: 20px;
      color: #7a7f85;
      cursor: pointer;
    }
  }
}

.add-chocie{
  color: #3a84ff;
  font-size: 12px;
  margin-top: 8px;
  &:hover{
    cursor: pointer;
  }
}

.group-name {
  height: 40px;
  font-size: 12px;
  color: #313238;
  font-weight: Bold;
  position: relative;
  display: flex;
  align-items: center;
  &:hover{
    cursor: pointer;
  }
  .toggle-arrow {
    position: absolute;
    display: block;
    line-height: 40px;
    top: 0;
    left: -5px;
    font-size: 24px;
    color: #63656E;
    transition: all .1s linear;
  //transform: rotate(-270deg);
    &.floded {
      transform: rotate(-90deg);
    }

  }
  span{
    display: block;
    margin-left:19px;
  }
}

>>> .bk-divider {
  margin: 12px 0 0 -12px !important;
  overflow: hidden;
  width: 298px !important;
}

.top-start{
  color: #313238;
}
.mt8{
  margin-top: 8px;
}
.field-container{
  padding-bottom: 64px;
}
>>> .bk-color-picker-show-value{
  width: 100% !important;
}
.icon-question-circle{
  font-size: 14px;
  color: #c4c6cc !important;
  &:hover{
    color: #979ba5 !important;
  }
}
>>> .bk-label-text .bk-icon{
  color: #c4c6cc !important;
  &:hover{
    color: #979ba5  !important;
  }
}

.range-control {
    font-size: 12px;
}

</style>
