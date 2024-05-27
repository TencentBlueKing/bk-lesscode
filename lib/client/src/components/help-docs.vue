<template>
    <div v-if="visible" ref="helpDocs" class="help-docs" :style="popoverStyles">
        <!-- 头部 -->
        <div class="header" @mousedown.stop="bindResize('nesw', $event)">
            <div class="header-left">
                <div v-show="!isDocDetail">{{ $t('帮助文档') }}</div>
                <div v-show="isDocDetail" @click="backUpPage" class="header-detail-title">
                    <i class="bk-drag-icon bk-drag-arrow-back"></i>
                    {{ $t('文档详情') }}
                </div>
            </div>
            <div class="header-right">
                <div class="change-height">
                    <div v-show="!isFull" v-bk-tooltips.top="`${$t('全屏')}`">
                        <i class="bk-drag-icon bk-drag-filliscreen-line" @click="changeFull(true)"></i>
                    </div>
                    <div v-show="isFull" v-bk-tooltips.top="`${$t('退出全屏')}`">
                        <i class="bk-drag-icon bk-drag-un-full-screen-2" @click="changeFull(false)"></i>
                    </div>
                </div>
                <div class="change-height">
                    <div v-show="!isExtendHeight" v-bk-tooltips="`${$t('向下收缩')}`">
                        <i class="bk-drag-icon bk-drag-shangxiajuhe" @click="changeExtend(true)"></i>
                    </div>
                    <div v-show="isExtendHeight" v-bk-tooltips="`${$t('向上扩展')}`">
                        <i class="bk-drag-icon bk-drag-shangxialashen-2" @click="changeExtend(false)"></i>
                    </div>
                </div>
                <div v-bk-tooltips="`${$t('关闭')}`">
                    <i class="bk-drag-icon bk-drag-shanchu-2 close" @click="closeDocPopover"></i>
                </div>
            </div>
        </div>
        <!-- 文档分类主体 -->
        <div v-show="!isDocDetail" class="docs-category">
            <!-- 搜索框 -->
            <div class="search-space">
                <bk-input
                    clearable
                    :placeholder="$t('请搜索文档名称或概述')"
                    right-icon="bk-icon icon-search"
                    v-model="searchKey"
                    @change="searchDocs"
                    @right-icon-click="searchDocs">
                </bk-input>
            </div>
            <div class="content">
                <!-- 默认 展示某些模块 文档 -->
                <div v-show="!isSearching" class="module-docs">
                    <template v-for="(item, index) in moduleList">
                        <div :key="item.moduleName">
                            <div :class="{
                                'module-title': true,
                                'border-none': !isHasDocs(item.docsList)
                            }">
                                <div class="left">
                                    <i :class="item.iconClass"></i>
                                    {{ item.moduleName }}
                                </div>
                                <div class="right">
                                    <i v-if="typeof item.isShowModule === 'boolean' && !item.isShowModule" class="bk-icon icon-angle-up" @click="queryModule(true, index)"></i>
                                    <i v-else class="bk-drag-icon bk-drag-arrow-down" @click="queryModule(false, index)"></i>
                                </div>
                            </div>
                            <div ref="moduleRefs" v-if="!isHasDocs(item.docsList)" class="frame-img">
                                <bk-zoom-image :src="item.frameSrc" class="zoom-image"></bk-zoom-image>
                            </div>
                            <div ref="moduleRefs" v-else>
                                <div v-for="(doc) in item.docsList" :key="doc.name" class="doc">
                                    <div class="doc-name">{{ doc.name }}</div>
                                    <div class="doc-des">{{ doc.description }}</div>
                                    <div class="doc-operation" @click="getDocDetail(doc)">{{ $t('查看文档') }} ></div>
                                </div>
                            </div>
                        </div>
                    </template>
                </div>
                <!-- 搜索时 展示某些模块 文档 -->
                <div v-show="isSearching" class="search-docs">
                    <!-- 有内容时 展示 -->
                    <div v-if="searchDocList.length" class="search-content">
                        <div v-for="(item, index) in searchDocList" :key="`${item.name + index}`" :class="['search-doc', hoverCls(index)]" @mouseenter="getHoverIndex($event, index)" @click="getDocDetail(item)">
                            <div class="search-doc-name" v-html="item.name"></div>
                            <div class="search-doc-des" v-html="item.description"></div>
                        </div>
                    </div>
                    <!-- 无内容时 展示 -->
                    <div v-else class="empty-text">
                        <bk-exception type="search-empty" scene="part">
                            <div>{{ $t('搜索结果为空') }}</div>
                            <div>
                                {{ $t('可以尝试 调整关键词或') }}<span class="clear-condition">{{ $t('清空筛选条件') }}</span>
                            </div>
                        </bk-exception>
                    </div>
                </div>
            </div>
        </div>
        <!-- 文档详情主体 -->
        <div v-show="isDocDetail" class="docs-detail">
            <help-doc-detail :select-doc="docNameParam" :is-show-aside="isDisplaySort" detail-body-cls="detail-content" help-root-cls="detail-container" @pageSwitchMethod="pageSwitchMethod" />
        </div>
        <!-- 拖拽指针 -->
        <div class="drag-cursor">
            <span v-for="(item) in directions" :key="item" @mousedown.stop="bindResize(item, $event)" :class="[`${item}-resize`, cursorCom(item)]"></span>
        </div>
    </div>
</template>
<script>
    import { defineComponent, computed, ref, reactive, set, onBeforeMount, onBeforeUnmount } from '@vue/composition-api'
    import HelpDocDetail from '@/components/help-doc-detail'
    import frameImg from '../images/frame.png'
    export default defineComponent({
        name: 'help-docs',
        components: {
            HelpDocDetail
        },
        props: {
            visible: {
                type: Boolean,
                default: false
            }
        },
        emits: ['closePage'],
        setup (props, ctx) {
            // 页面放大与缩小
            const windowSize = {
                width: window.innerWidth,
                height: window.innerHeight
            }
            const limitSize = {
                min: {
                    width: 430,
                    height: 450
                },
                max: {
                    width: 1000,
                    height: windowSize.height
                }
            }
            const limitPos = {
                min: {
                    top: 0,
                    right: 0,
                    bottom: 0,
                    left: 0
                },
                max: {
                    top: windowSize.height - limitSize.min.height,
                    right: windowSize.width - limitSize.min.width,
                    bottom: windowSize.height - limitSize.min.height,
                    left: windowSize.width - limitSize.min.width
                }
            }
            const helpDocs = ref(null)
            const popoverTop = ref(limitPos.min.top)
            const popoverLeft = ref(limitPos.max.left)
            const popoverRight = ref(limitPos.min.right)
            const popoverBottom = ref(limitPos.min.bottom)
            const popoverStyles = computed(() => {
                return {
                    top: `${popoverTop.value}px`,
                    left: `${popoverLeft.value}px`,
                    right: `${popoverRight.value}px`,
                    bottom: `${popoverBottom.value}px`
                }
            })
            const isFull = ref(false)
            // true -> 全屏，否则 非全屏
            const changeFull = (boolVal) => {
                isFull.value = boolVal
                popoverTop.value = 0
                popoverBottom.value = 0
                popoverRight.value = 0
                if (!boolVal) {
                    popoverLeft.value = windowSize.width - limitSize.min.width
                } else {
                    if (windowSize.width < limitSize.max.width) {
                        popoverLeft.value = 0
                        return
                    }
                    popoverLeft.value = windowSize.width - limitSize.max.width
                }
            }
            const isExtendHeight = ref(false)
            // true -》向上扩展，否则， 向下收缩
            const changeExtend = (boolVal) => {
                isExtendHeight.value = boolVal
                if (!boolVal) {
                    popoverTop.value = 0
                    popoverBottom.value = 0
                } else {
                    popoverBottom.value = windowSize.height - limitSize.min.height - popoverTop.value
                }
            }
            const directions = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']
            const cursorCom = computed(() => {
                return (direct) => {
                    if (['n', 's'].includes(direct)) return 'y-direction'
                    if (['e', 'w'].includes(direct)) return 'x-direction'
                    if (['ne', 'sw'].includes(direct)) return 'z-right-corner-direction'
                    if (['se', 'nw'].includes(direct)) return 'z-left-corner-direction'
                }
            })
            const target = {}
            // 获取缩放页面对象
            const bindResize = (direction, ev) => {
                target.isMove = true
                target.direction = direction
                if (['n', 's'].includes(direction)) {
                    target.clientY = ev.clientY
                }
                if (['e', 'w'].includes(direction)) {
                    target.clientX = ev.clientX
                }
                if (['nesw', 'nw', 'ne', 'se', 'sw'].includes(direction)) {
                    target.clientX = ev.clientX
                    target.clientY = ev.clientY
                }
            }
            const resizeDocs = (event) => {
                // 注意：阻止了拖拽事件
                // event.preventDefault()
                if (!target.isMove) return
                // 宽度范围 430px ~ 1000px
                const x = event.clientX - target.clientX; const y = event.clientY - target.clientY; const direction = target.direction
                if (direction.includes('w')) {
                    popoverLeft.value += x
                }
                if (direction.includes('e')) {
                    popoverRight.value -= x
                }
                if (direction.includes('n')) {
                    popoverTop.value += y
                }
                if (direction.includes('s')) {
                    popoverBottom.value -= y
                }
                checkBoundaryVal(x, y)
                target.clientX = event.clientX
                target.clientY = event.clientY
            }
            const checkBoundaryVal = (x, y) => {
                const direction = target.direction
                const { min: minPos, max: maxPos } = limitPos
                const computedWidth = windowSize.width - popoverLeft.value - popoverRight.value
                const computedHeight = windowSize.width - popoverTop.value - popoverBottom.value
                if (computedWidth < limitSize.min.width || computedWidth > limitSize.max.width || popoverLeft.value > maxPos.left || popoverLeft.value < minPos.left || popoverRight.value < minPos.right) {
                    if (direction.includes('w')) {
                        popoverLeft.value -= x
                    }
                    if (direction.includes('e')) {
                        popoverRight.value += x
                    }
                }
                if (computedHeight < limitSize.min.height || popoverBottom.value < minPos.bottom || popoverTop.value < minPos.top) {
                    if (direction.includes('n')) {
                        popoverTop.value -= y
                    }
                    if (direction.includes('s')) {
                        popoverBottom.value += y
                    }
                }
            }
            const endResize = () => {
                target.isMove = false
            }
            const handleResize = () => {
                windowSize.width = window.innerWidth
                windowSize.height = window.innerHeight
                popoverTop.value = limitPos.min.top
                popoverRight.value = limitPos.min.right
                popoverBottom.value = limitPos.min.bottom
                popoverLeft.value = windowSize.width - limitSize.min.width
            }
            onBeforeMount(() => {
                window.addEventListener('mousemove', resizeDocs, true)
                window.addEventListener('mouseup', endResize)
                window.addEventListener('resize', handleResize)
            })
            onBeforeUnmount(() => {
                window.removeEventListener('mousemove', resizeDocs, true)
                window.removeEventListener('mouseup', endResize)
                window.removeEventListener('resize', handleResize)
            })
            const closeDocPopover = () => {
                ctx.emit('closePage', false)
            }

            // 模块展示
            const moduleList = reactive([
                {
                    moduleName: '流程图',
                    iconClass: 'bk-drag-icon bk-drag-tuopu icon-pos',
                    frameSrc: frameImg
                },
                {
                    moduleName: '前端模块开发',
                    iconClass: 'bk-drag-icon bk-drag-template-fill icon-pos',
                    docsList: [
                        {
                            name: '页面开发',
                            description: '蓝鲸应用开发采用前后台分离开发模式，应用前端模块独立开发、部署，通过与后台模块API调用的方式进行数据获取、保存等操作。'
                        },
                        {
                            name: '路由管理',
                            description: '蓝鲸应用开发采用前后台分离开发模式，应用前端模块独立开发、部署，通过与后台模块API调用的方式进行数据获取、保存等操作。'
                        },
                        {
                            name: 'JS函数开发',
                            selectDoc: 'method',
                            description: '蓝鲸应用开发采用前后台分离开发模式，应用前端模块独立开发、部署，通过与后台模块API调用的方式进行数据获取、保存等操作。'
                        },
                        {
                            name: '变量管理',
                            selectDoc: 'variable',
                            description: '蓝鲸应用开发采用前后台分离开发模式，应用前端模块独立开发、部署，通过与后台模块API调用的方式进行数据获取、保存等操作。'
                        },
                        {
                            name: '资源管理',
                            selectDoc: 'layout',
                            description: '蓝鲸应用开发采用前后台分离开发模式，应用前端模块独立开发、部署，通过与后台模块API调用的方式进行数据获取、保存等操作。'
                        },
                        {
                            name: ' 发布部署',
                            description: '蓝鲸应用开发采用前后台分离开发模式，应用前端模块独立开发、部署，通过与后台模块API调用的方式进行数据获取、保存等操作。'
                        }
                    ]
                },
                {
                    moduleName: '数据源管理',
                    iconClass: 'bk-drag-icon bk-drag-jiedian icon-pos',
                    docsList: [
                        {
                            name: '数据表管理',
                            description: '蓝鲸应用开发采用前后台分离开发模式，应用前端模块独立开发、部署，通过与后台模块API调用的方式进行数据获取、保存等操作。'
                        },
                        {
                            name: '数据操作',
                            description: '蓝鲸应用开发采用前后台分离开发模式，应用前端模块独立开发、部署，通过与后台模块API调用的方式进行数据获取、保存等操作。'
                        }
                    ]
                }
            ])
            const isHasDocs = computed(() => {
                return (docsList) => {
                    if (typeof docsList === 'undefined') {
                        return false
                    }
                    return true
                }
            })
            const moduleRefs = ref([])
            const queryModule = (val, index) => {
                set(moduleList[index], 'isShowModule', val)
                moduleRefs.value[index].style.display = val ? 'block' : 'none'
            }

            // 搜索文档
            const searchDocList = ref([])
            const searchKey = ref('')
            const isSearching = computed(() => {
                if (!searchKey.value.trim().length) return false
                return true
            })
            const getDocList = (docTree) => {
                if (!Array.isArray(docTree)) return []
                let allDoc = []
                docTree.forEach((item) => {
                    if (!item.docsList) allDoc.push(item)
                    if (Array.isArray(item.docsList)) {
                        allDoc = allDoc.concat(getDocList(item.docsList))
                    }
                })
                return allDoc
            }
            const allDoc = getDocList(moduleList.slice(1))
            const searchDocs = () => {
                const regWord = new RegExp(searchKey.value, 'gi')
                // 获取所有叶子节点
                searchDocList.value = allDoc.reduce((preVal, curVal) => {
                    const isSearchDoc = curVal.name.includes(searchKey.value) || curVal.description.includes(searchKey.value)
                    isSearchDoc && preVal.push({
                        name: curVal.name.replace(regWord, `<span class="high-blue">${searchKey.value}</span>`),
                        selectDoc: curVal.selectDoc,
                        description: curVal.description.replace(regWord, `<span class="high-blue">${searchKey.value}</span>`)
                    })
                    return preVal
                }, [])
            }
            const hoverIndex = ref('')
            const getHoverIndex = (evt, index) => {
                hoverIndex.value = index
            }
            const hoverCls = computed(() => {
                return (index) => {
                    if (hoverIndex.value === index) return 'search-doc-hover'
                }
            })

            // 查看文档详情
            const isDocDetail = ref(false)
            const docNameParam = ref('')
            const getDocDetail = (item) => {
                isDocDetail.value = true
                docNameParam.value = item?.selectDoc || ''
            }
            const backUpPage = () => {
                isDocDetail.value = false
            }
            const pageSwitchMethod = (docName) => {
                docNameParam.value = docName
            }
            const isDisplaySort = computed(() => {
                const width = windowSize.width - popoverLeft.value - popoverRight.value
                if (width >= 750) {
                    return true
                }
                return false
            })

            return {
                isFull,
                changeFull,
                isExtendHeight,
                changeExtend,
                helpDocs,
                popoverStyles,
                directions,
                cursorCom,
                bindResize,
                closeDocPopover,
                queryModule,
                moduleList,
                isHasDocs,
                moduleRefs,
                searchKey,
                searchDocs,
                searchDocList,
                isSearching,
                hoverCls,
                getHoverIndex,
                isDocDetail,
                getDocDetail,
                docNameParam,
                pageSwitchMethod,
                isDisplaySort,
                backUpPage
            }
        }
    })
</script>
<style lang="postcss" scoped>
.help-docs {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 999;
    background-color: #fff;
    border-radius: 4px 4px 0 0;
    display: flex;
    flex-direction: column;
    min-height: 450px;
    box-shadow: 0 2px 30px 8px #0000001a;
    .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 13px 16px;
        background-image: linear-gradient(267deg, #2DD1F4 0%, #1482FF 95%);
        border-radius: 4px 4px 0 0;
        line-height: 22px;
        cursor: move;
        &-left {
            font-size: 16px;
            font-weight: 700;
            font-family: MicrosoftYaHei-Bold;
            color: #fff;
            .header-detail-title {
                cursor: pointer;
            }
        }
        &-right {
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: #fff;
            font-size: 20px;
            height: 20px;
            i {
                width: 24px;
                height: 24px;
                cursor: pointer;
                &:hover {
                    background-color: rgba(250,250,250,.2);
                    border-radius: 2px;
                }
            }
            & > div:nth-child(2) {
                margin: 0 12px;
            }
        }
    }
    .docs-category {
        height: calc(100% - 48px);
        .search-space {
            padding: 16px 16px 0 16px;
        }
        .content {
            padding: 0 10px 0 16px;
            height: calc(100% - 48px);
            overflow-y: scroll;
            font-family: MicrosoftYaHei;
            &::-webkit-scrollbar {
                width: 6px;
                height: 5px;
            }
            &::-webkit-scrollbar-thumb {
                border-radius: 20px;
                background-color: #dcdee5;
                -webkit-box-shadow: inset 0 0 6px hsla(0, 0%, 80%, .3);
            }
        }
        .module-docs {
            margin-top: 6px;
            .module-title {
                display: flex;
                justify-content: space-between;
                padding: 19px 0;
                border-bottom: 2px solid #EAEBF0;
                margin-left: 32px;
                .left {
                    font-weight: 700;
                    font-family: MicrosoftYaHei-Bold;
                    color: #313238;
                    position: relative;
                    .icon-pos {
                        position: absolute;
                        top: 50%;
                        left: -28px;
                        margin-top: -9px;
                        font-size: 18px;
                        background-image: linear-gradient(139deg, #48C3FF 0%, #5C97F9 100%);
                        background-clip: text;
                        -webkit-text-fill-color: transparent;
                        display: inline-block;
                    }
                }
            }
            .border-none {
                border: none;
            }
            .frame-img {
                .zoom-image {
                    width: 100%;
                }
            }
            .doc {
                padding: 16px 0 13px 0;
                color: #63656E;
                border-bottom: 2px solid #EAEBF0;
                margin-left: 32px;
                &-name {
                    font-weight: 700;
                    font-family: MicrosoftYaHei-Bold;
                }
                &-des {
                    margin-top: 8px;
                    line-height: 22px;
                }
                &-operation {
                    margin-top: 8px;
                    color: #3A84FF;
                    cursor: pointer;
                }
            }
            & > div:last-child .doc:last-child {
                border: none;
            }
        }
        .search-docs {
            .search-content {
                color: #63656E;
                .search-doc {
                    margin-top: 16px;
                    &-name {
                        height: 20px;
                        line-height: 20px;
                        font-weight: 700;
                        font-family: MicrosoftYaHei-Bold;
                    }
                    &-des {
                        padding: 8px 0 11px 0;
                        line-height: 22px;
                        border-bottom: 2px solid #EAEBF0;
                    }
                    /deep/ .high-blue {
                        color: #3A84FF;
                    }
                }
                .search-doc-hover {
                    color: #313238;
                    cursor: pointer;
                }
            }
            .empty-text {
                margin-top: 70px;
                .clear-condition {
                    color: #3A84FF;
                }
            }
        }
        i {
            cursor: pointer;
        }
    }
    .docs-detail {
        height: calc(100% - 48px);
        /deep/ .detail-container {
            min-width: auto;
        }
        /deep/ .detail-content {
            width: auto
        }
    }
    .drag-cursor {
        & > span {
            position: absolute;
            z-index: 1000;
            width: 100%;
            height: 100%;
            background-color: transparent
        }
        .y-direction {
            height: 5px;
            left: 0;
            cursor: n-resize;
        }
        .n-resize {
            top: 0;
        }
        .s-resize {
            bottom: 0;
        }
        .x-direction {
            width: 5px;
            top: 0;
            cursor: e-resize;
        }
        .e-resize {
            right: 0;
        }
        .w-resize {
            left: 0;
        }
        .z-right-corner-direction {
            width: 10px;
            height: 10px;
            z-index: 1001;
            cursor: ne-resize;
        }
        .ne-resize {
            top: 0;
            right: 0;
        }
        .sw-resize {
            left: 0;
            bottom: 0;
        }
        .z-left-corner-direction {
            width: 10px;
            height: 10px;
            z-index: 1001;
            cursor: nw-resize;
        }
        .nw-resize {
            top: 0;
            left: 0;
        }
       .se-resize {
            right: 0;
            bottom: 0;
        }

    }
}
</style>
