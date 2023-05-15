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

const SingleSchemeComponent = defineComponent({
    props: {
        scheme: Object,
        disable: Boolean,
        typeDisable: Boolean,
        minusDisable: Boolean,
        plusBrotherDisable: Boolean,
        renderSlot: Function,
        hideRequired: Boolean
    },

    setup (props, { emit }) {
        const copyScheme = toRef(props, 'scheme')
        const finalDisable = props.disable || copyScheme.value.disable
        const finalTypeDisable = props.typeDisable || finalDisable
        const disablePlusBrother = props.plusBrotherDisable || copyScheme.value.plusBrotherDisable
        const formRef = ref(null)
        const currentInstance = getCurrentInstance()
        // 校验规则
        const requireRule = {
            validator (val) {
                return val.length >= 1 || props.minusDisable
            },
            message: window.i18n.t('参数名是必填项，请修改后重试'),
            trigger: 'blur'
        }
        // 切换是否展示子节点
        const toggleShowProperty = () => {
            copyScheme.value.showChildren = !copyScheme.value.showChildren
            triggleChange()
        }
        // 增加子节点
        const plusChildProperty = () => {
            if (copyScheme.value.valueType) {
                copyScheme.value.children.push(getDefaultApiUseScheme())
            } else {
                copyScheme.value.children.push(getDefaultApiEditScheme())
            }
            triggleChange()
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
            triggleChange()
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
            triggleChange()
        }
        // 更新值
        const update = (val) => {
            Object.assign(copyScheme.value, val)
            triggleChange()
        }
        // 触发值更新
        const triggleChange = () => {
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
            triggleChange,
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
                            rules={[this.requireRule]}
                            property="name"
                            error-display-type="tooltips"
                        >
                            <bk-input
                                value={this.copyScheme.name}
                                disabled={this.finalDisable}
                                onInput={(name) => this.update({ name })}
                            >
                            </bk-input>
                        </bk-form-item>
                    </bk-form>
                    {
                        this.hideRequired
                            ? ''
                            : <bk-checkbox
                                class="layout-small"
                                value={this.copyScheme.required}
                                disabled={this.finalDisable}
                                onChange={(required) => this.update({ required })}
                            >
                            </bk-checkbox>
                    }
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
                    <section
                        class="layout-item layout-flex-center"
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
                                        value={this.copyScheme.value}
                                        disabled={this.finalDisable}
                                        onChange={(val) => this.update({ value: val })}
                                    >
                                    </bk-input>
                        
                        }
                    </section>
                    <bk-input
                        class="layout-middle"
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
                            <SingleSchemeComponent
                                class="pl20"
                                key={property.id}
                                ref={'childComponentRef' + index}
                                scheme={property}
                                hideRequired={this.hideRequired}
                                renderSlot={this.renderSlot}
                                onUpdate={this.triggleChange}
                                onPlusBrotherNode={this.plusChildProperty}
                                onMinusNode={() => this.minusProperty(index)}
                            >
                            </SingleSchemeComponent>
                        )
                        : ''
                }
            </section>
        )
    }
})

export default SingleSchemeComponent
