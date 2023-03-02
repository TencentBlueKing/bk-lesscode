<template>
    <section class="choose-function-main">
        <slot name="header"></slot>

        <bk-popover
            ref="mainPopoverRef"
            placement="bottom"
            trigger="click"
            theme="light"
            ext-cls="g-popover-empty-padding"
            class="choose-function-popover"
            :tippy-options="{ arrow: false }"
            :on-show="getFunctionListFromApi"
        >
            <bk-input
                class="choose-input"
                placeholder="请选择函数"
                :value="renderChoosenFunction.methodCode"
                readonly
            />
            <i
                :class="[
                    'choose-icon bk-icon icon-angle-down',
                    {
                        'hover-hidden': renderChoosenFunction.methodCode
                    }
                ]"
            ></i>
            <i
                :class="[
                    'choose-icon bk-icon icon-close-circle-shape',
                    {
                        'hover-show': renderChoosenFunction.methodCode
                    }
                ]"
                @click.stop="handleClear"
            ></i>
            <div slot="content">
                <section class="choose-function" v-bkloading="{ isLoading }">
                    <bk-tab
                        class="function-tab"
                        type="border-card"
                        :label-height="42"
                        :active.sync="functionType"
                    >
                        <bk-tab-panel
                            v-for="(functionTypeItem, index) in functionTypeList"
                            v-bind="functionTypeItem"
                            :key="index"
                        >
                            <bk-input
                                class="choose-function-search"
                                left-icon="bk-icon icon-search"
                                behavior="simplicity"
                                v-model="searchFunctionName"
                            ></bk-input>
                            <template v-if="functionType === 'functionList'">
                                <ul class="function-list">
                                    <li
                                        class="function-group"
                                        :key="funcGroup.groupName"
                                        v-for="funcGroup in computedFunctionData"
                                    >
                                        <span class="function-group-name">
                                            {{ funcGroup.groupName }}（{{ funcGroup.children.length }}）
                                        </span>
                                        <ul class="group-function-list">
                                            <li
                                                v-bk-tooltips="{
                                                    content: functionData.funcSummary,
                                                    disabled: !functionData.funcSummary,
                                                    placements: ['left-start'],
                                                    width: 200,
                                                    boundary: 'window'
                                                }"
                                                v-for="functionData in funcGroup.children"
                                                :class="{
                                                    'select': renderChoosenFunction.methodCode === functionData.funcCode,
                                                    'function-item': true
                                                }"
                                                :key="functionData.funcName"
                                                @click="handleChooseFunction(functionData)"
                                            >
                                                <span class="function-item-name" v-bk-overflow-tips>
                                                    {{ functionData.funcName }}（{{ functionData.funcCode }}）
                                                </span>
                                                <i
                                                    class="bk-icon icon-edit-line function-tool mt10"
                                                    @click.stop="handleEditFunction(functionData)"
                                                ></i>
                                            </li>
                                        </ul>
                                    </li>
                                </ul>
                                <bk-button
                                    class="function-add"
                                    text
                                    @click="handleCreateFunction"
                                >
                                    <i class="bk-icon icon-plus-circle"></i>新增
                                </bk-button>
                            </template>
                            <ul class="function-list" v-else>
                                <li
                                    class="function-item"
                                    v-for="functionData in computedFunctionData"
                                    v-bk-tooltips="{
                                        content: functionData.funcSummary,
                                        disabled: !functionData.funcSummary,
                                        placements: ['left-start'],
                                        width: 200,
                                        boundary: 'window'
                                    }"
                                    :key="functionData.funcName"
                                >
                                    <span class="function-item-name" v-bk-overflow-tips>{{ functionData.funcName }}</span>
                                    <span
                                        class="function-tool"
                                        @click="handleInsertFunction(functionData)"
                                    >引用</span>
                                </li>
                            </ul>
                            <bk-exception
                                class="exception-wrap-item exception-part"
                                type="empty"
                                scene="part"
                                v-if="computedFunctionData.length <= 0"
                            ></bk-exception>
                        </bk-tab-panel>
                    </bk-tab>
                </section>
            </div>
        </bk-popover>

        <template v-if="showAddParams">
            <div class="panel-item" v-for="(panel, index) in renderChoosenFunction.params" :key="index">
                <variable-select
                    class="select-param"
                    :options="{ formatInclude }"
                    :value="panel"
                    @change="({ format, code }) => handleChangeParam(index, { format, code, value: '' })"
                >
                    <span
                        v-bk-tooltips="{
                            content: '1. 配置的执行参数，会在函数执行的时候传入<br>2. 参数选择【事件】类型，则无需填写，函数执行的时候会使用组件事件提供的值作为参数（如表格组件的 page-change 事件会提供参数）<br>3. 组件事件提供的参数是优先接收的，确保放到前边<br>4. 参数还可以选择手动输入值、使用变量值或表达式',
                            width: '350px',
                            placements: ['left'],
                            boundary: 'window'
                        }"
                        class="param-title"
                        slot="title"
                    >
                        <span class="title">参数（{{ computedParamKeys[index] }}）</span>
                    </span>
                    <bk-input
                        :value="panel.value"
                        @change="value => handleInputParam(index, { value })"
                        @blur="triggleUpdate"
                    />
                </variable-select>
            </div>
        </template>

        <edit-function-dialog
            :show.sync="isShowEditFunctionDialog"
            :select-func-code="selectFuncCode"
            :insert-function="insertFunctionData"
            :show-save-use="true"
            @save-use="handleChooseFunction"
        />
    </section>
</template>

<script>
    import { mapActions, mapGetters } from 'vuex'
    import { getDefaultFunction } from 'shared/function'
    import EditFunctionDialog from '@/components/methods/edit-function-dialog/index.vue'
    import VariableSelect from '@/components/variable/variable-select/index.vue'

    export default {
        components: {
            EditFunctionDialog,
            VariableSelect
        },

        props: {
            choosenFunction: {
                type: Object
            },
            functionTemplates: {
                type: Array,
                default: () => ([])
            },
            showAddParams: {
                type: Boolean,
                default: true
            },
            formatInclude: {
                type: Array,
                default: () => (['value', 'variable', 'expression'])
            },
            defaultVariableFormat: {
                type: String,
                default: 'value'
            }
        },

        data () {
            return {
                functionTypeList: [
                    { name: 'functionTemplate', label: '事件模板' },
                    { name: 'functionMarket', label: '函数市场' },
                    { name: 'functionList', label: '应用函数管理' }
                ],
                searchFunctionName: '',
                functionType: 'functionList',
                marketFunctionList: [],
                isLoading: false,
                isShowEditFunctionDialog: false,
                selectFuncCode: '',
                insertFunctionData: undefined,
                renderChoosenFunction: {}
            }
        },

        computed: {
            ...mapGetters('functions', ['funcGroups']),

            computedFunctionData () {
                let functionData
                switch (this.functionType) {
                    case 'functionTemplate':
                        functionData = this
                            .functionTemplates
                            ?.filter(functionTemplate => functionTemplate.funcName?.includes(this.searchFunctionName))
                        break
                    case 'functionMarket':
                        functionData = this
                            .marketFunctionList
                            ?.filter(marketFunction => marketFunction.funcName?.includes(this.searchFunctionName))
                        break
                    case 'functionList':
                        functionData = this
                            .funcGroups
                            ?.reduce((acc, cur) => {
                                const children = cur
                                    .children
                                    .filter(functionData => functionData.funcName?.includes(this.searchFunctionName))
                                acc.push({
                                    ...cur,
                                    children
                                })
                                return acc
                            }, [])
                        break
                }
                return functionData || []
            },

            computedParamKeys () {
                let functionData = {}
                this.funcGroups.forEach((funcGroup) => {
                    const usedFunction = funcGroup.children.find(functionData => functionData.funcCode === this.renderChoosenFunction.methodCode)
                    if (usedFunction) {
                        functionData = usedFunction
                    }
                }, {})
                return functionData?.funcParams || []
            }
        },

        created () {
            this.renderChoosenFunction = {
                methodCode: this.choosenFunction?.methodCode || '',
                params: [...this.choosenFunction?.params || []]
            }

            // 如果有选择函数，需要查找到对应的 params
            if (this.renderChoosenFunction.methodCode) {
                this.renderChoosenFunction.params = this.computedParamKeys.map((paramKey, index) => {
                    let param = {
                        value: '',
                        code: '',
                        format: this.defaultVariableFormat
                    }
                    if (this.choosenFunction?.params?.[index]) {
                        param = this.choosenFunction.params[index]
                    }
                    return param
                })
            }
        },

        methods: {
            ...mapActions('functionMarket', ['getFunctionList']),

            getFunctionListFromApi () {
                this.isLoading = true
                this.getFunctionList().then((functionList) => {
                    this.marketFunctionList = functionList
                }).finally(() => {
                    this.isLoading = false
                })
            },

            triggleUpdate () {
                this.$emit('change', JSON.parse(JSON.stringify(this.renderChoosenFunction)))
            },

            handleChooseFunction (functionData) {
                this.renderChoosenFunction.methodCode = functionData.funcCode
                this.renderChoosenFunction.params = functionData?.funcParams?.map(() => ({
                    value: '',
                    code: '',
                    format: this.defaultVariableFormat
                }))
                this.triggleUpdate()
                this.handleClose()
            },

            handleChangeParam (index, val) {
                Object.assign(this.renderChoosenFunction.params[index], val)
                this.triggleUpdate()
            },

            handleInputParam (index, val) {
                Object.assign(this.renderChoosenFunction.params[index], val)
            },

            handleEditFunction (functionData) {
                this.clearStatus()
                this.selectFuncCode = functionData.funcCode
                this.showFunctionDialog()
                this.handleClose()
            },

            // 新增函数
            handleCreateFunction () {
                this.handleInsertFunction({
                    funcName: 'Untitled'
                })
            },

            // 打开函数框，新增一条数据
            handleInsertFunction ({ id, ...functionData }) {
                this.clearStatus()
                this.insertFunctionData = {
                    ...getDefaultFunction(),
                    ...functionData,
                    projectId: this.$route.params.projectId
                }
                this.showFunctionDialog()
                this.handleClose()
            },

            clearStatus () {
                this.selectFuncCode = undefined
                this.insertFunctionData = undefined
            },

            showFunctionDialog () {
                this.isShowEditFunctionDialog = true
            },

            handleClose () {
                this.$refs['mainPopoverRef'].hideHandler()
            },

            handleClear () {
                this.renderChoosenFunction.methodCode = ''
                this.renderChoosenFunction.params = []
                this.$emit('clear')
            }
        }
    }
</script>

<style lang='postcss' scoped>
    @import "@/css/mixins/scroller";
    @import "@/css/mixins/ellipsis";

    .choose-function-main {
        position: relative;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }
    .choose-function-popover {
        width: 100%;
        ::v-deep .bk-tooltip-ref {
            width: 100%;
        }
        &:hover {
            .hover-hidden {
                display: none;
            }
            .hover-show {
                display: block;
            }
        }
    }
    .panel-item {
        display: flex;
        align-items: center;
        margin-top: 8px;
        width: 100%;
        .select-param {
            flex: 1;
            .param-title {
                line-height: 25px;
            }
            .title {
                border-bottom: 1px dashed #979ba5;
                cursor: pointer;
            }
            /deep/ .display-content {
                margin: 0;
            }
        }
    }
    .icon-minus-circle {
        margin: 23px 3px 0 8px;
        cursor: pointer;
        color: #979ba5;
        &:hover {
            color: #63656e;
        }
    }
    .panel-add {
        font-size: 12px;
        margin: 12px 0 0;
        line-height: 16px;
        cursor: pointer;
        color: #3A84FF;
        &.disabled {
            color: #a3c5fd;
            cursor: not-allowed;
        }
        i {
            padding-right: 2px;
        }
        .icon-plus-circle {
            margin-right: 4px;
            font-size: 14px;
        }
    }
    .choose-input {
        width: 100%;
        cursor: pointer;
        ::v-deep .bk-form-input[readonly] {
            background-color: #ffffff !important;
            border-color: #c4c6cc !important;
            cursor: pointer;
        }
    }
    .choose-icon {
        cursor: pointer;
        position: absolute;
        right: 4px;
        top: 4px;
        color: #979ba5;
        font-size: 22px;
        &.icon-close-circle-shape {
            display: none;
            position: absolute;
            right: 8px;
            top: 8px;
            text-align: center;
            font-size: 14px;
            z-index: 100;
            color: #c4c6cc;
            &:hover {
                color: #979ba5;
            }
        }
    }
    .choose-function {
        .choose-function-search {
            width: 280px;
            margin: 4px 10px;
            ::v-deep input {
                border-color: transparent transparent #EAEBF0;
            }
        }
        .function-list {
            max-height: 350px;
            overflow-y: auto;
            padding-bottom: 8px;
            background: #fff;
            @mixin scroller;
        }
        .function-add {
            width: 100%;
            padding: 0 16px;
            border-radius: 0 0 1px 1px;
            border-top: 1px solid #dcdee5;
            background: #fafbfd;
            line-height: 32px;
            height: 32px;
            text-align: left;
            font-size: 12px;
            .icon-plus-circle {
                font-size: 14px;
                margin-right: 4px;
                vertical-align: text-bottom;
            }
        }
        .function-group {
            font-size: 12px;
            .function-group-name {
                display: inline-block;
                width: 280px;
                line-height: 32px;
                color: #979ba5;
                margin: 0 10px;
                border-bottom: 1px solid #dcdee5;
            }
        }
        .function-item {
            height: 32px;
            line-height: 32px;
            padding: 0 20px;
            cursor: pointer;
            color: #63656E;
            .function-item-name {
                @mixin ellipsis 230px, inline-block;
            }
            .function-tool {
                float: right;
                color: #3A84FF;
                display: none;
            }
            &.select {
                background: #e1ecff;
                color: #3a84ff;
            }
            &:hover {
                background: #e1ecff;
                color: #3a84ff;
                .function-tool {
                    display: block;
                }
            }
        }
        .exception-wrap-item {
            margin-bottom: 30px;
        }
        ::v-deep .bk-tab-label-wrapper .bk-tab-label-list .bk-tab-label-item.simulate-border-bottom .bk-tab-label {
            box-shadow: none !important;
        }
        ::v-deep .bk-tab-section {
            padding: 0;
        }
    }
    .function-tab {
        ::v-deep .bk-tab-header {
            height: 32px !important;
            border-top: none;
            background-image: none !important;
        }
        ::v-deep .bk-tab-label-wrapper, ::v-deep .bk-tab-label-list, ::v-deep .bk-tab-label-list li {
            height: 32px !important;
            line-height: 32px !important;
        }
        ::v-deep .bk-tab-label-list li {
            border: none;
            background: #f0f1f5;
            &:nth-child(2) {
                border-radius: 0px 0px 4px 0px;
            }
            &:last-child {
                border-radius: 0px 0px 0px 4px;
            }
        }
        ::v-deep .bk-tab-label-list li .bk-tab-label {
            font-size: 12px;
        }
        ::v-deep .bk-tab-content {
            background-color: #fff;
        }
    }
    ::v-deep .tippy-active {
        .icon-angle-down {
            transform: rotate(180deg);
        }
        .choose-input .bk-input-text input {
            border-color: #3a84ff !important;
            box-shadow: 0 0 4px rgb(58 132 255 / 40%);
        }
    }
</style>
