import {
    getDefaultApiUseScheme,
    getDefaultApiEditScheme,
    API_PARAM_TYPES
} from 'shared/api'
import './scheme.css'
import {
    defineComponent,
    toRef,
    ref,
    getCurrentInstance
} from '@vue/composition-api'
import useCustomValidate from '@/hooks/use-custom-validate'

export default defineComponent({
    name: 'single-scheme',

    components: {
        RenderValidate: () => import('./validate.vue')
    },

    props: {
        scheme: Object,
        parent: Object,
        brothers: Array,
        disable: Boolean,
        typeDisable: Boolean,
        minusDisable: Boolean,
        plusBrotherDisable: Boolean,
        renderSlot: Function,
        hideRequired: Boolean,
        nameOptions: Array,
        variableList: Array,
        functionList: Array,
        apiList: Array,
        showRule: {
            type: Boolean,
            default: true
        }
    },

    setup (props, { emit }) {
        const {
            customValidate
        } = useCustomValidate()

        const copyScheme = toRef(props, 'scheme')
        const finalDisable = props.disable || copyScheme.value.disable
        const finalTypeDisable = props.typeDisable || finalDisable
        const disablePlusBrother = props.plusBrotherDisable || copyScheme.value.plusBrotherDisable
        const formRef = ref(null)
        const currentInstance = getCurrentInstance()
        // 校验规则
        const requireRule = {
            validator (val) {
                return val.length >= 1 || props.minusDisable || props.parent?.type === API_PARAM_TYPES.ARRAY.VAL
            },
            message: window.i18n.t('参数名是必填项，请修改后重试'),
            trigger: 'blur'
        }
        const sameNameRule = {
            validator (val) {
                return val.length <= 0 || props.brothers?.filter?.((brother: any) => brother.name === val).length <= 1
            },
            message: window.i18n.t('参数名不能和同级参数名重复'),
            trigger: 'blur'
        }
        const nameRule = {
            validator (val) {
                return val.length <= 0 || /^[a-zA-Z][a-zA-Z0-9_]*$/.test(val)
            },
            message: window.i18n.t('参数名由大小写字母、数字和下划线组成，以大小写字母开头'),
            trigger: 'blur'
        }
        const customValidateRule = {
            validator (val) {
                const value = copyScheme.value.valueType === 'variable' ? copyScheme.value.code : val
                return customValidate(value, copyScheme.value.validate, props.variableList, props.functionList, props.apiList)
            },
            message: window.i18n.t('参数值不符合自定义校验'),
            trigger: 'blur'
        }
        // 切换是否展示子节点
        const toggleShowProperty = () => {
            copyScheme.value.showChildren = !copyScheme.value.showChildren
            triggerChange()
        }
        // 增加子节点
        const plusChildProperty = () => {
            if (copyScheme.value.valueType) {
                copyScheme.value.children.push(getDefaultApiUseScheme())
            } else {
                copyScheme.value.children.push(getDefaultApiEditScheme())
            }
            triggerChange()
        }
        // 增加兄弟节点
        const handlePlusBrotherProperty = () => {
            emit('plusBrotherNode')
        }
        // 删除节点
        const handleMinusProperty = (index) => {
            if (props.minusDisable) return
            emit('minusNode', index)
        }
        const minusProperty = (index) => {
            copyScheme.value?.children?.splice(index, 1)
            triggerChange()
        }
        // 更新类型
        const updateType = (type) => {
            // 清空子项
            copyScheme.value.children = []
            // update value & type
            Object.keys(API_PARAM_TYPES).forEach((paramTypeKey) => {
                const paramType = API_PARAM_TYPES[paramTypeKey]
                if (paramType.VAL === type) {
                    copyScheme.value.type = paramType.VAL
                    copyScheme.value.value = paramType.DEFAULT
                }
            })
            triggerChange()
        }
        // 更新值
        const update = (val) => {
            Object.assign(copyScheme.value, val)
            triggerChange()
        }
        // 触发值更新
        const triggerChange = () => {
            emit('update', copyScheme.value)
        }
        // 校验
        const validate = () => {
            const childComponents = currentInstance.proxy.$refs
            return Promise
                .all([
                    formRef.value.validate(),
                    ...Object
                        .keys(childComponents)
                        .map(childComponentRef => (childComponents[childComponentRef] as any)?.validate())
                ])
        }

        return {
            requireRule,
            sameNameRule,
            nameRule,
            customValidateRule,
            copyScheme,
            finalDisable,
            finalTypeDisable,
            disablePlusBrother,
            formRef,
            toggleShowProperty,
            plusChildProperty,
            handlePlusBrotherProperty,
            handleMinusProperty,
            minusProperty,
            updateType,
            update,
            triggerChange,
            validate
        }
    },

    render () {
        return (
            <section>
                <section class="object-layout layout-row">
                    <i
                        class={
                            [
                                'bk-icon icon-down-shape layout-icon',
                                {
                                    close: !this.copyScheme.showChildren,
                                    hidden: [
                                        API_PARAM_TYPES.BOOLEAN.VAL,
                                        API_PARAM_TYPES.NUMBER.VAL,
                                        API_PARAM_TYPES.STRING.VAL
                                    ].includes(this.copyScheme.type)
                                }
                            ]
                        }
                        onClick={this.toggleShowProperty}
                    ></i>
                    <bk-form
                        class="layout-flex"
                        ref="formRef"
                        {
                            ...{
                                props: {
                                    labelWidth: 0,
                                    model: this.copyScheme
                                }
                            }
                        }
                    >
                        <bk-form-item
                            rules={[this.requireRule, this.sameNameRule, this.nameRule]}
                            property="name"
                            error-display-type="tooltips"
                        >
                            {
                                this.nameOptions?.length > 0
                                && ![API_PARAM_TYPES.ARRAY.VAL, API_PARAM_TYPES.OBJECT.VAL].includes(this.copyScheme.type)
                                    ? <bk-select
                                        clearable={false}
                                        disabled={this.finalDisable}
                                        value={this.copyScheme.name}
                                        onChange={(name) => this.update({ name })}
                                    >
                                        {
                                            this.nameOptions.map((option: any) => (
                                                <bk-option
                                                    id={option.name}
                                                    name={option.name}
                                                    key={option.name}
                                                    v-bk-tooltips={{ content: option.comment, disabled: !option.comment, maxWidth: 400 }}
                                                >
                                                </bk-option>
                                            ))
                                        }
                                    </bk-select>
                                    : <bk-input
                                        placeholder={this.$t('请输入参数名')}
                                        value={this.copyScheme.name}
                                        disabled={this.finalDisable || this.parent?.type === API_PARAM_TYPES.ARRAY.VAL}
                                        onInput={(name) => this.update({ name })}
                                    >
                                    </bk-input>
                            }
                        </bk-form-item>
                    </bk-form>
                    <bk-select
                        class="layout-middle"
                        value={this.copyScheme.type}
                        clearable={false}
                        disabled={this.finalTypeDisable}
                        onChange={(type) => this.updateType(type)}
                    >
                        {
                            Object.keys(API_PARAM_TYPES).map((key) => (
                                <bk-option
                                    id={API_PARAM_TYPES[key].VAL}
                                    name={API_PARAM_TYPES[key].VAL}
                                >
                                </bk-option>
                            ))
                        }
                    </bk-select>
                    <bk-form
                        class="layout-item layout-flex-center"
                        ref="valueFormRef"
                        {
                            ...{
                                props: {
                                    labelWidth: 0,
                                    model: this.copyScheme
                                }
                            }
                        }
                    >
                        <bk-form-item
                            rules={[this.customValidateRule]}
                            property="value"
                            error-display-type="tooltips"
                        >
                            {
                                this.renderSlot
                                    ? this.renderSlot(this.copyScheme)
                                    : this.copyScheme.type === API_PARAM_TYPES.BOOLEAN.VAL
                                        ? <bk-checkbox
                                            value={this.copyScheme.value}
                                            disabled={this.finalDisable}
                                            onChange={(val) => this.update({ value: val })}
                                        >
                                        </bk-checkbox>
                                        : <bk-input
                                            placeholder={this.$t('请输入参数值')}
                                            value={this.copyScheme.value}
                                            disabled={this.finalDisable || [API_PARAM_TYPES.ARRAY.VAL, API_PARAM_TYPES.OBJECT.VAL].includes(this.copyScheme.type)}
                                            onChange={(val) => this.update({ value: this.copyScheme.type === API_PARAM_TYPES.NUMBER.VAL && !isNaN(+val) ? +val : val })}
                                        >
                                        </bk-input>
                        
                            }
                        </bk-form-item>
                    </bk-form>
                    {
                        this.showRule ?
                        [API_PARAM_TYPES.ARRAY.VAL, API_PARAM_TYPES.OBJECT.VAL].includes(this.copyScheme.type)
                            ? <span class="layout-middle">--</span>
                            : <render-validate
                                class="layout-middle"
                                scheme={this.copyScheme}
                                onChange={(validate) => this.update({ validate })}
                            />
                        :
                        ''
                    }
                    <bk-input
                        class="layout-middle"
                        v-bk-tooltips={{ content: this.copyScheme.description, disabled: !this.copyScheme.description, maxWidth: 400 }}
                        value={this.copyScheme.description}
                        disabled={this.finalDisable}
                        onChange={(description) => this.update({ description })}
                    >
                    </bk-input>
                    <span class="layout-icons">
                        <bk-popover
                            ext-cls="g-popover-empty-padding"
                            placement="top"
                            theme="light"
                        >
                            {
                                [
                                    API_PARAM_TYPES.OBJECT.VAL,
                                    API_PARAM_TYPES.ARRAY.VAL
                                ].includes(this.copyScheme.type) && this.disablePlusBrother
                                    ? <i
                                        class="bk-drag-icon bk-drag-add-fill layout-icon"
                                        onClick={this.plusChildProperty}
                                    ></i>
                                    : ''
                            }
                            {
                                [
                                    API_PARAM_TYPES.BOOLEAN.VAL,
                                    API_PARAM_TYPES.NUMBER.VAL,
                                    API_PARAM_TYPES.STRING.VAL
                                ].includes(this.copyScheme.type) && !this.disablePlusBrother
                                    ? <i
                                        class="bk-drag-icon bk-drag-add-fill layout-icon"
                                        onClick={this.handlePlusBrotherProperty}
                                    ></i>
                                    : ''
                            }
                            {
                                [
                                    API_PARAM_TYPES.OBJECT.VAL,
                                    API_PARAM_TYPES.ARRAY.VAL
                                ].includes(this.copyScheme.type) && !this.disablePlusBrother
                                    ? <i
                                        class="bk-drag-icon bk-drag-add-fill layout-icon"
                                    ></i>
                                    : ''
                            }
                            <div slot="content">
                                {
                                    !this.disablePlusBrother
                                        ? <bk-button
                                            class="property-icon"
                                            text
                                            onClick={this.handlePlusBrotherProperty}
                                        >
                                            { this.$t('添加同级参数') }
                                        </bk-button>
                                        : ''
                                }
                                {
                                    [
                                        API_PARAM_TYPES.OBJECT.VAL,
                                        API_PARAM_TYPES.ARRAY.VAL
                                    ].includes(this.copyScheme.type)
                                        ? <bk-button
                                            class="property-icon"
                                            text
                                            onClick={this.plusChildProperty}
                                        >
                                            { this.$t('添加子参数') }
                                        </bk-button>
                                        : ''
                                }
                            </div>
                        </bk-popover>
                        <i
                            class={
                                [
                                    'bk-drag-icon bk-drag-reduce-fill layout-icon',
                                    {
                                        disabled: this.minusDisable
                                    }
                                ]
                            }
                            onClick={this.handleMinusProperty}
                        ></i>
                    </span>
                </section>
                {
                    this.copyScheme.showChildren
                        ? this.copyScheme.children.map((property, index) =>
                            <single-scheme
                                class="pl20"
                                key={property.id}
                                ref={'childComponentRef' + index}
                                scheme={property}
                                parent={this.copyScheme}
                                hideRequired={this.hideRequired}
                                renderSlot={this.renderSlot}
                                nameOptions={this.nameOptions}
                                brothers={this.copyScheme.children}
                                variableList={this.variableList}
                                functionList={this.functionList}
                                apiList={this.apiList}
                                showRule={this.showRule}
                                onUpdate={this.triggerChange}
                                onPlusBrotherNode={this.plusChildProperty}
                                onMinusNode={() => this.minusProperty(index)}
                            >
                            </single-scheme>
                        )
                        : ''
                }
            </section>
        )
    }
})
