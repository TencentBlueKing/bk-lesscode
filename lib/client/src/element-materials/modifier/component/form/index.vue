<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <div
        v-if="isShow"
        class="modifier-form"
    >
        <init-form :component-node="componentNode" :handle-submit-form-item="handleSubmitFormItem" />
        <div class="form-title">
            {{ $t('表单内容配置') }} </div>
        <div
            class="form-item-list">
            <vue-draggable
                ghost-class="block-item-ghost"
                :list="formItemList"
                handle=".option-col-drag"
                :group="{ name: 'form-item-list', pull: false, put: false }"
                @change="handleSort">
                <transition-group
                    type="transition"
                    :name="'flip-list'">
                    <template v-for="(formItemNode, index) in formItemList">
                        <div
                            v-if="formItemNode.prop.property"
                            :key="`item${index}`"
                            class="form-item">
                            <section
                                class="item-name"
                                :title="`${formItemNode.prop.label}(${formItemNode.prop.property})`">
                                <span>{{ formItemNode.prop.label }}</span>
                                <span class="property">({{ formItemNode.prop.property }})</span>
                            </section>
                            <section class="operate-btns">
                                <span
                                    class="form-item-edit"
                                    @click.stop="handleShowOperation(formItemNode)">
                                    <i class="bk-drag-icon bk-drag-edit" />
                                </span>
                                <span class="form-item-drag option-col-drag">
                                    <i class="bk-drag-icon bk-drag-drag-small1" />
                                </span>
                                <span
                                    class="form-item-delete"
                                    @click.stop="handleDelete(formItemNode)">
                                    <i class="bk-icon icon-close" />
                                </span>
                            </section>
                        </div>
                    </template>
                </transition-group>
            </vue-draggable>
        </div>
        <div
            class="table-column-add"
            @click="handleShowOperation(null)">
            {{ $t('继续添加表单项') }} </div>

        <form-button-setting :button-setting="componentNode.prop.btnSetting || {}" :handle-update-btn-item="handleUpdateBtn">
        </form-button-setting>

        <form-item-edit
            :is-show="isShowOperation"
            :default-value="editFormItemData"
            :submit="handleSubmitFormItem"
            :close="handleCancel" />
    </div>
</template>
<script>
    import _ from 'lodash'
    import LC from '@/element-materials/core'
    import { camelCase, camelCaseTransformMerge } from 'change-case'
    import formItemEdit from './components/form-item-edit'
    import initForm from './components/init-form'
    import formButtonSetting from './components/form-button-setting'
    import { getSubmitFormDataFunc, getResetFormValueFunc } from './components/form-helper'

    const getDefaultValFromType = (type) => {
        const typeValMap = {
            'bk-switcher': false,
            'bk-checkbox': false,
            'bk-checkbox-group': []
        }
        return typeValMap[type] !== undefined ? typeValMap[type] : ''
    }

    const genDefaultFormItemData = () => ({
        label: '',
        property: '',
        type: 'input',
        validate: []
    })

    const typeEnum = {
        'input': 'bk-input',
        'select': 'bk-select',
        'date-picker': 'bk-date-picker',
        'time-picker': 'bk-time-picker',
        'switcher': 'bk-switcher',
        'radio-group': 'bk-radio-group',
        'checkbox-group': 'bk-checkbox-group',
        'checkbox': 'bk-checkbox',

        'bk-input': 'input',
        'bk-select': 'select',
        'bk-date-picker': 'date-picker',
        'bk-time-picker': 'time-picker',
        'bk-switcher': 'switcher',
        'bk-radio-group': 'radio-group',
        'bk-checkbox-group': 'checkbox-group',
        'bk-checkbox': 'checkbox'
    }

    export default {
        name: '',
        components: {
            formItemEdit,
            formButtonSetting,
            initForm
        },
        inheritAttrs: false,
        data () {
            return {
                isShow: false,
                isShowOperation: false,
                editFormItemData: {},
                initPayload: {},
                submitBtnNode: null,
                cancelBtnNode: null
            }
        },

        computed: {
            formModelKey () {
                const modelProps = this.componentNode.renderProps?.model || {}
                let formModelKey = `${camelCase(this.componentNode.componentId, { transform: camelCaseTransformMerge })}model`
                if (modelProps?.buildInVariableType === 'CUSTOM' && modelProps.payload?.customVariableCode) {
                    formModelKey = modelProps.payload?.customVariableCode
                }
                return formModelKey
            }
        },
        
        created () {
            // 编辑的表单项
            this.editFormItemNode = null
            
            this.componentNode = LC.getActiveNode()
            this.isShow = this.componentNode.type === 'widget-form'
            if (!this.isShow) {
                return
            }

            this.formItemList = [...this.componentNode.children]

            const updateCallback = _.throttle((event) => {
                if (this.componentNode.componentId === event.target.componentId) {
                    this.formItemList = [...this.componentNode.children]
                    this.$forceUpdate()
                }
            }, 20)

            LC.addEventListener('update', updateCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('update', updateCallback)
            })
        },
        methods: {
            handleSort (event) {
                if (event.moved) {
                    const {
                        element,
                        newIndex,
                        oldIndex
                    } = event.moved
                    if (newIndex === oldIndex) {
                        return
                    }
                    // 从原位置删除
                    this.componentNode.removeChild(element)
                    // 插入新位置
                    this.componentNode.insertBefore(element, this.componentNode.children[newIndex])
                }
            },
            /**
             * @desc 编辑表单项属性
             * @param { Object | null } formItemNode 操作的表单节点
            */
            handleShowOperation (formItemNode) {
                const editFormItemData = genDefaultFormItemData()
                
                if (formItemNode) {
                    editFormItemData.label = formItemNode.prop.label
                    editFormItemData.property = formItemNode.prop.property
                    editFormItemData.type = typeEnum[formItemNode.children[0].type]
                    editFormItemData.validate = formItemNode.parentNode.prop.rules[formItemNode.prop.property] || []
                }

                this.editFormItemData = Object.freeze(editFormItemData)
                this.editFormItemNode = formItemNode
                this.isShowOperation = true
            },

            setSubmitBtn () {
                if (this.submitBtnNode) return _.cloneDeep(this.submitBtnNode)
                const payload = this.initPayload || {}
                // 提交按钮
                const submitBtnNode = LC.createNode('bk-button')
                submitBtnNode.setRenderSlots({
                    format: 'value',
                    component: 'text',
                    code: this.$t('提交'),
                    valueType: 'text',
                    renderValue: this.$t('提交')
                })
                
                submitBtnNode.setProp('theme', LC.utils.genPropFormatValue({
                    format: 'value',
                    code: 'primary',
                    renderValue: 'primary'
                }))
                
                // 绑定click事件并生成事件模板
                submitBtnNode.setRenderEvents({
                    click: {
                        enable: true,
                        methodCode: '',
                        params: [],
                        eventTemplates: [
                            {
                                funcName: 'submitFormData',
                                funcParams: [],
                                funcBody: getSubmitFormDataFunc({
                                    '{ref}': this.componentNode.prop.ref,
                                    '{formmodel}': this.formModelKey,
                                    '{posturl}': payload.initType === 'table-data-source' ? `/data-source/user/tableName/${payload.tableData.tableName}` : '/api/data/postMockData',
                                    '{urlTips}': payload.initType === 'table-data-source' ? window.i18n.t('此地址会将数据提交到lesscode创建的数据表，{0}为选择的表名称，若需提交到其它接口请作相应修改', [payload.tableData.tableName]) : this.$t('示例链接/api/data/postMockData需要更换为具体的接口API地址')
                                })
                            }
                        ]
                    }
                })
                return submitBtnNode
            },

            setCancelBtn () {
                if (this.cancelBtnNode) return _.cloneDeep(this.cancelBtnNode)
                // 取消按钮
                const cancelBtnNode = LC.createNode('bk-button')
                cancelBtnNode.setRenderSlots({
                    format: 'value',
                    component: 'text',
                    code: this.$t('取消'),
                    valueType: 'text',
                    renderValue: this.$t('取消')
                })
                cancelBtnNode.setStyle({
                    'marginLeft': '8px'
                })
                // 绑定click事件并生成事件模板
                cancelBtnNode.setRenderEvents({
                    click: {
                        enable: true,
                        methodCode: '',
                        params: [],
                        eventTemplates: [
                            {
                                funcName: 'resetFormData',
                                funcParams: [],
                                funcBody: getResetFormValueFunc(this.formModelKey)
                            }
                        ]
                    }
                })
                return cancelBtnNode
            },

            // 设置操作按钮
            handleSetBtnItem () {
                // 记录设置前是否已有按钮
                let hasBtnItem = true

                let btnItemNode = _.find(this.componentNode.children, node => !node.prop.property)
                const btnSetting = this.componentNode.prop?.btnSetting
                
                if (!btnItemNode) {
                    hasBtnItem = false
                    btnItemNode = LC.createNode('widget-form-item')
                }
                // 找出提交按钮跟取消按钮
                let submitItem = null
                let cancelItem = null
                if (btnItemNode.children.length > 1) {
                    submitItem = btnItemNode.children[0]
                    cancelItem = btnItemNode.children[1]
                } else if (btnItemNode.children.length === 1) {
                    const item = btnItemNode.children[0]
                    // 如果只有一个，目前只能根据主题是否为default粗略判断
                    if (item?.prop?.theme === 'default') {
                        cancelItem = item
                    } else {
                        submitItem = item
                    }
                }
                    
                // 增加或删除提交按钮
                if (submitItem && btnSetting?.SHOW_SUBMIT_BTN === false) {
                    this.submitBtnNode = _.cloneDeep(submitItem)
                    btnItemNode.removeChild(submitItem)
                } else if (!submitItem && btnSetting?.SHOW_SUBMIT_BTN !== false) {
                    btnItemNode.renderSlots.default?.splice(0, 0, this.setSubmitBtn())
                }
                // 增加或删除取消按钮
                if (cancelItem && btnSetting?.SHOW_CANCEL_BTN === false) {
                    this.cancelBtnNode = _.cloneDeep(cancelItem)
                    btnItemNode.removeChild(cancelItem)
                } else if (!cancelItem && btnSetting?.SHOW_CANCEL_BTN !== false) {
                    btnItemNode.appendChild(this.setCancelBtn())
                }

                if (btnItemNode.children.length) {
                    !hasBtnItem && this.componentNode.appendChild(btnItemNode)
                    return btnItemNode
                } else {
                    hasBtnItem && this.componentNode.removeChild(btnItemNode)
                    return null
                }
            },

            handleUpdateBtn (btnSetting) {
                this.componentNode.setProp('btnSetting', LC.utils.genPropFormatValue({
                    format: 'value',
                    code: btnSetting,
                    renderValue: btnSetting
                }))
                this.handleSetBtnItem()
            },
            /**
             * @desc 提交表单项
            */
            handleSubmitFormItem (itemData, payload = {}) {
                const genInputNode = name => {
                    const node = LC.createNode(typeEnum[name])
                    
                    if ([
                        'input',
                        'select',
                        'date-picker',
                        'time-picker'
                    ].includes(name)) {
                        node.setStyle('width', '300px')
                    }
                    return node
                }

                const setProp = node => {
                    const formItemPropList = ['label', 'property', 'required']
                    const propsValue = {}
                    formItemPropList.forEach(propName => {
                        propsValue[propName] = LC.utils.genPropFormatValue({
                            format: 'value',
                            code: itemData[propName],
                            renderValue: itemData[propName]
                        })
                    })
                    // 验证规则里面配有 required 规则
                    const hasRequired = ((itemData.validate || []).filter(item => item.required === true).length > 0)
                    propsValue['required'] = LC.utils.genPropFormatValue({
                        format: 'value',
                        code: hasRequired,
                        renderValue: hasRequired
                    })
                    node.setProp(propsValue)
                }

                const setDirective = node => {
                    node.setRenderDirectives([
                        {
                            type: 'v-model',
                            format: 'variable',
                            prop: node.type === 'bk-checkbox' ? 'checked' : 'value',
                            code: `${this.formModelKey}.${itemData.property}`,
                            renderValue: getDefaultValFromType(node.type)
                        }
                    ])
                }

                if (payload?.initType) {
                    this.initPayload = payload
                }
                if (this.editFormItemNode) {
                    // 编辑
                    // const editFormItemDataProp = this.editFormItemNode.prop
                    //  可能修改了 property，删除老数据重新收集
                    // delete formPropRules[editFormItemDataProp.property]
                
                    let inputNode = this.editFormItemNode.children[0]
                    // 表单组件类型改变，删除原有组件
                    if (inputNode.type !== typeEnum[itemData.type]) {
                        this.editFormItemNode.removeChild(inputNode)
                        // 新建一个新组件
                        inputNode = genInputNode(itemData.type)
                        this.editFormItemNode.appendChild(inputNode)
                    }
                    
                    setDirective(inputNode)
                    setProp(this.editFormItemNode)
                } else {
                    // 新建 form-item
                    const formItemNode = LC.createNode('widget-form-item')
                    const inputNode = genInputNode(itemData.type)
                    setDirective(inputNode)
                    formItemNode.appendChild(inputNode)
                    setProp(formItemNode)

                    // 新建表单的操作按钮
                    // prop.property 为空表示为 form 的操作项
                    let actionFormItemNode = _.find(this.componentNode.children, node => !node.prop.property)
                    // 如果为空，则设置一次按钮
                    !actionFormItemNode && (actionFormItemNode = this.handleSetBtnItem())
                    if (!actionFormItemNode) {
                        // 没有操作按钮，放到最后
                        this.componentNode.appendChild(formItemNode)
                    } else {
                        // 新建的表单项放在操作按钮的前面
                        this.componentNode.insertBefore(formItemNode, actionFormItemNode)
                    }
                }

                // 更新model和rules
                this.updateFormModel()
                const formPropRules = Object.assign({}, this.componentNode.prop.rules, { [itemData.property]: itemData.validate })
                const newPropRules = this.componentNode.children.reduce((result, formItemNode) => {
                    const formItemProp = formItemNode.prop
                    if (formItemProp.property) {
                        result[formItemProp.property] = formPropRules[formItemProp.property]
                    }
                    return result
                }, {})
                this.componentNode.setProp({
                    'rules': LC.utils.genPropFormatValue({
                        format: 'value',
                        code: newPropRules,
                        renderValue: newPropRules
                    })
                })
                window.leaveConfirm = false
                this.isShowOperation = false
            },
            updateFormModel () {
                const modelProps = this.componentNode.renderProps?.model || {}
                // form.prop.model 通过遍历 formItem 收集 formItem.prop.property得到
                const model = this.componentNode.children.reduce((result, formItemNode) => {
                    const formItemProp = formItemNode.prop
                    if (formItemProp.property) {
                        result[formItemProp.property] = getDefaultValFromType(formItemNode.children[0].type)
                    }
                    return result
                }, {})
                this.componentNode.setProp('model', LC.utils.genPropFormatValue({
                    format: 'value',
                    code: model,
                    renderValue: model,
                    payload: modelProps?.payload || {},
                    buildInVariableType: modelProps?.buildInVariableType
                }))
            },
            /**
             * @desc 关闭表单项标记框
            */
            handleCancel () {
                this.editFormItemNode = null
                this.isShowOperation = false
            },
            /**
             * @desc 删除表达项
             * @param {Number} index 表单项索引
            */
            handleDelete (formItemNode) {
                this.componentNode.removeChild(formItemNode)

                // 更新 form 的 prop.rules
                const rules = { ...this.componentNode.prop.rules }
                delete rules[formItemNode.prop.property]
                this.componentNode.setProp('rules', LC.utils.genPropFormatValue({
                    format: 'value',
                    code: rules,
                    renderValue: rules
                }))
                this.updateFormModel()
            }
        }
    }
</script>
<style lang='postcss'>
    .modifier-form {
        padding: 0 10px;
        margin-bottom: 16px;
        .form-title {
            margin: 20px 0 10px;
            font-size: 12px;
            color: #313238;
            font-weight: bold;
        }
        .form-item-list {
            display: flex;
            flex-direction: column;
            .form-item{
                display: flex;
                align-items: center;
                justify-content: space-between;
                height: 36px;
                opacity: 1;
                background: #f0f1f5;
                border-radius: 2px;
                padding: 0 10px;
                margin-bottom: 6px;
                cursor: default;
                &:hover {
                    box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
                }
                .item-name {
                    width: 195px;
                    font-size: 12px;
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    .property{
                        font-style: italic;
                        color: #ccc;
                    }
                }
                .operate-btns {
                    cursor: pointer;
                    font-size: 16px;
                    .option-col-drag {
                        cursor: move;
                    }
                }
            }
        }
    }
</style>
