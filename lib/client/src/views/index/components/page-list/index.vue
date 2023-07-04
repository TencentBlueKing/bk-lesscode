<template>
    <div class="page-select">
        <div class="page-name">
            <div class="back-icon-container" @click="handleBackPageList">
                <i class="bk-drag-icon bk-drag-arrow-back" :title="$t('返回页面列表')" />
            </div>
            <div
                id="editPageSwitchPage"
                class="select-page-box">
                <bk-select
                    ext-cls="select-page"
                    ext-popover-cls="select-page-dropdown"
                    ref="pageSelect"
                    v-model="selectPageId"
                    :clearable="false"
                    :searchable="true"
                    @toggle="toggleSelect"
                    @change="handlePageChange">
                    <div slot="trigger">
                        <div
                            class="name-content"
                            :title="`${pageDetail.pageName}【${projectDetail.projectName}】`">
                            <div class="col-icon">
                                <i :class="showIcon"></i>
                            </div>
                            <div class="col-name">{{ pageDetail.pageName }}</div>
                            <div class="col-version">{{versionName}}</div>
                            <frameworkTag :framework="projectDetail.framework" bg-color="#fff"></frameworkTag>
                        </div>
                        <i class="bk-select-angle bk-icon icon-angle-down" />
                    </div>
                    <bk-option-group
                        v-for="group in classPageList"
                        :key="group.id"
                        :name="group.name">
                        <section slot="group-name" class="page-group-name">
                            <i
                                :class="['bk-drag-icon', 'fold-icon', group.collapse ? 'bk-drag-angle-down-fill' : 'bk-drag-angle-up-fill']"
                                @click="group.collapse = !group.collapse"></i>
                            <i :class="['bk-drag-icon', group.icon]"></i>
                            <span>{{group.name}}</span>
                            <span>（{{group.children.length}}）</span>
                        </section>
                        <bk-option
                            v-show="!group.collapse && group.children"
                            v-for="option in group.children"
                            :key="option.id"
                            :id="option.id"
                            :name="option.pageName">
                            <span class="page-collapse g-mr8 overflowhidden-oh" :title="option.pageName">{{option.pageName}}</span>
                            <i v-if="!option.nocodeType"
                                class="bk-drag-icon bk-drag-copy"
                                style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%)"
                                @click.stop="handleCopyPage(option)"
                                :title="$t('复制页面')"></i>
                        </bk-option>
                        <li style="padding: 0 28px" v-show="!group.children.length && !group.collapse">{{ $t('暂无页面') }}</li>
                    </bk-option-group>
                </bk-select>
            </div>
            <create-page-entry :framework="projectDetail.framework" class="canvas-theme" />
        </div>
        <page-dialog ref="pageDialog" action="copy" :refresh-list="getPageList" />
    </div>
</template>
<script>
    import {
        mapState,
        mapGetters
    } from 'vuex'
    import { NOCODE_TYPE_MAP } from '@/common/constant'
    import frameworkTag from '@/components/framework-tag'
    import CreatePageEntry from '@/views/project/page-manage/children/create-page-entry'
    import PageDialog from '@/components/project/page-dialog'

    export default {
        name: '',
        components: {
            frameworkTag,
            PageDialog,
            CreatePageEntry
        },
        data () {
            return {
                NOCODE_TYPE_MAP,
                selectPageId: '',
                emptyClassPageList: [
                    {
                        id: 'PC',
                        name: window.i18n.t('PC 页面'),
                        collapse: false,
                        icon: 'bk-drag-pc',
                        children: []
                    },
                    {
                        id: 'MOBILE',
                        name: window.i18n.t('Mobile 页面'),
                        collapse: false,
                        icon: 'bk-drag-mobilephone',
                        children: []
                    }
                ],
                classPageList: []
            }
        },
        computed: {
            ...mapState('route', ['layoutPageList']),
            ...mapGetters('project', [
                'projectDetail'
            ]),
            ...mapGetters('page', [
                'pageDetail',
                'pageList',
                'platform'
            ]),
            ...mapGetters('projectVersion', { versionName: 'currentVersionName' }),
            showIcon () {
                if (this.platform === 'MOBILE') {
                    return 'bk-drag-icon bk-drag-mobilephone'
                } else {
                    return 'bk-drag-icon bk-drag-pc'
                }
            }
        },
        watch: {
            pageList (val) {
                val.length && this.initClassPageList()
            }
        },
        created () {
            this.projectId = parseInt(this.$route.params.projectId)
            this.pageId = parseInt(this.$route.params.pageId)
            this.selectPageId = parseInt(this.$route.params.pageId)
            this.initClassPageList()
        },
        methods: {
            initClassPageList () {
                this.classPageList = JSON.parse(JSON.stringify(this.emptyClassPageList))
                this.pageList.forEach(page => {
                    if (page.pageType === 'MOBILE') {
                        this.classPageList[1].children.push(page)
                        return
                    }
                    this.classPageList[0].children.push(page)
                })
            },
            /**
             * @desc 返回应用页面列表
             */
            handleBackPageList () {
                this.$router.push({
                    name: 'pageList',
                    params: {
                        projectId: this.projectId
                    }
                })
            },
            toggleSelect (isShow) {
                if (isShow) {
                    this.selectPageId = parseInt(this.$route.params.pageId)
                }
            },
            /**
             * @desc 页面切换
             */
            handlePageChange (pageId) {
                const page = this.pageList.find(item => item.id === pageId)
                if (!pageId || pageId === this.pageId || !page.id) {
                    return
                }
                // 如果是离开routeName, 本身已经存在一次离开弹窗
                const currentRouteName = this.$route.name
                const toRouteName = NOCODE_TYPE_MAP?.toRouteName[page.nocodeType] || 'new'
                if (currentRouteName === toRouteName) {
                    this.$bkInfo({
                        title: window.i18n.t('确认离开'),
                        okText: window.i18n.t('离开'),
                        subTitle: window.i18n.t('您将离开画布编辑页面，请确认相应修改已保存'),
                        confirmFn: async () => {
                            this.toNewPage(page, toRouteName)
                        }
                    })
                } else {
                    this.toNewPage(page, toRouteName)
                }
            },
            toNewPage (page, toRouteName) {
                this.$router.replace({
                    name: toRouteName || 'new',
                    params: {
                        projectId: this.projectId,
                        pageId: page.nocodeType !== 'FLOW' ? page.id : undefined,
                        flowId: page.nocodeType === 'FLOW' ? page.flowId : undefined
                    }
                })
            },
            /**
             * @desc 新建页面
             * @param { String } 新建类型
             *
             * - 新建空白页面
             * - 复制指定页面页面新建
             */
            handleCopyPage (page) {
                const layoutId = (this.layoutPageList.find(({ pageId }) => pageId === Number(page.id)) || {}).layoutId
                this.$refs.pageDialog.layoutId = layoutId
                this.$refs.pageDialog.dialog.formData.id = page.id
                this.$refs.pageDialog.dialog.formData.pageName = `${page.pageName}-copy`

                this.$refs.pageDialog.dialog.formData.pageCode = ''
                this.$refs.pageDialog.dialog.formData.pageRoute = ''
                this.$refs.pageDialog.dialog.visible = true
                this.$refs.pageSelect.close()
            },
            async getPageList (newPageId) {
                const pageList = await this.$store.dispatch('page/getList', {
                    projectId: this.projectId,
                    versionId: this.versionId
                })
                this.$store.commit('page/setPageList', pageList || [])
                if (newPageId) {
                    this.$bkInfo({
                        title: '是否跳转到新复制的页面画布？',
                        subTitle: '跳转到新页面前请确保当前画布内容已保存，选否则继续留在当前页面画布',
                        okText: '是',
                        cancelText: '否',
                        width: 500,
                        confirmFn: () => {
                            this.$router.replace({
                                name: 'new',
                                params: {
                                    pageId: newPageId
                                }
                            })
                        }
                    })
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .page-select {
        display: flex;
        align-items: center;
        .page-name {
            display: flex;
            align-items: center;
            height: 100%;
            .back-icon-container {
                width: 42px;
                height: 100%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            .bk-drag-arrow-back {
                font-size: 13px;
                color: #3a84ff;
            }

            .name-content {
                display: flex;
                align-items: center;
                font-size: 12px;
                margin-right: 24px;
                height: 32px;

                .col-icon {
                    background: #EAEBF0;
                    color: #979BA5;
                    width: 30px;
                    height: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .col-name {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    color: #63656E;
                    margin: 0 8px 0 6px;
                    max-width: 160px;
                }
                .col-version {
                    color: #979BA5;
                    background: #FFF;
                    border-radius: 2px;
                    font-size: 12px;
                    line-height: 18px;
                    white-space: nowrap;
                    display: inline-block;
                    padding: 2px 5px;
                    display: inline-block;
                    transform: scale(0.83, 0.83);
                }
            }

            .select-page-box {
                display: flex;
                align-items: center;
                height: 100%;
                width: 256px;
                margin: 0 8px 0 4px;
                .select-page {
                    width: 100%;
                    border: none;
                    background-color: #f0f1f5;
                    &:hover {
                        border: none;
                        box-shadow: none;
                        background-color: #dedee5;
                    }
                    &.is-focus {
                        border: none;
                        box-shadow: none;
                        background-color: #dedee5;
                    }
                }
            }
        }
    }

    .select-page-dropdown {
        .bk-select-search-input {
            padding: 0 10px 0 30px;
        }
        .page-group-name {
            .fold-icon {
                cursor: pointer;
            }
            i {
                margin-right: 4px;
            }
        }
    }
    .page-collapse {
            display: block;
        }
</style>
