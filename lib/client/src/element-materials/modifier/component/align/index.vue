<template>
    <div
        v-if="isShow"
        :class="$style['layout']">
        <div :class="$style['title']">
            布局
            <span
                :class="$style['resize']"
                v-bk-tooltips.top="'重置布局'"
                @click="handleReset">
                <i class="bk-drag-icon bk-drag-undo" />
            </span>
        </div>
        <div
            :class="{
                [$style['container']]: true,
                [$style['inner-free-layout']]: isInnerFreeLayout
            }">
            <div :class="$style['row']">
                <div
                    :class="{
                        [$style['item']]: true,
                        [$style['is-actived']]: renderAlign.horizontal === 'align-horizontal-left'
                    }"
                    v-bk-tooltips.top="'水平居左'"
                    @click="handleHorizontalChange('align-horizontal-left')">
                    <i class="bk-drag-icon bk-drag-1_zuoduiqi" />
                </div>
                <div
                    :class="{
                        [$style['item']]: true,
                        [$style['is-actived']]: renderAlign.horizontal === 'align-horizontal-center'
                    }"
                    v-bk-tooltips.top="'水平居中'"
                    @click="handleHorizontalChange('align-horizontal-center')">
                    <i class="bk-drag-icon bk-drag-shuipingjuzhong" />
                </div>
                <div
                    :class="{
                        [$style['item']]: true,
                        [$style['is-actived']]: renderAlign.horizontal === 'align-horizontal-right'
                    }"
                    v-bk-tooltips.top="'水平居右'"
                    @click="handleHorizontalChange('align-horizontal-right')">
                    <i class="bk-drag-icon bk-drag-1_youduiqi" />
                </div>
                <div
                    v-if="!isInnerFreeLayout"
                    :class="{
                        [$style['item']]: true,
                        [$style['is-actived']]: renderAlign.horizontal === 'align-horizontal-space-between'
                    }"
                    v-bk-tooltips.top="'水平均分'"
                    @click="handleHorizontalChange('align-horizontal-space-between')">
                    <i class="bk-drag-icon bk-drag-shuipingjunfen" />
                </div>
            </div>
            <div :class="$style['row']">
                <div
                    :class="{
                        [$style['item']]: true,
                        [$style['is-actived']]: renderAlign.vertical === 'align-vertical-top'
                    }"
                    v-bk-tooltips.bottom="'顶部对齐'"
                    @click="handleVerticalChange('align-vertical-top')">
                    <i class="bk-drag-icon bk-drag-1_dingduiqi" />
                </div>
                <div
                    :class="{
                        [$style['item']]: true,
                        [$style['is-actived']]: renderAlign.vertical === 'align-vertical-center'
                    }"
                    v-bk-tooltips.bottom="'垂直居中'"
                    @click="handleVerticalChange('align-vertical-center')">
                    <i class="bk-drag-icon bk-drag-1_juzhongduiqi" />
                </div>
                <div
                    :class="{
                        [$style['item']]: true,
                        [$style['is-actived']]: renderAlign.vertical === 'align-vertical-bottom'
                    }"
                    v-bk-tooltips.bottom="'底部对齐'"
                    @click="handleVerticalChange('align-vertical-bottom')">
                    <i class="bk-drag-icon bk-drag-1_diduiqi" />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import LC from '@/element-materials/core'
    import { isFreeLayoutProperty } from '@/element-materials/core/helper/utils.js'

    export default {
        data () {
            return {
                isShow: false,
                renderAlign: {
                    horizontal: '',
                    vertical: ''
                }
            }
        },
        created () {
            this.componentNode = LC.getActiveNode()

            // 在 render-column 和 render-block 中的组件要实现对齐，需要操作容器组件
            // 在 free-layout 中的组件要实现对齐，操作组件本身
            if (!['render-column', 'render-block'].includes(this.componentNode.type)
                && !isFreeLayoutProperty(this.componentNode.parentNode.type)) {
                this.isShow = false
                return
            }

            this.isInnerFreeLayout = isFreeLayoutProperty(this.componentNode.parentNode.type)

            this.isShow = true
            this.renderAlign = Object.assign({}, this.componentNode.align)
        },
        methods: {
            handleReset () {
                this.componentNode.setAlign({
                    'horizontal': '',
                    'vertical': ''
                })
                this.renderAlign = {
                    horizontal: '',
                    vertical: ''
                }
            },
            handleHorizontalChange (align) {
                if (align === this.renderAlign.horizontal) {
                    this.componentNode.setAlign('horizontal', '')
                    this.renderAlign['horizontal'] = ''
                } else {
                    this.componentNode.setAlign('horizontal', align)
                    this.renderAlign['horizontal'] = align

                    // 设置水平方向排版
                    if (this.isInnerFreeLayout) {
                        // 重置自由布局中的组件位置
                        this.componentNode.setStyle({
                            right: '',
                            bottom: '',
                            left: 0
                        })
                    } else {
                        const children = this.componentNode.children
                        const childNums = children.length
                        if (childNums > 0) {
                            const firstChildren = children[0]
                            // 重置第一个组件的 margin-left
                            if (firstChildren) {
                                firstChildren.setStyle({
                                    marginLeft: ''
                                })
                            }
                            // 组件数大于 1 时，重置最后一个组件的 margin-right
                            if (childNums > 1) {
                                children[childNums - 1].setStyle({
                                    marginRight: ''
                                })
                            }
                        }
                    }
                }
            },
            handleVerticalChange (align) {
                if (align === this.renderAlign.vertical) {
                    this.componentNode.setAlign('vertical', '')
                    this.renderAlign['vertical'] = ''
                } else {
                    this.componentNode.setAlign('vertical', align)
                    this.renderAlign['vertical'] = align

                    // 重置水平方向排版样式
                    if (this.isInnerFreeLayout) {
                        // 重置自由布局中的组件位置
                        this.componentNode.setStyle({
                            top: 0,
                            right: '',
                            bottom: ''
                        })
                    } else {
                        // 重置所有子组件的 margin-top，margin-bottom
                        this.componentNode.children.forEach(childNode => {
                            childNode.setStyle({
                                marginTop: '',
                                marginBottom: ''
                            })
                        })
                    }
                }
            }
        }
    }
</script>
<style lang="postcss" module>
    .layout{
        padding: 0px 10px 16px;
    }
    .title{
        font-size: 12px;
        height: 40px;
        line-height: 40px;
        font-weight: bold;
        color: #313238;
    }
    .resize{
        height: 20px;
        cursor: pointer;
        font-size: 16px;
        line-height: 18px;
        margin-left: 10px;
    }
    .container{
        display: grid;
        border-radius: 2px;
        margin-top: 4px;
    }
    .inner-free-layout{
        .item{
            flex: 1 !important;
        }
    }
    .row{
        display: flex;
        .item{
            flex: 0 0 66px;
            height: 36px;
            line-height: 36px;
            text-align: center;
            cursor: pointer;
            border: 1px solid #c4c6cc;
            &:nth-child(n+2){
                border-left: none;
            }
            &.is-actived{
                color: #3A84FF;
            }
        }
        &:nth-child(n + 2){
            .item{
                border-top: none;
            }
        }
    }
</style>
