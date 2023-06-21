<template>
    <div
        ref="root"
        class="field-item drag-entry custom-comp-item"
        :class="displayClass"
        v-bk-tooltips="{
            content: data.displayName,
            disabled: !(data.displayName && data.displayName.length > 5),
            maxWidth: 400
        }">
        <section class="flex-container">
            <i :class="['bk-drag-icon', 'comp-icon', data.icon || 'bk-drag-custom-comp-default']"></i>
            <span class="comp-name">{{ data.displayName }}</span>
        </section>
        <section class="flex-container operate-icons">
            <i
                class="bk-icon icon-info-circle intro-icon"
                @mouseenter.stop="handleShowIntroduction(data, $event)"
                @mouseleave.stop="handleHideIntroduction"
            />
            <i
                v-if="publicGroup || favouriteGroup"
                v-bk-tooltips="favoriteTips"
                class="favorite-btn"
                @click.stop="handleClickFavorite(data)"
                :class="['bk-drag-icon', `bk-drag-favorite${(data.meta.favorite) ? '' : '-o' }`]"
            />
        </section>
        <!-- <div
            class="component-introduction"
            @mouseenter="handleShowIntroduction(data, $event)"
            @mouseleave="handleHideIntroduction">
            <i class="bk-icon icon-info-circle" />
        </div> -->
        <!-- <div
            v-if="publicGroup || favouriteGroup"
            class="favorite-btn"
            v-bk-tooltips="favoriteTips"
            @click.stop="handleClickFavorite(data)">
            <i :class="['bk-drag-icon', `bk-drag-favorite${(data.meta.favorite) ? '' : '-o' }`]"></i>
        </div> -->
        <div style="display: none">
            <div
                ref="introduction"
                class="component-introduction-dialog"
                v-bkloading="{ isLoading: isDiscriptionLoading }">
                <table>
                    <tr>
                        <td class="label">{{ $t('table_来源应用：') }}</td>
                        <td>{{ componentIntroduction.projectName }}</td>
                    </tr>
                    <tr>
                        <td class="label">{{ $t('table_最新版本：') }}</td>
                        <td>{{ componentIntroduction.lastVersion }}</td>
                    </tr>
                    <tr>
                        <td class="label">{{ $t('table_当前版本：') }}</td>
                        <td>{{ componentIntroduction.version }}</td>
                    </tr>
                    <tr>
                        <td class="label">{{ $t('table_上传人：') }}</td>
                        <td>{{ componentIntroduction.updateUser }}</td>
                    </tr>
                    <tr>
                        <td class="label">{{ $t('table_组件简介：') }}</td>
                        <td>{{ componentIntroduction.description }}</td>
                    </tr>
                </table>
            </div>
        </div>
    </div>
    
    <!-- <div
        class="render-drag-item render-custom-component-item"
        :class="{
            [displayClass]: true,
            favorite: data.meta && data.meta.favorite
        }"
        v-bk-tooltips="{
            content: data.displayName,
            disabled: !(data.displayName && data.displayName.length > 8)
        }"
        ref="root">
        <div class="component-icon">
            <i
                class="bk-drag-icon"
                :class="data.icon || 'bk-drag-custom-comp-default'" />
        </div>
        <div class="component-name">
            {{data.displayName}}
        </div>
        <div
            class="component-introduction"
            @mouseenter="handleShowIntroduction(data, $event)"
            @mouseleave="handleHideIntroduction">
            <i class="bk-icon icon-info-circle" />
        </div>
        <div
            v-if="publicGroup || favouriteGroup"
            class="favorite-btn"
            v-bk-tooltips="favoriteTips"
            @click.stop="handleClickFavorite(data)">
            <i :class="['bk-drag-icon', `bk-drag-favorite${(data.meta.favorite) ? '' : '-o' }`]"></i>
        </div>
    </div> -->
</template>
<script>
    import Tippy from 'bk-magic-vue/lib/utils/tippy'

    export default {
        name: '',
        props: {
            data: Object,
            publicGroup: {
                type: Boolean,
                default: false
            },
            favouriteGroup: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                isDiscriptionLoading: false,
                componentIntroduction: {}
            }
        },
        created () {
            this.projectId = parseInt(this.$route.params.projectId)
            this.displayClass = ''
            if (this.data.renderStyles && this.data.renderStyles.display) {
                this.displayClass = this.data.renderStyles.display
            }
            this.favoriteTips = {
                content: (this.data.meta && this.data.meta.favorite) ? window.i18n.t('取消收藏') : window.i18n.t('添加收藏'),
                onShow: () => {
                    const inst = this.$refs.root.tippyInstance
                    inst && inst.hide()
                }
            }
        },
        methods: {
            async handleShowIntroduction (component, event) {
                const componentId = component.meta.id
                const componentVersionId = component.meta.versionId
                this.popperInstance = Tippy(event.target, {
                    placement: 'top-start',
                    trigger: 'manual',
                    theme: 'light custom-component-introduction',
                    hideOnClick: false,
                    animateFill: false,
                    animation: 'slide-toggle',
                    lazy: false,
                    ignoreAttributes: true,
                    boundary: 'window',
                    distance: 20,
                    arrow: true,
                    zIndex: window.__bk_zIndex_manager.nextZIndex()
                })
                this.componentIntroduction = {}
                this.isDiscriptionLoading = true
                this.popperInstance.setContent(this.$refs.introduction)
                this.popperInstance.popperInstance.update()
                this.popperInstance.show()
                try {
                    const [componentData, componentVersionData] = await Promise.all([
                        this.$store.dispatch('components/detail', {
                            id: componentId
                        }),
                        this.$store.dispatch('components/versionDetail', {
                            versionId: componentVersionId
                        })
                    ])
                    if (!this.popperInstance) {
                        return
                    }
                    this.componentIntroduction = Object.freeze({
                        ...componentVersionData,
                        lastVersion: componentData.version
                    })
                    setTimeout(() => {
                        this.popperInstance.popperInstance.update()
                    })
                } finally {
                    this.isDiscriptionLoading = false
                }
            },
            handleHideIntroduction () {
                if (this.popperInstance) {
                    this.popperInstance.hide()
                    this.popperInstance.destroy()
                    this.popperInstance = null
                }
            },
            async handleClickFavorite (component) {
                try {
                    const data = {
                        compId: component.meta.id,
                        projectId: this.projectId
                    }
                    if (component.meta.favorite) {
                        await this.$store.dispatch('components/favoriteDelete', { data })
                        this.messageSuccess(window.i18n.t('取消成功'))
                    } else {
                        await this.$store.dispatch('components/favoriteAdd', { data })
                        this.messageSuccess(window.i18n.t('收藏成功'))
                    }

                    this.$emit('on-favorite')
                } catch (e) {
                    console.error(e)
                }
            },
            handleCreate (newTab) {
                const route = this.$router.resolve({
                    name: 'componentManage',
                    params: {
                        projectId: this.projectId
                    }
                })
                if (newTab) {
                    window.open(route.href, '_blank')
                } else {
                    this.$router.push(route.location)
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .custom-comp-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .flex-container {
            display: flex;
            align-items: center;
        }
        .comp-name {
            width: 58px;
            overflow: hidden;
            white-space: nowrap;
            text-overflow: ellipsis;
            margin-right: 2px;
        }
        .operate-icons i {
            font-size: 12px;
            margin-right: 6px;
        }
        .intro-icon {
            display: none;
            cursor: default;
            margin-right: 4px;
        }
        .bk-drag-favorite-o {
            display: none;
        }
        .favorite-btn {
            cursor: pointer;
        }
        .bk-drag-favorite {
            color: #FFB848;
            &:hover {
                color: #FF9C01;
            }
        }
        &:hover {
            .intro-icon {
                display: inline-block;
            }
            .bk-drag-favorite-o {
                display: inline-block;
                color: #979BA5;
            }

        }
    }
    .render-custom-component-item{
        position: relative;
        &:hover {
            border: 1px solid #3A84FF;
            background: #3A84FF;
            color: #FFF;
            .component-introduction,
            .favorite-btn {
                opacity: 1;
            }
        }
        &.favorite {
            .favorite-btn {
                opacity: 1;
            }
        }
        .component-introduction,
        .favorite-btn {
            position: absolute;
            display: flex;
            align-items: center;
            justify-content: center;
            top: -1px;
            width: 16px;
            height: 16px;
            border-radius: 2px;
            opacity: 0;
            transition: all .125s ease;
            .bk-icon,
            .bk-drag-icon {
                font-size: 12px;
                transform: scale(0.9);
            }
            .bk-drag-favorite {
                color: #FE9C00;
            }
            &:hover {
                background: #0E52C2;
            }
        }
        .component-introduction{
            left: -1px;
            .bk-drag-icon {
                color: #fff;
            }
        }
        .favorite-btn{
            right: -1px;
        }
    }
    .custom-component-introduction-theme, .component-introduction-dialog{
        max-width: 355px;
        min-width: 260px;
        padding-top: 7px !important;
        padding-bottom: 7px !important;
        font-size: 12px;
        color: #63656E;
        td{
            line-height: 30px;
        }
        .label{
            width: 60px;
            vertical-align: top;
            font-weight: bold;
            color: #63656E;
        }
    }
</style>
