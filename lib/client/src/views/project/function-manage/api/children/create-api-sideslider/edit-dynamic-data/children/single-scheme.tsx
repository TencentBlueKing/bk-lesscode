import {
    getDefaultApiParamEditScheme,
    API_PARAM_TYPES
} from 'shared/api'
import './edit-dynamic.css'
import {
    defineComponent,
    toRef,
    ref,
    getCurrentInstance
} from '@vue/composition-api'

const requireRule = {
    required: true,
    message: '参数名是必填项，请修改后重试',
    trigger: 'blur'
}

const SingleSchemeComponent = defineComponent({
    props: {
        scheme: Object,
        disable: Boolean,
        typeDisable: Boolean,
        minusDisable: Boolean
    },

    setup (props, { emit }) {
        const copyScheme = toRef(props, 'scheme')
        const finalDisable = props.disable || copyScheme.value.disable
        const finalTypeDisable = props.typeDisable
        const formRef = ref(null)
        const currentInstance = getCurrentInstance()

        // 切换是否展示子节点
        const toggleShowProperty = () => {
            copyScheme.value.showProperty = !copyScheme.value.showProperty
            triggleChange()
        }
        // 增加子节点
        const plusChildProperty = () => {
            copyScheme.value.properties.push(getDefaultApiParamEditScheme())
            triggleChange()
        }
        // 增加兄弟节点
        const handlePlusBrotherProperty = () => {
            emit('plusBrotherNode')
        }
        const plusBrotherProperty = () => {
            copyScheme.value?.properties?.push(getDefaultApiParamEditScheme())
            triggleChange()
        }
        // 删除节点
        const handleMinusProperty = (index) => {
            emit('minusNode', index)
        }
        const minusProperty = (index) => {
            copyScheme.value?.properties?.splice(index, 1)
            triggleChange()
        }
        // 更新类型
        const updateType = (type) => {
            // update properties
            copyScheme.value.properties.splice(0, copyScheme.value.properties.length)
            if (type === API_PARAM_TYPES.ARRAY.VAL) {
                copyScheme.value.properties.push(getDefaultApiParamEditScheme({
                    name: 'items',
                    description: '数组每个元素的模型',
                    type: API_PARAM_TYPES.OBJECT.VAL,
                    disable: true
                }))
            }
            // update default & type
            Object.keys(API_PARAM_TYPES).forEach((paramTypeKey) => {
                const paramType = API_PARAM_TYPES[paramTypeKey]
                if (paramType.VAL === type) {
                    copyScheme.value.type = paramType.VAL
                    copyScheme.value.default = paramType.DEFAULT
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
                    ...Object.keys(childComponents)
                        .map(childComponentRef => (childComponents[childComponentRef] as any).validate())
                ])
        }

        return {
            requireRule,
            copyScheme,
            finalDisable,
            finalTypeDisable,
            formRef,
            toggleShowProperty,
            plusChildProperty,
            handlePlusBrotherProperty,
            plusBrotherProperty,
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
                <section class="object-layout">
                    <i
                        class={
                            [
                                'bk-icon icon-down-shape layout-icon',
                                {
                                    close: !this.copyScheme.showProperty,
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
                            error-display-type="normal"
                        >
                            <bk-input
                                value={this.copyScheme.name}
                                disabled={this.finalDisable}
                                onInput={(name) => this.update({ name })}
                            >
                            </bk-input>
                        </bk-form-item>
                    </bk-form>
                    <bk-checkbox
                        class="layout-small"
                        value={this.copyScheme.required}
                        disabled={this.finalDisable}
                        onChange={(required) => this.update({ required })}
                    >
                    </bk-checkbox>
                    <bk-select
                        class="layout-item"
                        value={this.copyScheme.type}
                        clearable={false}
                        disabled={this.finalTypeDisable}
                        onChange={this.updateType}
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
                    {
                        this.copyScheme.type === API_PARAM_TYPES.BOOLEAN.VAL
                            ? <bk-checkbox
                                class="layout-item"
                                value={this.copyScheme.default}
                                disabled={this.finalDisable}
                                onChange={(val) => this.update({ default: val })}
                            >
                            </bk-checkbox>
                            : <bk-input
                                class="layout-item"
                                value={this.copyScheme.default}
                                disabled={this.finalDisable}
                                onChange={(val) => this.update({ default: val })}
                            >
                            </bk-input>
                    }
                    <bk-input
                        class="layout-item"
                        value={this.copyScheme.description}
                        disabled={this.finalDisable}
                        onChange={(description) => this.update({ description })}
                    >
                    </bk-input>
                    <span class="layout-icons">
                        <bk-popover
                            placement="top"
                            theme="light"
                        >
                            {
                                this.copyScheme.type === API_PARAM_TYPES.OBJECT.VAL
                                && ['root', 'items'].includes(this.copyScheme.name)
                                    ? <i
                                        class="bk-icon icon-plus-circle layout-icon"
                                        onClick={this.plusChildProperty}
                                    ></i>
                                    : ''
                            }
                            {
                                [
                                    API_PARAM_TYPES.BOOLEAN.VAL,
                                    API_PARAM_TYPES.NUMBER.VAL,
                                    API_PARAM_TYPES.STRING.VAL
                                ].includes(this.copyScheme.type)
                                    ? <i
                                        class="bk-icon icon-plus-circle layout-icon"
                                        onClick={this.handlePlusBrotherProperty}
                                    ></i>
                                    : ''
                            }
                            {
                                this.copyScheme.type === API_PARAM_TYPES.OBJECT.VAL
                                && !['root', 'items'].includes(this.copyScheme.name)
                                    ? <i
                                        class="bk-icon icon-plus-circle layout-icon"
                                    ></i>
                                    : ''
                            }
                            <div slot="content">
                                {
                                    !['root', 'items'].includes(this.copyScheme.name)
                                        ? <bk-button
                                            class="property-icon"
                                            text
                                            onClick={this.handlePlusBrotherProperty}
                                        >
                                            添加参数
                                        </bk-button>
                                        : ''
                                }
                                {
                                    this.copyScheme.type === API_PARAM_TYPES.OBJECT.VAL
                                        ? <bk-button
                                            class="property-icon"
                                            text
                                            onClick={this.plusChildProperty}
                                        >
                                            添加属性
                                        </bk-button>
                                        : ''
                                }
                            </div>
                        </bk-popover>
                        <i
                            class={
                                [
                                    'bk-icon icon-minus-circle layout-icon',
                                    {
                                        hidden: this.minusDisable
                                    }
                                ]
                            }
                            onClick={this.handleMinusProperty}
                        ></i>
                    </span>
                </section>
                {
                    this.copyScheme.showProperty
                        ? this.copyScheme.properties.map((property, index) =>
                            <SingleSchemeComponent
                                class="pl20"
                                ref={'childComponentRef' + index}
                                scheme={property}
                                onUpdate={this.triggleChange}
                                onPlusBrotherNode={this.plusBrotherProperty}
                                onMinusNode={() => this.minusProperty(index)}
                            />
                        )
                        : ''
                }
            </section>
        )
    }
})

export default SingleSchemeComponent
