<template>
    <section v-if="isShow && isSearch" class="modifier-tab">
        <div class="slot-title">{{ $t('tab选项配置：') }}</div>
        <vue-draggable
            class="group-list"
            handle=".bk-drag-grag-fill"
            :list="panelItems"
            :group="{ name: 'table-col', pull: false, put: false }"
            @change="handleSort">
            <bk-popover
                v-for="(item, index) in panelItems"
                class="list-item"
                :key="`option${index}`"
                placement="left-start"
                trigger="click"
                theme="light"
                ext-cls="g-popover-empty-padding"
                width="320"
            >
                <span
                    class="item-content"
                    v-bk-overflow-tips="{
                        content: item.prop.label,
                        placement: 'left-start',
                        width: 200,
                        boundary: 'window'
                    }"
                >
                    <i class="bk-drag-icon bk-drag-grag-fill" />
                    {{ item.prop.label }}
                </span>
                <i class="bk-icon icon-minus-circle" @click.stop="handleDelete(index)"></i>
                <section slot="content">
                    <section class="template-item-list">
                        <div
                            v-for="(option, idx) in panelPropsList"
                            class="template-item"
                            :key="idx"
                        >
                            <div class="label">{{option}}</div>
                            <bk-input
                                :value="item.prop[option]"
                                @change="val => handleItemChange(val, option, index)" />
                        </div>
                    </section>
                </section>
            </bk-popover>
        </vue-draggable>
        <span class="content-add" @click="handleAdd">
            <i class="bk-icon icon-plus-circle"></i>
            {{ $t('添加') }} </span>
    </section>
</template>

<script>
    import LC from '@/element-materials/core'
    import { encodeRegexp } from '../../component/utils'
    export default {
        props: {
            keyword: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                isShow: false,
                componentNode: null,
                panelItems: [],
                panelPropsList: ['label', 'name'],
                initOptionList: [
                    {
                        label: 'Tab-1',
                        name: 'tab1'
                    },
                    {
                        label: 'Tab-2',
                        name: 'tab2'
                    },
                    {
                        label: 'Tab-3',
                        name: 'tab3'
                    }
                ]
            }
        },
        computed: {
            isSearch () {
                const res = new RegExp(encodeRegexp(this.keyword), 'i')
                return res.test(window.i18n.t('tab选项配置：'))
            }
        },
        created () {
            this.componentNode = LC.getActiveNode()
            this.isShow = this.componentNode.type === 'widget-tab'
            if (!this.isShow) {
                return
            }

            if (!this.componentNode.renderSlots.default.length) {
                this.initTab()
            } else {
                this.panelItems = [...this.componentNode.children]
            }
            
            // const updateCallback = (event) => {
            //     if (this.componentNode.componentId === event.target.componentId) {
            //         this.$forceUpdate()
            //     }
            // }

            // LC.addEventListener('update', updateCallback)
            // this.$once('hook:beforeDestroy', () => {
            //     LC.removeEventListener('update', updateCallback)
            // })
        },
        methods: {
            createNewTabPanel (itemData) {
                const node = LC.createNode('bk-tab-panel')
            
                const propsValue = {}
                this.panelPropsList.forEach(propName => {
                    propsValue[propName] = LC.utils.genPropFormatValue({
                        format: 'value',
                        code: itemData[propName],
                        renderValue: itemData[propName]
                    })
                })
                node.setProp(propsValue)
                return node
            },
            initTab () {
                // 设置选项tab列表
                this.initOptionList.forEach(data => {
                    const child = this.createNewTabPanel(data)
                    this.componentNode.appendChild(child, 'default')
                })
                this.panelItems = [...this.componentNode.children]
                // 设置默认选中的tab
                const props = {
                    format: 'value',
                    code: 'tab1',
                    renderValue: 'tab1'
                }
                if (LC.getFramework() === 'vue3') {
                    props.directive = 'v-model'
                } else {
                    props.modifiers = ['sync']
                }
                this.componentNode.setProp({
                    active: LC.utils.genPropFormatValue(props)
                })
            },
            handleAdd () {
                const child = this.createNewTabPanel({
                    label: `Tab-${this.panelItems.length + 1}`,
                    name: `tab${this.panelItems.length + 1}`
                })
                this.componentNode.appendChild(child, 'default')
                this.panelItems = [...this.componentNode.children]
            },
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
                    // // 从原位置删除
                    this.componentNode.removeChild(element)
                    // // 插入新位置
                    this.componentNode.insertBefore(element, this.componentNode.children[newIndex])
                    this.panelItems = [...this.componentNode.children]
                }
            },
            handleDelete (index) {
                this.componentNode.removeChild(this.componentNode.children[index])
                this.panelItems = [...this.componentNode.children]
            },
            handleItemChange (val, key, index) {
                const editPanelNode = this.componentNode.children[index]
                const propsValue = {}
                propsValue[key] = LC.utils.genPropFormatValue({
                    format: 'value',
                    code: val,
                    renderValue: val
                })
                editPanelNode.setProp(propsValue)
            }
        }
    }
</script>

<style lang="postcss" scroped>
    .modifier-tab {
        padding: 0 10px;
        margin: 10px 0 16px;
        .slot-title {
            font-size: 12px;
            font-weight: bold;
            color: #313238;
            line-height: 18px;
        }
    }
    .group-list {
        margin-top: 4px;
        .list-item {
            line-height: 32px;
            margin-bottom: 8px;
            font-size: 12px;
            display: block;
            .item-content {
                background: #F5F7FA;
                border-radius: 2px;
                height: 32px;
                display: inline-block;
                width: calc(100% - 26px);
                padding: 0 8px;
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                &:hover {
                    background: #EAEBF0;
                }
            }
            .icon-minus-circle {
                cursor: pointer;
                margin-left: 6px;
                color: #979ba5;
                font-size: 14px;
                &:hover {
                    color: #63656e;
                }
            }
            .bk-tooltip-ref {
                display: flex;
                align-items: center;
            }
        }
    }
    .content-add {
        color: #3A84FF;
        cursor: pointer;
        font-size: 12px;
    }
    .template-item-list {
        padding: 10px 16px 16px;
    }
    .template-item {
        margin-top: 12px;
        &:first-child {
            margin-top: 0;
        }
        .label {
            font-size: 12px;
            line-height: 20px;
            margin-bottom: 6px;
        }
    }
</style>
