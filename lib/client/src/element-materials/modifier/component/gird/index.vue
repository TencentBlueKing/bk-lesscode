<template>
    <div v-if="isShow && isSearch" class="modifier-grid">
        <style-layout :title="$t('列宽度配置')"
            :tips="`<p>${$t('每一列栅格宽度占比为')}</p><p>${$t('该列配置值占总列配置值的百分比')}</p><p>${$t('如总共有3列，值分别为1，2，1')}</p><p>${$t('则这三列的宽度分别为整行宽度的1/4，1/2，1/4')}</p>`">
            <div class="column-list">
                <div
                    v-for="(columnNode, index) in columnList"
                    class="column-item"
                    :key="columnNode.componentId">
                    <span class="column-item-text">{{$t('第 {0} 列',[index + 1])}}</span>
                    <div class="bk-form-control" style="width: 100%;">
                        <div class="bk-input-number">
                            <input type="text"
                                maxlength="10"
                                style="width: 100%"
                                class="bk-form-input"
                                @keydown="inputKeydownHandler($event)"
                                :value="columnNode.prop.span"
                                @input="e => handleSpanChange(e, columnNode)" />
                            <span class="input-number-option">
                                <span class="number-option-item bk-icon icon-angle-up" @click="() => add(columnNode.prop.span, columnNode)"></span>
                                <span class="number-option-item bk-icon icon-angle-down" @click="() => sub(columnNode.prop.span, columnNode)"></span>
                            </span>
                        </div>
                    </div>
                    <i class="bk-icon icon-minus-circle" @click="handleDelete(columnNode)" />
                </div>
            </div>
            <div
                v-show="columnList.length <= 11"
                class="column-add"
                @click="handleAdd">
                <span>{{$t('添加')}}</span>
                <i class="bk-icon icon-plus-circle" />
            </div>
        </style-layout>
    </div>
</template>
<script>
    import LC from '@/element-materials/core'
    import StyleLayout from '@/element-materials/modifier/component/styles/layout/index'
    import { accAdd, accSub } from '@/common/util'
    import { encodeRegexp } from '../../component/utils'

    export default {
        name: '',
        components: {
            StyleLayout
        },
        props: {
            keyword: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                isShow: false,
                columnList: [],
                // 数字输入框中允许输入的键盘按钮的 keyCode 集合
                validKeyCodeList: [
                    48, 49, 50, 51, 52, 53, 54, 55, 56, 57, // 0-9
                    8, // backspace
                    // 189, // -
                    // 190, // .
                    38, 40, 37, 39, // up down left right
                    46, // del
                    9, // tab
                    96, 97, 98, 99, 100, 101, 102, 103, 104, 105, // 小键盘0-9
                    109, 110 // 小键盘 - .
                ]
            }
        },
        computed: {
            isSearch () {
                const res = new RegExp(encodeRegexp(this.keyword), 'i')
                return res.test(window.i18n.t('列宽度配置'))
            }
        },
        created () {
            this.componentNode = LC.getActiveNode()
            this.isShow = this.componentNode.type === 'render-grid'
            this.columnList = Object.freeze([...this.componentNode.children])

            const updateCallback = (event) => {
                if (this.componentNode.componentId === event.target.componentId
                    || (
                        event.target.parentNode
                        && event.target.parentNode.componentId === this.componentNode.componentId
                    )) {
                    this.columnList = Object.freeze([...this.componentNode.children])
                    this.$forceUpdate()
                }
            }

            LC.addEventListener('update', updateCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('update', updateCallback)
            })
        },
        methods: {
            handleSpanChange (e, columnNode) {
                const target = e.currentTarget
                const value = target.value
                columnNode.setProp('span', LC.utils.genPropFormatValue({
                    format: 'value',
                    code: parseInt(value, 10),
                    renderValue: parseInt(value, 10)
                }))
            },
            handleDelete (columnNode) {
                this.componentNode.removeChild(columnNode)
            },
            handleAdd () {
                const newColumnNode = LC.createNode('render-column')
                this.componentNode.appendChild(newColumnNode)
            },

            /**
             * 数字文本框获 keydown 事件回调
             * input type=number 不支持 setSelectionRange
             *
             * @param {Object} e 事件对象
             */
            inputKeydownHandler (e) {
                const keyCode = e.keyCode
                // 键盘按下不允许的按钮
                if (this.validKeyCodeList.indexOf(keyCode) < 0) {
                    e.stopPropagation()
                    e.preventDefault()
                    return false
                }
            },

            add (span, columnNode) {
                const value = accAdd(parseInt(span, 10), 1)
                columnNode.setProp('span', LC.utils.genPropFormatValue({
                    format: 'value',
                    code: parseInt(value, 10),
                    renderValue: parseInt(value, 10)
                }))
            },

            sub (span, columnNode) {
                console.error(2, span)
                if (parseFloat(span) <= 0) {
                    return
                }
                const value = accSub(parseInt(span, 10), 1)
                columnNode.setProp('span', LC.utils.genPropFormatValue({
                    format: 'value',
                    code: parseInt(value, 10),
                    renderValue: parseInt(value, 10)
                }))
            }
        }
    }
</script>
<style lang="postcss">
    .modifier-grid {
        .column-title {
            display: flex;
            align-items: center;
            height: 40px;
            font-size: 12px;
            font-weight: bold;
            color: #606266;
            .label {
                border-bottom: 1px dashed #979ba5;
                cursor: pointer;
            }
        }
        .column-list {
            display: flex;
            flex-direction: column;
            font-size: 12px;
            .column-item {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
                .column-item-text {
                    flex-shrink: 0;
                    width: 95px;
                }
                .icon-minus-circle {
                    margin: 0 0 0 8px;
                    cursor: pointer;
                    font-size: 16px;
                    &:hover {
                        color: #3a84ff
                    }
                }
            }
        }
        .column-add {
            text-align: right;
            font-size: 12px;
            cursor: pointer;
            color: #3a84ff;
            .icon-plus-circle {
                font-size: 16px;
                margin-left: 4px;
            }
        }
    }
</style>
