<template>
    <div :class="$style['top-wrapper']">
        <bk-alert v-if="(isTips && operation === 'edit')" type="info"
            :title="$t('本页面包含交互式组件，可在页面组件树中查找并选中编辑')"
            @close="handlerClose"
            closable></bk-alert>
        <div
            ref="root"
            id="lesscodeDrawHorizontalWrapper"
            :class="$style['horizontal-wrapper']">
            <div
                id="lesscodeDrawVerticalWrapper"
                :class="$style['vertical-wrapper']">
                <render
                    v-show="operation === 'edit'"
                    :style="renderStyles" />
                <component
                    v-if="operation !== 'edit'"
                    :is="com"
                    v-bind="$attrs"
                    :style="oprationItemStyles" />
            </div>
        </div>
    </div>
</template>
<script>
    import _ from 'lodash'
    import { getOffset } from '@/common/util'
    import Render from '@/components/render/index'
    import SourceCode from './components/source-code.vue'
    import PageSetting from './components/page-setting'
    import PageJson from './components/page-json'
    import PageVariable from './components/page-variable'
    import PageFunction from './components/page-function'
    import LC from '@/element-materials/core'

    export default {
        name: '',
        components: {
            Render
        },
        props: {
            /**
             * @value render
             * @value vueCode
             * @value pageFunction
             * @value setting
             * @value jsonSource
             * @value pageVariable
             */
            operation: {
                type: String,
                required: true
            }
        },
        data () {
            return {
                renderStyles: {},
                oprationItemStyles: {
                    height: `calc(100vh - ${top}px - 20px)`
                },
                arrJson: []
            }
        },
        computed: {
            com () {
                const comMap = {
                    vueCode: SourceCode,
                    pageFunction: PageFunction,
                    setting: PageSetting,
                    jsonSource: PageJson,
                    pageVariable: PageVariable
                }
                return comMap[this.operation]
            },
            isTips () {
                this.arrJson = LC.getRoot()
                const interactivePageId = JSON.parse(localStorage.getItem('interactivePageTips')) || []
                if ((this.arrJson.toJSON()?.renderSlots?.default || []).filter(item => item.interactive).length > 0
                    && interactivePageId.indexOf(this.pageId) === -1) {
                    return true
                } else {
                    return false
                }
            },
            pageId () {
                return (`${this.$route.params.projectId}-${this.$route.params.pageId}`)
            }
        },
        mounted () {
            this.calcOperationItemStyles()
            this.calcRenderStyles()
            const resizeObserverCallback = _.throttle(() => {
                this.calcRenderStyles()
            }, 100)

            const activeResizeObserver = new ResizeObserver(resizeObserverCallback)
            activeResizeObserver.observe(this.$refs.root)
            this.$once('hook:beforeDestroy', () => {
                activeResizeObserver.unobserve(this.$refs.root)
            })
        },
        methods: {
            calcRenderStyles () {
                const {
                    top
                } = getOffset(this.$refs.root)
                
                const {
                    width
                } = this.$refs.root.getBoundingClientRect()
                
                this.renderStyles = {
                    width: `${width - 40}px`,
                    'min-height': `calc(100vh - ${top + 25}px)`
                }
            },
            calcOperationItemStyles () {
                const {
                    top
                } = getOffset(this.$refs.root)
                
                this.oprationItemStyles = {
                    'height': `calc(100vh - ${top + 20}px)`
                }
            },
            handlerClose () {
                const pageTipIdList = JSON.parse(localStorage.getItem('interactivePageTips')) || []
                pageTipIdList.push(this.pageId)
                const pageTipId = JSON.stringify(pageTipIdList)
                localStorage.setItem('interactivePageTips', pageTipId)
            }
        }
    }
</script>
<style lang="postcss" module>
    @import "@/css/mixins/scroller";

    .top-wrapper{
        height: 100%;
    }
    .horizontal-wrapper{
        background: #fff;
        background-clip: content-box;
        position: relative;
        margin: 0 20px 20px;
        padding-top: 20px;
        height: 100%;
        overflow: auto;
        @mixin scroller;
    }
    .vertical-wrapper{
        background: #fff;
    }
</style>
