<template>
    <div class="page-select">
        <div class="page-name">
            <i
                class="bk-drag-icon bk-drag-arrow-back"
                title="返回页面列表"
                @click="handleBackPageList" />
            <span class="seperate-line">|</span>
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
                            <div class="col-name">{{ pageDetail.pageName }}<span class="project-name">【{{ projectDetail.projectName }}】</span></div>
                            <div class="col-version">{{versionName}}</div>
                        </div>
                        <i class="bk-select-angle bk-icon icon-angle-down" />
                    </div>
                    <bk-option-group
                        v-for="group in classPageList"
                        :key="group.id"
                        :name="group.name">
                        <template slot="group-name">
                            <i
                                :class="['bk-drag-icon', group.collapse ? 'bk-drag-angle-down-fill' : 'bk-drag-angle-up-fill']"
                                @click="group.collapse = !group.collapse"></i>
                            <i :class="['bk-drag-icon', group.icon]"></i>
                            <span>{{group.name}}</span>
                        </template>
                        <bk-option
                            v-show="!group.collapse && group.children"
                            v-for="option in group.children"
                            :key="option.id"
                            :id="option.id"
                            :name="option.pageName">
                            <span>{{option.pageName}}</span>
                            <i v-if="!option.nocodeType"
                                class="bk-drag-icon bk-drag-copy"
                                style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%)"
                                @click.stop="handleCopyPage(option)"
                                title="复制页面"></i>
                        </bk-option>
                        <li style="padding: 0 28px" v-show="!group.children.length && !group.collapse">暂无页面</li>
                    </bk-option-group>
                    <div slot="extension" class="extension">
                        <div
                            class="page-row"
                            @click="handleCreate('PC', '')">
                            <i class="bk-icon icon-plus-circle" /> 新建PC自定义页面
                        </div>
                        <div
                            class="page-row"
                            @click="handleCreate('PC', 'FORM')">
                            <i class="bk-icon icon-plus-circle" /> 新建PC表单页面
                        </div>
                        <div
                            class="page-row"
                            @click="handleCreate('MOBILE', '')">
                            <i class="bk-icon icon-plus-circle" /> 新建Mobile自定义页面
                        </div>
                    </div>
                </bk-select>
            </div>
        </div>
        <page-dialog ref="pageDialog" action="copy" />
        <create-page-dialog ref="createPageDialog" :platform="createPlatform" :nocode-type="createNocodeType" />
    </div>
</template>
<script>
    import {
        mapState,
        mapGetters
    } from 'vuex'
    import { NOCODE_TYPE_MAP } from '@/common/constant'
    import PageDialog from '@/components/project/page-dialog'
    import createPageDialog from '@/components/project/create-page-dialog'

    export default {
        name: '',
        components: {
            PageDialog,
            createPageDialog
        },
        data () {
            return {
                selectPageId: '',
                createPlatform: 'PC',
                createNocodeType: '',
                classPageList: [
                    {
                        id: 'PC',
                        name: 'PC 页面',
                        collapse: false,
                        icon: 'bk-drag-pc',
                        children: []
                    },
                    {
                        id: 'MOBILE',
                        name: 'Mobile 页面',
                        collapse: false,
                        icon: 'bk-drag-mobilephone',
                        children: []
                    }
                ]
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
            ...mapGetters('projectVersion', { versionId: 'currentVersionId', versionName: 'currentVersionName', getInitialVersion: 'initialVersion' })
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
        },
        methods: {
            initClassPageList () {
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
                        title: '确认离开?',
                        subTitle: '您将离开画布编辑页面，请确认相应修改已保存',
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

            handleCreate (platform, nocodeType) {
                this.createPlatform = platform
                this.createNocodeType = nocodeType
                this.$refs.createPageDialog.isShow = true
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
            .bk-drag-icon {
                padding: 10px;
                cursor: pointer;
            }
            .bk-drag-arrow-back {
                font-size: 13px;
                color: #3a84ff;
            }
            .template-logo svg {
                vertical-align: middle;
            }
            .seperate-line {
                width: 1px;
                color: #d8d8d8;
                margin: 0 2px 0 -2px;
            }

            .name-content {
                display: flex;
                align-items: center;
                font-size: 14px;
                margin: 0 24px 0 10px;
                .project-name {
                    color: #979BA5;
                }

                .col-name {
                    overflow: hidden;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                }
                .col-version {
                    background: #dcdee5;
                    border-radius: 9px;
                    height: 18px;
                    font-size: 12px;
                    line-height: 18px;
                    color: #63656e;
                    padding: 0 8px;
                    white-space: nowrap;
                }
            }

            .select-page-box {
                display: flex;
                flex: 1;
                align-items: center;
                height: 100%;
                margin: 0 4px;
                .select-page {
                    width: 350px;
                    margin-left: 5px;
                    border: none;
                    background-color: #f0f1f5;
                    &:hover {
                        background-color: #dedee5;
                    }
                    &.is-focus {
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
        .extension {
            cursor: pointer;
            .page-row:hover {
                color: #3A84FF;
            }
        }
    }
</style>
