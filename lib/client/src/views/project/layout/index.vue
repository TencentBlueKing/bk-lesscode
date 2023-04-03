<template>
    <section v-bkloading="{ isLoading: isLoading }" style="height: 100%">
        <main class="layout-inst-content" v-show="!isLoading">
            <div class="layout-inst-head">
                <bk-button theme="primary" @click="handleCreate">{{ $t('新建') }}</bk-button>
            </div>
            <div v-for="(group, index) in typedLayoutList" :key="index" class="layout-inst-body-group">
                <div class="title">{{group.title}}</div>
                <div class="layout-inst-body">
                    <div class="layout-inst-list">
                        <div class="layout-item" v-for="(layout, layoutIndex) in group.list" :key="layoutIndex">
                            <div class="item-bd">
                                <div class="preview">
                                    <img v-if="layout.type !== 'empty' && layout.type !== 'mobile-empty'" :src="getPreviewImg(layout)" :alt="$t('布局缩略预览')">
                                    <div class="empty-preview-img" v-else>{{ $t('空白布局') }}</div>
                                </div>
                            </div>
                            <div class="item-ft">
                                <div class="col">
                                    <div class="layout-name">
                                        <span class="layout-type">
                                            <i v-if="layout.layoutType === 'MOBILE'" class="bk-drag-icon bk-drag-mobilephone"> </i>
                                            <i v-else class="bk-drag-icon bk-drag-pc"> </i>
                                        </span>
                                        <div class="name" v-bk-tooltips="{ content: layout.showName, disabled: !(layout.showName && layout.showName.length > 16) }">{{layout.showName}}</div>
                                    </div>
                                    <div class="stat" :title="layout.routePath">
                                        {{ $t('路由: {0}', [layout.routePath]) }} </div>
                                </div>
                                <div class="col">
                                    <div class="operate-icons">
                                        <i :title="$t('预览')" v-if="(layout.type !== 'empty' && (layout.type && layout.type !== 'mobile-empty'))" class="bk-icon icon-eye click-icon" @click="handlePreview(layout)"></i>
                                        <bk-dropdown-menu :ref="`moreActionDropdown${layout.id}`">
                                            <span slot="dropdown-trigger" class="more-menu-trigger">
                                                <i class="bk-drag-icon bk-drag-more-dot"></i>
                                            </span>
                                            <ul class="bk-dropdown-list more-dropdown-list" slot="dropdown-content" @click="hideDropdownMenu(layout.id)">
                                                <li class="action-item"><a href="javascript:;" @click="handleUpdate(layout)">{{ $t('编辑') }}</a></li>
                                                <li v-if="layout.layoutType !== 'MOBILE'" v-bk-tooltips.bottom="{ content: $t('导航布局已被使用，不可删除'), disabled: !layoutPageMap[layout.id] }"
                                                    :class="['action-item', { disabled: layoutPageMap[layout.id] }]">
                                                    <a href="javascript:;" @click="handleDelete(layout)">{{ $t('删除') }}</a>
                                                </li>
                                            </ul>
                                        </bk-dropdown-menu>
                                    </div>
                                </div>
                                <span v-if="layout.isDefault" class="default-tag checked">{{ $t('默认') }}</span>
                                <span v-else class="default-tag setting" @click.stop="handleSetDefault(layout)">{{ $t('设为默认') }}</span>
                            </div>
                        </div>
                        <div class="empty" v-show="!layoutList.length && !isLoading">
                            <bk-exception class="exception-wrap-item exception-part" type="empty" scene="part">
                                <div v-if="!layoutList.length" class="empty-page">{{ $t('暂无导航布局实例，') }}<bk-link theme="primary" @click="handleCreate">{{ $t('立即创建') }}</bk-link></div>
                            </bk-exception>
                        </div>
                    </div>
                </div>
            </div>
            <layout-dialog ref="layoutDialog" :action="action" :current-layout="currentLayout" :refresh-list="getLayoutList"></layout-dialog>
        </main>
    </section>
</template>

<script>
    import { mapGetters } from 'vuex'
    import layoutDialog from './components/layout-dialog'

    export default {
        components: {
            layoutDialog
        },
        data () {
            return {
                action: '',
                currentLayout: {},
                layoutList: [],
                layoutPageMap: {},
                isLoading: true
            }
        },
        computed: {
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' }),
            projectId () {
                return this.$route.params.projectId
            },
            typedLayoutList () {
                const PCLayouts = this.layoutList.filter(item => item.layoutType === 'PC')
                const MOBILELayout = this.layoutList.filter(item => item.layoutType === 'MOBILE')
                return [
                    {
                        title: 'PC',
                        list: PCLayouts
                    },
                    {
                        title: 'MOBILE',
                        list: MOBILELayout
                    }
                ]
            }
        },
        async created () {
            await this.getLayoutList()
        },
        methods: {
            async getLayoutList () {
                this.isLoading = true
                try {
                    const { list, pageList } = await this.$store.dispatch('layout/getFullList', { projectId: this.projectId, versionId: this.versionId })
                    list.forEach(layout => {
                        layout.showName = layout.showName || layout.defaultName
                    })
                    this.layoutList = list
                    const layoutPageMap = {}
                    pageList.forEach(item => {
                        if (layoutPageMap[item.layoutId]) {
                            layoutPageMap[item.layoutId].push(item)
                        } else {
                            layoutPageMap[item.layoutId] = [item]
                        }
                    })
                    this.layoutPageMap = layoutPageMap
                } catch (e) {
                    console.error(e)
                } finally {
                    this.isLoading = false
                }
            },
            handleCreate () {
                this.action = 'create'
                this.currentLayout = {}
                this.$refs.layoutDialog.dialog.visible = true
            },
            async handleUpdate (layout) {
                this.action = 'edit'
                this.currentLayout = layout
                this.$refs.layoutDialog.dialog.visible = true
            },
            handleDelete (layout) {
                if (this.layoutPageMap[layout.id]) {
                    return
                }
                this.$bkInfo({
                    title: window.i18n.t('确认删除该模板？'),
                    subTitle: window.i18n.t('即将删除模板实例“{0}”？', [layout.showName]),
                    theme: 'danger',
                    confirmFn: async () => {
                        await this.$store.dispatch('layout/delete', {
                            id: layout.id
                        })
                        this.getLayoutList()
                    },
                    okText: window.i18n.t('删除'),
                    confirmLoading: true
                })
            },
            hideDropdownMenu (layoutId) {
                this.$refs[`moreActionDropdown${layoutId}`][0].hide()
            },
            async handleSetDefault (layout) {
                try {
                    const data = {
                        id: layout.id,
                        layoutType: layout.layoutType,
                        projectId: this.projectId,
                        versionId: this.versionId
                    }
                    await this.$store.dispatch('layout/default', { data })
                    this.messageSuccess(window.i18n.t('设置成功'))

                    // 更新数据状态
                    this.layoutList.forEach(item => {
                        if (item.layoutType === layout.layoutType) {
                            item.isDefault = 0
                        }
                    })
                    layout.isDefault = 1
                } catch (e) {
                    console.error(e)
                }
            },
            getPreviewImg (layout) {
                const previewImg = `layout/preview-${layout.type}.png`
                return require(`@/images/${previewImg}`)
            },
            handlePreview (layout) {
                window.open(`/preview-template/project/${layout.projectId}/${layout.id}?type=nav-template&v=${layout.versionId || ''}`, '_blank')
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";

    .layout-inst-content {
        padding: 16px 24px;
        display: flex;
        flex-direction: column;
        height: 100%;

        .layout-inst-head {
            display: flex;
            margin-bottom: 17px;
        }
        .layout-inst-body-group {
            .title {
                font-size: 14px;
                font-weight: 700;
                color: #63656e;
            }
            .layout-inst-body {
                display: flex;
                flex: 1;
                margin-top: 20px;
                .empty {
                    flex: 1;
                    display: flex;
                    align-items: center;
                    .empty-page {
                        display: flex;
                        align-items: center;
                    }
                }
                .layout-inst-list {
                    display: flex;
                    flex-wrap: wrap;
                    align-content: flex-start;

                    .layout-item {
                        position: relative;
                        flex: none;
                        width: 304px;
                        height: 234px;
                        margin: 0 14px 30px 0;
                        padding: 6px;
                        background: #fff;
                        border-radius: 4px;
                        box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.11);

                        &:hover {
                            box-shadow: 1px 2px 8px 2px rgba(0, 0 ,0 , 0.11);

                            .desc {
                                display: block;
                            }
                            .preview {
                                .mask {
                                    background: rgba(0, 0, 0, 0.1);
                                    .operate-btns {
                                        display: block;
                                        opacity: 1;
                                    }
                                }
                            }
                            .default-tag {
                                &.setting {
                                    display: block;
                                }
                            }
                        }
                        .more-menu-trigger {
                            .bk-drag-more-dot {
                                display: block;
                                width: 32px;
                                height: 32px;
                                line-height: 34px;
                                text-align: center;
                                border-radius: 50%;
                                cursor: pointer;
                                font-size: 20px;
                                color: #979BA5;
                                &:hover {
                                    background: #F0F1F5;
                                }
                            }
                        }

                        .item-bd {
                            flex: none;
                            position: relative;
                            width: 292px;
                            height: 158px;
                            background: #fff;
                            border-radius: 4px 4px 0px 0px;
                        }
                        .item-ft {
                            display: flex;
                            align-items: center;
                            justify-content: space-between;
                            margin: 16px 10px 0 10px;
                        }

                        .preview {
                            position: relative;
                            height: 100%;
                            overflow: hidden;
                            border-radius: 4px 4px 0px 0px;
                            img {
                                max-width: 100%;
                            }

                            .empty-preview-img {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 14px;
                                font-weight: 700;
                                color: #C4C6CC;
                                height: 100%;
                                background: #f0f1f5;
                                border-radius: 4px 4px 0px 0px;
                            }

                            .mask {
                                position: absolute;
                                top: 0;
                                left: 0;
                                width: 100%;
                                height: 100%;
                                background: rgba(0, 0, 0, 0.02);
                                display: flex;
                                align-items: center;
                                .operate-btns {
                                    display: none;
                                    .edit-btn {
                                        width: 86px;
                                        margin-left: 59px;
                                    }
                                    .preview-btn {
                                        width: 86px;
                                        margin-left: 10px;
                                        margin-rihgt: 59px;
                                    }
                                }
                            }
                        }
                        .desc {
                            display: none;
                            position: absolute;
                            top: 0;
                            left: 0;
                            width: 100%;
                            height: 100%;
                            padding: 28px 26px 28px 21px;

                            .desc-text {
                                font-size: 12px;
                                color: #fff;
                                margin: 0;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                display: -webkit-box;
                                -webkit-line-clamp: 5;
                                -webkit-box-orient: vertical;
                            }
                        }
                        .empty {
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            font-size: 14px;
                            font-weight: 700;
                            color: #C4C6CC;
                            height: 100%;
                            background: #f0f1f5;
                            border-radius: 4px 4px 0px 0px;
                        }
                        .layout-name {
                            display: flex;
                            align-items: center;
                            margin: -2px 0 0 0;

                            .name {
                                font-size: 12px;
                                font-weight: 700;
                                color: #63656E;
                                width: 200px;
                                overflow: hidden;
                                white-space: nowrap;
                                text-overflow: ellipsis;
                                margin-left: 7px;
                            }

                            .layout-type {
                                font-size: 16px;
                                line-height: 18px;
                                height: 20px;
                                width: 20px;
                                text-align: center;
                                margin-left: -2px;
                                color: #979ba5;
                                border-radius: 2px;
                                background: #f0f1f5;
                            }
                        }
                        .operate-icons {
                            display: flex;
                            align-items: center;
                            .icon-eye {
                                cursor: pointer;
                                padding: 4px;
                            }
                        }
                        .stat {
                            font-size: 12px;
                            color: #979BA5;
                            padding: 4px 0;
                            @mixin ellipsis 240px;
                        }

                        .default-tag {
                            position: absolute;
                            right: 6px;
                            top: 6px;
                            height: 22px;
                            line-height: 22px;
                            text-align: center;
                            border-radius: 2px;
                            font-size: 12px;
                            color: #fff;
                            padding: 0 6px;

                            &.checked {
                                background: #FFB848;
                            }
                            &.setting {
                                display: none;
                                background: #699DF4;
                                cursor: pointer;
                            }
                        }
                    }
                }
            }
        }
    }

    /deep/.more-dropdown-list {
        .action-item {
            &.disabled {
                a {
                    color: #C4C6CC;
                    cursor: not-allowed;
                }
            }
        }
    }
</style>
