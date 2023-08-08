<template>
    <div class="template-menu-edit">
        <div class="menu-name">
            <bk-input :placeholder="$t('请输入导航名称')" :value="baseInfo.name" @change="handleNameChange">
                <div
                    v-if="showIcon"
                    slot="prepend"
                    ref="icon"
                    class="group-text"
                    style="padding: 0 10px">
                    <i :class="iconClass" />
                </div>
            </bk-input>
        </div>
        <div class="menu-page-wraper" v-if="showMenu">
            <div v-if="isPageCode">
                <bk-select
                    class="menu-page"
                    :placeholder="$t('请选中路由')"
                    clearable
                    :value="baseInfo.pageCode"
                    @change="handlePageCodeChange">
                    <bk-option
                        v-for="page in pageRouteList"
                        v-bk-tooltips="{ disabled: !page.disabled, content: $t('未设置路由') }"
                        :key="page.pageCode"
                        :id="page.pageCode"
                        :disabled="page.disabled"
                        :name="page.pageName" />
                </bk-select>
                <div class="menu-page-query">
                    <section v-if="isShowPageQuery" class="route-params">
                        <i class="bk-drag-icon bk-drag-info-tips params-tips" v-bk-tooltips="$t('可以使用 {{变量标识}} 来使用应用级别变量')"></i>
                        <bk-input
                            :value="baseInfo.query"
                            :placeholder="paramsPlaceholder"
                            @change="handlePageQueryChange" />   
                    </section>
                    
                    <bk-button
                        v-else
                        class="add-query"
                        text
                        style="font-size: 12px;"
                        @click="handleShowEditPageQuery">
                        {{ $t('添加路由参数') }} </bk-button>
                    <div
                        v-if="isShowPageQuery"
                        class="query-remove"
                        v-bk-tooltips.top-start="$t('删除路由参数')"
                        @click="handleRemovePageQuery">
                        <i class="bk-icon icon-minus-circle" />
                    </div>
                </div>
            </div>
            <bk-input
                v-else
                class="menu-link"
                :placeholder="$t('请输入链接')"
                :value="baseInfo.link"
                clearable
                @change="handleLinkChange" />
            <div
                class="menu-type"
                v-bk-tooltips.top-start="isPageCode ? $t('点击切换链接模式') : $t('点击切换路由模式')"
                @click="handleTogglePageCode">
                <div class="text">{{ isPageCode ? $t('路由') : $t('链接') }}</div>
            </div>
        </div>
        <div style="display: none">
            <div ref="iconPanel" class="template-icon-custom-panel">
                <div v-if="isIconListRender">
                    <div class="list-icon-search">
                        <input
                            ref="search"
                            spellcheck="false"
                            :placeholder="$t('输入 icon 的名字')"
                            @input="handleInputChange">
                        <i class="bk-icon icon-search icon-search-flag" />
                    </div>
                    <div class="wraper">
                        <template v-if="searchValue">
                            <div
                                class="item"
                                v-for="searchItem in searchList"
                                :key="searchItem.icon"
                                @click="handleIconChange(searchItem.icon)">
                                <i :class="searchItem.icon" />
                                <span class="item-name">{{ searchItem.name }}</span>
                            </div>
                            <div v-if="searchList.length < 1" key="searchEmpty" class="search-empty">{{ $t('暂无数据') }}</div>
                        </template>
                        <template v-else>
                            <template v-for="buildIconGroupName in Object.keys(buildInIconGroup)">
                                <div
                                    v-if="buildInIconGroup[buildIconGroupName].length > 0"
                                    class="group"
                                    :key="buildIconGroupName">
                                    <div class="group-name">{{ buildIconGroupName }}（{{ buildInIconGroup[buildIconGroupName].length }}）</div>
                                    <div
                                        v-for="iconItem in buildInIconGroup[buildIconGroupName]"
                                        class="item"
                                        :key="iconItem.icon"
                                        @click="handleIconChange(iconItem.icon)">
                                        <i :class="iconItem.icon" />
                                        <span class="item-name">{{ iconItem.name }}</span>
                                    </div>
                                </div>
                            </template>
                        </template>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import _ from 'lodash'
    import { mapState } from 'vuex'
    import iconComponentList from '@/element-materials/materials/vue2/icon-list.js'
    import iconVantList from '@/element-materials/materials/vue2/vant/icon-list'

    export default {
        name: '',
        props: {
            data: {
                type: Object,
                default: () => ({})
            },
            showIcon: {
                type: Boolean,
                default: false
            },
            showMenu: {
                type: Boolean,
                default: true
            },
            platform: {
                type: String,
                default: 'PC'
            }
        },
        data () {
            return {
                isPageCode: true,
                isShowPageQuery: false,
                baseInfo: {
                    icon: '',
                    name: '',
                    pageCode: '',
                    fullPath: '',
                    link: '',
                    query: ''
                },
                searchValue: '',
                searchList: [],
                paramsPlaceholder: 'name=lisi&age={{age}}',
                isIconListRender: false
            }
        },
        computed: {
            ...mapState('route', ['layoutPageList']),
            iconClass () {
                return this.platform === 'PC' ? `bk-icon ${this.baseInfo.icon}` : `van-icon van-icon-${this.baseInfo.icon}`
            },
            iconList () {
                return this.platform === 'PC' ? iconComponentList : iconVantList
            },
            buildInIconGroup () {
                const list = JSON.parse(JSON.stringify(this.iconList))
                return list.reduce((result, item) => {
                    if (!result[item.group]) {
                        result[item.group] = []
                    }
                    result[item.group].push({
                        icon: this.getIcon(item),
                        name: item.icon
                    })
                    return result
                }, {})
            },
            pageRouteList () {
                const pageRouteList = this.layoutPageList.reduce((acc, cur) => {
                    const pageType = cur.pageType || 'PC'
                    if (pageType === this.platform) { // 只允许调准同平台路由
                        const { id, layoutPath, path } = cur
                        const disabled = !id
                        acc.push({
                            ...cur,
                            disabled,
                            fullPath: `${layoutPath}${layoutPath.endsWith('/') ? '' : '/'}${path}`
                        })
                    }
                    return acc
                }, [])

                pageRouteList.sort((p1, p2) => p1.disabled - p2.disabled)
                return pageRouteList
            }
        },
        mounted () {
            this.$nextTick(() => {
                // 可选应用icon
                this.initPopover()
            })
        },
        created () {
            this.baseInfo = { ...this.data }
            this.isPageCode = !this.data.link
            this.isShowPageQuery = !!this.data.query
        },
        methods: {
            getIcon (item) {
                return this.platform === 'PC' ? `bk-icon ${item.name}` : `van-icon van-icon-${item.icon}`
            },
            triggerChange () {
                this.$emit('on-change', {
                    ...this.baseInfo
                })
            },
            initPopover () {
                if (!this.popperInstance && this.showIcon) {
                    this.popperInstance = this.$bkPopover(this.$refs.icon, {
                        theme: 'light template-custom-icon',
                        arrow: false,
                        interactive: true,
                        animateFill: false,
                        placement: 'bottom-start',
                        content: this.$refs.iconPanel,
                        trigger: 'click',
                        width: '276px',
                        size: 'small',
                        zIndex: window.__bk_zIndex_manager.nextZIndex(),
                        boundary: 'viewport',
                        onShow: () => {
                            this.isIconListRender = true
                        },
                        onHidden: () => {
                            this.isIconListRender = false
                        }
                    })
                    this.$once('hook:beforeDestroy', () => {
                        this.popperInstance.destroy()
                    })
                }
            },
            handleInputChange (event) {
                const localSearch = _.trim(event.target.value).toLocaleLowerCase()
                this.searchValue = localSearch
                if (!localSearch) {
                    this.searchList = []
                    return
                }
                const result = []
                for (let i = 0; i < this.iconList.length; i++) {
                    const curItem = this.iconList[i]
                    if (curItem.icon.indexOf(localSearch) > -1) {
                        result.push({
                            icon: this.getIcon(curItem),
                            name: curItem.icon
                        })
                    }
                }
                this.searchList = Object.freeze(result)
            },
            handleIconChange (icon) {
                this.baseInfo.icon = icon
                this.popperInstance.hide()
                this.triggerChange()
            },
            handleNameChange (name) {
                this.baseInfo.name = name
                this.triggerChange()
            },
            handlePageCodeChange (pageCode) {
                const { fullPath } = this.pageRouteList.find(item => item.pageCode === pageCode)
                this.baseInfo.pageCode = pageCode
                this.baseInfo.fullPath = fullPath
                this.triggerChange()
            },
            handleShowEditPageQuery () {
                this.isShowPageQuery = !this.isShowPageQuery
            },
            handlePageQueryChange (query) {
                this.baseInfo.query = query
                this.triggerChange()
            },
            handleRemovePageQuery () {
                this.isShowPageQuery = false
                this.baseInfo.query = ''
                this.triggerChange()
            },
            handleLinkChange (link) {
                this.baseInfo.link = link
                this.triggerChange()
            },
            handleTogglePageCode () {
                this.baseInfo.pageCode = ''
                this.baseInfo.link = ''
                this.baseInfo.query = ''
                this.isPageCode = !this.isPageCode
            }
        }
    }
</script>
<style lang="postcss">
    .template-custom-icon-theme{
        padding: 0 !important;
        .list-icon-search{
            position: relative;
            padding: 0 10px;
            color: #979BA5;
            input{
                width: 100%;
                height: 32px;
                padding: 0 10px 0 30px;
                line-height: 32px;
                background: transparent;
                border: none;
                border-bottom: 1px solid #DCDEE5;
                outline: none;
                &::placeholder{
                    color: #C4C6CC;
                }
            }
            .icon-search-flag{
                position: absolute;
                top: 8px;
                left: 10px;
                font-size: 16px;
                color: #979ba5;
            }
        }
        .template-icon-custom-panel{
            font-size: 12px;
            color: #63656E;
            .wraper{
                max-height: 320px;
                line-height: 32px;
                overflow-y: auto;
                .group{
                    .group-name{
                        margin: 0 12px;
                        color: #979BA5;
                        line-height: 32px;
                        border-bottom: 1px solid #DCDEE5;
                    }
                }
                .item{
                    padding: 0 12px;
                    cursor: pointer;
                    &:hover{
                        color: #3A84FF;
                        background: #EAF3FF;
                    }
                }
                .item-name{
                    padding-left: 5px;
                }
                .search-empty{
                    padding: 0 12px;
                    text-align: center;
                }
            }
        }
    }

</style>
<style lang='postcss' scoped>
    .template-menu-edit{
        .menu-name,
        .menu-page,
        .menu-link{
            background: #fff;
        }
        .group-text{
            color: #979BA5;
            cursor: pointer;
        }
        .menu-page-wraper{
            position: relative;
            padding-left: 32px;
            margin-top: 8px;
            .menu-type{
                position: absolute;
                top: 8px;
                left: 4px;
                padding: 3px 2px;
                font-size: 12px;
                color: #3A84FF;
                line-height: 1;
                border-radius: 2px;
                background: #fff;
                cursor: pointer;
                &:hover{
                    background: #E1ECFF;
                }
                .text{
                    transform: scale(.8333);
                }
            }
            .menu-page-query{
                position: relative;
                top: 8px;
                margin-bottom: 8px;
                .query-remove{
                    position: absolute;
                    top: 0;
                    top: 10px;
                    right: -27.5px;
                    display: flex;
                    font-size: 16px;
                    color: #979BA5;
                    cursor: pointer;
                }
                .bk-button-text.bk-primary:hover {
                    color: #1964E1;
                }
                .route-params {
                    display: flex;
                    align-items: center;
                    .params-tips {
                        position: absolute;
                        left: -20px;
                    }
                }
            }
        }
    }
</style>
