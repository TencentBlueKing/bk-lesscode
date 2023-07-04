<template>
    <div class="form-panel" @click="showFormPanel">
        <draggable
            :filter="isDisabledClass"
            :class="['fields-container', activeCls]"
            :disabled="disabled"
            :value="fields"
            :group="{ name: 'form', pull: true, put: ['menu', 'half-row-field'] }"
            @add="add"
            @end="end">
            <template v-if="fields.length !== 0">
                <field-element
                    v-bk-clickoutside="handleClickOutSide"
                    v-for="(item, index) in fields"
                    :key="`${item.key}_${index}_${item.timeStamp}`"
                    :class="{ actived: selectedIndex === index }"
                    :field="item"
                    :curfield="curfield"
                    :disabled="disabled"
                    @action="handleFormAction($event, index)">
                </field-element>
            </template>
            <div v-else class="fields-empty">
                {{ $t('请拖入组件') }} </div>
        </draggable>
    </div>
</template>
<script>
    import { mapMutations, mapGetters } from 'vuex'
    import draggable from 'vuedraggable'
    import cloneDeep from 'lodash.clonedeep'
    import { FIELDS_TYPES } from 'shared/no-code/constant'
    import FieldElement from '../form-edit/fieldElement.vue'
    import { uuid } from '@/common/util'
    import { generateFieldKey } from '../../../common/form'
    import { getTypeDefaultVal } from 'shared/no-code'

    export default {
        components: {
            draggable,
            FieldElement
        },
        props: {
            fields: {
                type: Array,
                default: () => ([])
            },
            disabled: Boolean,
            formId: [String, Number],
            hover: {
                type: Boolean,
                default: false
            },
            curfield: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                selectedIndex: -1,
                isFormFocused: false
            }
        },
        computed: {
            ...mapGetters('drag', ['curTemplateData']),
            activeCls () {
                if (this.hover) {
                    return `hover ${this.fields.length === 0 ? 'add-first-field' : ''}`
                }
                return ''
            }

        },
        watch: {
            curfield (val) {
                if (!Object.keys(val).length) {
                    this.selectedIndex = -1
                }
            }
        },
        mounted () {
            window.addEventListener('click', this.handleFormFocus)
            window.addEventListener('keydown', this.handleKeyboardEvent)
        },
        beforeDestroy () {
            window.removeEventListener('click', this.handleFormFocus)
            window.removeEventListener('keydown', this.handleKeyboardEvent)
        },
        methods: {
            ...mapMutations('drag', ['setCurTemplateData']),
            // 拖拽添加字段
            add (e) {
                const { type } = e.item.dataset
                const columnId = uuid(8)
                const field = FIELDS_TYPES().find(item => item.type === type)
                const key = generateFieldKey(field.name, columnId)
                const config = {
                    columnId, // lesscode特定字段
                    type, // 类型
                    name: field.name, // 名称
                    desc: '', // 描述
                    regex: 'EMPTY', // 校验规则
                    layout: 'COL_12', // 布局：半行、整行
                    key,
                    unique: false, // 是否唯一
                    validate_type: 'OPTION', // 是否必填
                    source_type: 'CUSTOM', // 数据来源类型 [CUSTOM, API, DATADICT, RPC, WORKSHEET]
                    api_instance_id: null, // 源数据的kv关系配置
                    kv_relation: {}, // 源数据的kv关系配置
                    default: getTypeDefaultVal(type), // 默认值
                    choice: this.getDefaultChoice(type), // 选项
                    worksheet_id: this.formId, // 表单id
                    meta: {}, // 复杂描述信息，data_config描述数据源，default_val_config描述默认值关联规则
                    show_conditions: {}, // 显隐藏条件
                    read_only_conditions: {}, // 只读条件
                    mandatory_conditions: {}, // 必填条件
                    is_readonly: false, // 只读
                    show_type: 1, // 为0表示条件隐藏
                    fileTemplate: [], // 存储文件类型组件模板的值
                    imageRange: this.getDefaultImageRange(type),
                    isDisplayTag: false,
                    deviderAttr: { // 下划线属性
                        align: 'center',
                        color: '#787A7F'
                    }

                }
                const index = this.fields.length === 0 ? 0 : e.newIndex
                this.$emit('add', config, index)
                this.selectedIndex = index
            },
            end (e) {
                this.$emit('move', e.newIndex, e.oldIndex)
                this.selectedIndex = e.newIndex
            },
            isDisabledClass (evt, item) {
                return ['fields-empty', 'actions-area'].includes(evt.target.className)
            },
            // 选择、复制、删除操作
            handleFormAction (type, index) {
                const field = cloneDeep(this.fields[index])
                if (type === 'edit') {
                    this.$emit('select', field, index)
                    this.selectedIndex = index
                } else if (type === 'copy') {
                    const columnId = uuid(8)
                    const key = generateFieldKey(field.name, columnId)

                    field.columnId = columnId
                    field.key = key
                    field.id = null
                    this.$emit('copy', field, index)
                    this.selectedIndex = index + 1
                } else if (type === 'delete') {
                    this.$bkInfo({
                        title: this.$t('确认删除？'),
                        subTitle: this.$t('删除字段将会同时删除已存在该字段下的数据，你还要继续吗'),
                        theme: 'danger',
                        confirmFn: async () => {
                            this.$emit('delete', index)
                            if (this.selectedIndex === index) {
                                this.selectedIndex = -1
                            }
                        }
                    })
                }
            },
            getDefaultChoice (type) {
                if (['SELECT', 'INPUTSELECT', 'MULTISELECT', 'CHECKBOX', 'RADIO'].includes(type)) {
                    return [
                        { key: 'XUANXIANG1', name: this.$t('选项1'), color: '#FF8C00', isDefaultVal: true },
                        { key: 'XUANXIANG2', name: this.$t('选项2'), color: '#3A84FF', isDefaultVal: false }
                    ]
                }
                if (['TABLE'].includes(type)) {
                    return [
                        { key: 'LIE1', name: this.$t('列1'), choice: [], display: '', required: false },
                        { key: 'LIE2', name: this.$t('列2'), choice: [], display: '', required: false }
                    ]
                }
                return []
            },
            getDefaultImageRange (type) {
                return ['MULTISELECT', 'CHECKBOX', 'IMAGE'].includes(type) ? {
                    isMin: false,
                    minNum: 1,
                    isMax: false,
                    maxNum: 2
                } : ''
            },
            showFormPanel () {
                this.curTemplateData.layoutType !== 'empty' && this.setCurTemplateData({
                    ...this.curTemplateData,
                    panelActive: ''
                })
            },
            handleClickOutSide (e) {
                if (e?.target?.className === 'fields-container') {
                    this.selectedIndex = -1
                    this.$emit('clickOutSide')
                }
            },
            handleFormFocus (e) {
                this.isFormFocused = e.target.classList.contains('field-container-mask')
            },
            handleKeyboardEvent (event) {
                if (this.disabled || this.selectedIndex < 0 || !this.isFormFocused) {
                    return
                }
                const vKey = 86
                const delKey = [8, 46]
                if (event.metaKey && event.keyCode === vKey) {
                    this.handleFormAction('copy', this.selectedIndex)
                } else if (delKey.includes(event.keyCode)) {
                    this.handleFormAction('delete', this.selectedIndex)
                }
            }
        }
    }
</script>

<style lang="postcss" scoped>
@import "@/css/mixins/scroller";

.form-panel {
  height: calc(100vh - 180px);
}

.fields-container {
  @mixin scroller;
  height: 100%;
  overflow: auto;
  padding-bottom: 24px;
  background: #ffffff;
  &.hover {
    outline: 2px dashed #1768ef;
    border-radius: 4px;
  }

  &.add-first-field {
    background: rgba(23, 104, 239, 0.1);
  }
}

.field-element {
  position: relative;
  &.actived {
    border: 1px solid #3a84ff;
    background: rgba(225,236,255,0.60);;
  }
}

.actions-area{
  position: absolute;
  left: 0;
  top: 0;
  z-index: 99;
}

.fields-empty {
  margin: 24px 24px 0;
  height: 48px;
/*
  background: #FAFBFD;
  border: 1px dashed #C4C6CC;
  */
  font-size: 12px;
  color: #63656E;
  text-align: center;
  line-height: 48px;
}
</style>
<style lang="postcss">
.fields-container {
  & > li.drag-entry {
    position: relative;
    width: 100%;
    height: 0;
    font-size: 0;
    border-top: 2px solid #1768ef;
  }

  .field-item.sortable-ghost {
    border-top: 2px solid #1768ef;
  }
}
</style>
