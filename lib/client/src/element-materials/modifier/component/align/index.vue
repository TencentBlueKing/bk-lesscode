<template>
    <style-layout :title="$t('布局')" v-if="isShow">
        <i slot="header" class="bk-drag-icon bk-drag-undo-2" @click.stop="handleReset" v-bk-tooltips="{ content: $t('重置布局') }"></i>
        <div style="display: flex;">
            <select-tab :style=" { 'margin-right': '8px', width: '134px' }" :tab-list="horizontalList" :active-item="renderAlign.horizontal" :item-change="(val) => handleHorizontalChange(val)" />
            <select-tab style="width: 134px" :tab-list="verticalList" :active-item="renderAlign.vertical" :item-change="(val) => handleVerticalChange(val)" />
        </div>
    </style-layout>
</template>
<script>
    import LC from '@/element-materials/core'
    import { isFreeLayoutProperty } from '@/element-materials/core/helper/utils.js'
    import SelectTab from '@/components/ui/select-tab'
    import StyleLayout from '../styles/layout/index'

    export default {
        components: {
            StyleLayout,
            SelectTab
        },
        data () {
            return {
                isShow: false,
                renderAlign: {
                    horizontal: '',
                    vertical: ''
                },
                verticalList: [
                    {
                        id: 'align-vertical-top',
                        icon: 'bk-drag-icon bk-drag-1_dingduiqi',
                        tips: this.$t('顶部对齐')
                    },
                    {
                        id: 'align-vertical-center',
                        icon: 'bk-drag-icon bk-drag-1_juzhongduiqi',
                        tips: this.$t('垂直居中')
                    },
                    {
                        id: 'align-vertical-bottom',
                        icon: 'bk-drag-icon bk-drag-1_diduiqi',
                        tips: this.$t('底部对齐')
                    }
                ]
            }
        },
        computed: {
            horizontalList () {
                const renderList = [
                    {
                        id: 'align-horizontal-left',
                        icon: 'bk-drag-icon bk-drag-1_zuoduiqi',
                        tips: this.$t('水平居左')
                    },
                    {
                        id: 'align-horizontal-center',
                        icon: 'bk-drag-icon bk-drag-shuipingjuzhong',
                        tips: this.$t('水平居中')
                    },
                    {
                        id: 'align-horizontal-right',
                        icon: 'bk-drag-icon bk-drag-1_youduiqi',
                        tips: this.$t('水平居右')
                    }
                ]
                if (!this.isInnerFreeLayout) {
                    renderList.push({
                        id: 'align-horizontal-space-between',
                        icon: 'bk-drag-icon bk-drag-shuipingjunfen',
                        tips: this.$t('水平均分')
                    })
                }
                return renderList
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
