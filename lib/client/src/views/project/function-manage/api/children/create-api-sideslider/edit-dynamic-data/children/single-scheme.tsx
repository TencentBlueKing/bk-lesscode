import {
    getDefaultApiParamEditScheme,
    API_PARAM_TYPES
} from 'shared/api'
import './edit-dynamic.css'

const SingleSchemeComponent = ({ props, data }) => {
    const scheme = props.scheme
    const disable = props.disable || scheme.disable
    const typeDisable = props.typeDisable
    // 切换是否展示子节点
    const toggleShowProperty = () => {
        scheme.showProperty = !scheme.showProperty
        triggleChange()
    }
    // 增加子节点
    const plusChildProperty = () => {
        scheme.properties.push(getDefaultApiParamEditScheme({
            parent: scheme
        }))
        triggleChange()
    }
    // 增加兄弟节点
    const plusBrotherProperty = () => {
        scheme.parent?.properties?.push(getDefaultApiParamEditScheme({
            parent: scheme.parent
        }))
        triggleChange()
    }
    // 删除子节点
    const minusProperty = () => {
        const index = scheme.parent?.properties?.findIndex(property => scheme === property)
        scheme.parent?.properties?.splice(index, 1)
        triggleChange()
    }
    // 更新类型
    const updateType = (type) => {
        // update properties
        scheme.properties.splice(0, scheme.properties.length)
        if (type === API_PARAM_TYPES.ARRAY.VAL) {
            scheme.properties.push(getDefaultApiParamEditScheme({
                name: 'array-item',
                description: '数组每个元素的模型',
                type: API_PARAM_TYPES.OBJECT.VAL,
                disable: true,
                parent: scheme
            }))
        }
        // update default & type
        Object.keys(API_PARAM_TYPES).forEach((paramTypeKey) => {
            const paramType = API_PARAM_TYPES[paramTypeKey]
            if (paramType.VAL === type) {
                scheme.type = paramType.VAL
                scheme.default = paramType.DEFAULT
            }
        })
        triggleChange()
    }
    // 更新值
    const update = (val) => {
        Object.assign(scheme, val)
        triggleChange()
    }
    // 触发值更新
    const triggleChange = () => {
        data.on?.update(scheme)
    }
    return (
        <section class={data.class}>
            <section class="object-layout">
                <i
                    class={
                        [
                            'bk-icon icon-down-shape layout-icon',
                            {
                                close: !scheme.showProperty,
                                hidden: [
                                    API_PARAM_TYPES.BOOLEAN.VAL,
                                    API_PARAM_TYPES.NUMBER.VAL,
                                    API_PARAM_TYPES.STRING.VAL
                                ].includes(scheme.type)
                            }
                        ]
                    }
                    onClick={toggleShowProperty}
                ></i>
                <bk-input
                    class="layout-flex"
                    value={scheme.name}
                    disabled={disable}
                    onChange={(name) => update({ name })}
                >
                </bk-input>
                <bk-checkbox
                    class="layout-small"
                    value={scheme.required}
                    disabled={disable}
                    onChange={(required) => update({ required })}
                >
                </bk-checkbox>
                <bk-select
                    class="layout-item"
                    value={scheme.type}
                    clearable={false}
                    disabled={typeDisable}
                    onChange={updateType}
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
                    scheme.type === API_PARAM_TYPES.BOOLEAN.VAL
                        ? <bk-checkbox
                            class="layout-item"
                            value={scheme.default}
                            disabled={disable}
                            onChange={(val) => update({ default: val })}
                        >
                        </bk-checkbox>
                        : <bk-input
                            class="layout-item"
                            value={scheme.default}
                            disabled={disable}
                            onChange={(val) => update({ default: val })}
                        >
                        </bk-input>
                }
                <bk-input
                    class="layout-item"
                    value={scheme.description}
                    disabled={disable}
                    onChange={(description) => update({ description })}
                >
                </bk-input>
                <bk-popover
                    class="layout-icon"
                    placement="top"
                    theme="light"
                >
                    {
                        scheme.type === API_PARAM_TYPES.ARRAY.VAL
                        || (scheme.parent
                            && scheme.parent.type === API_PARAM_TYPES.ARRAY.VAL
                            && scheme.type !== API_PARAM_TYPES.OBJECT.VAL)
                        || (!scheme.parent && scheme.type !== API_PARAM_TYPES.OBJECT.VAL)
                            ? ''
                            : <i
                                class="bk-icon icon-plus-circle layout-icon"
                            ></i>
                    }
                    <div slot="content" style="white-space: normal;">
                        {
                            scheme.parent && scheme.parent.type !== API_PARAM_TYPES.ARRAY.VAL
                                ? <bk-button
                                    class="property-icon"
                                    text
                                    onClick={plusBrotherProperty}
                                >
                                添加兄弟节点
                                </bk-button>
                                : ''
                        }
                        {
                            scheme.type === API_PARAM_TYPES.OBJECT.VAL
                                ? <bk-button
                                    class="property-icon"
                                    text
                                    onClick={plusChildProperty}
                                >
                                添加子节点
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
                                hidden: disable
                            }
                        ]
                    }
                    onClick={minusProperty}
                ></i>
            </section>
            {
                scheme.showProperty
                    ? scheme.properties.map((property) =>
                        <SingleSchemeComponent
                            class="pl20"
                            scheme={property}
                            onUpdate={triggleChange}
                        />
                    )
                    : ''
            }
        </section>
    )
}

export default SingleSchemeComponent
