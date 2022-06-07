<script>
    import {
        defineComponent,
        ref,
        watch
    } from '@vue/composition-api'
    import {
        getDefaultApiParamEditScheme,
        API_PARAM_TYPES
    } from 'shared/api'

    export default defineComponent({
        props: {
            scheme: Object,
            disableEditRoot: Boolean
        },

        setup (props, { emit }) {
            const editScheme = ref({})

            const handleUpdate = (scheme) => {
                editScheme.value = scheme
                emit('change', scheme)
            }

            watch(
                () => props.scheme,
                () => {
                    editScheme.value = props.scheme
                },
                {
                    immediate: true
                }
            )

            return {
                editScheme,
                handleUpdate
            }
        },

        render () {
            const SingleSchemeComponent = ({ props, data }) => {
                const scheme = props.scheme
                const disable = props.disable || scheme.disable
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
                                disabled={disable}
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
                                <i
                                    class="bk-icon icon-plus-circle layout-icon"
                                ></i>
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

            return (
                <section>
                    <section class="object-layout">
                        <span class="layout-icon"></span>
                        <span class="layout-flex">属性名 (必填)</span>
                        <span class="layout-small">是否必填</span>
                        <span class="layout-item">类型</span>
                        <span class="layout-item">默认值</span>
                        <span class="layout-item">备注</span>
                        <span class="layout-icon"></span>
                        <span class="layout-icon"></span>
                    </section>
                    <SingleSchemeComponent
                        scheme={this.editScheme}
                        onUpdate={this.handleUpdate}
                        disable={this.disableEditRoot}
                    />
                </section>
            )
        }
    })
</script>

<style lang="postcss" scoped>
    .object-layout {
        margin-top: 12px;
        display: flex;
        font-size: 12px;
        .layout-flex {
            flex: 1;
            margin-right: 10px;
        }
        .layout-item {
            width: 200px;
            margin-right: 10px;
        }
        .layout-small {
            min-width: 80px;
            margin-right: 10px;
        }
        .layout-icon {
            color: #979BA5;
            line-height: 32px;
            min-width: 20px;
            cursor: pointer;
            &.close {
                transform: rotate(-90deg);
            }
            &.hidden {
                visibility: hidden;
            }
            &.icon-plus-circle, &.icon-minus-circle {
                font-size: 14px;
            }
            &.icon-down-shape {
                margin-right: 4px;
            }
        }
    }
    .pl20 {
        padding-left: 20px;
    }
    .property-icon {
        display: block;
        font-size: 12px;
        color: #63656e;
        &:hover {
            color: #3a84ff;
        }
    }
</style>
