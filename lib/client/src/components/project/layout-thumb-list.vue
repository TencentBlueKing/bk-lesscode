<template>
    <ul class="layout-thumb-list">
        <li v-for="layout in list" :key="layout.id"
            :class="['list-item', { 'from-project': fromProject, checked: layout.checked, disabled: layout.disabled }]"
            @click="handleClickItem(layout)">
            <span v-if="layout.isDefault" class="default-tag checked">{{ $t('默认') }}</span>
            <span v-else-if="toolkit.includes('setdefault') && layout.layoutType !== 'MOBILE'" class="default-tag setting" @click.stop="handleSetDefault(layout)">{{ $t('设为默认') }}</span>
            <div class="checkbox">
                <i class="bk-icon icon-check-1 checked-icon"></i>
            </div>
            <div class="layout-img">
                <img :src="getPreviewImg(layout)" v-if="layout.type !== 'empty' && layout.type !== 'mobile-empty'" />
                <div class="empty-navigation-img"></div>
            </div>
            <div class="layout-footer">
                <div class="layout-label" v-if="layout.type !== 'empty' && layout.type !== 'mobile-empty' && layout.projectId">
                    <div class="layout-name" :title="layout.defaultName">
                        {{ $t(layout.defaultName) }}
                    </div>
                    <div class="layout-preview" @click.prevent.stop="handlePreview(layout)">
                        {{ $t('预览') }}
                    </div>
                </div>
                <div v-else class="layout-empty-name" :title="$t(layout.defaultName)">
                    {{ $t(layout.defaultName) }}
                </div>
            </div>
            
        </li>
    </ul>
</template>

<script>
    import store from '@/store'

    export default {
        props: {
            list: {
                type: Array,
                default: () => ([])
            },
            fromProject: {
                type: Boolean,
                default: false
            },
            toolkit: {
                type: Array,
                default: () => ([
                    'select',
                    'setdefault'
                ])
            }
        },
        methods: {
            handleClickItem (layout) {
                if (layout.disabled || !this.toolkit.includes('select')) {
                    return
                }
                this.$emit('change-checked', layout)
            },
            handleSetDefault (layout) {
                if (!this.toolkit.includes('setdefault')) {
                    return
                }
                this.$emit('set-default', layout)
            },
            getPreviewImg (layout) {
                const previewImg = `layout/preview-${layout.type}-s.png`
                return require(`@/images/${previewImg}`)
            },
            handlePreview (layout) {
                window.open(`/preview-template/project/${layout.projectId}/${layout.id}?type=nav-template&framework=${store.getters['project/projectDetail'].framework}`, '_blank')
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/mixins/ellipsis";

    .layout-thumb-list {
        display: flex;
        flex-wrap: wrap;
    
        .list-item {
            position: relative;
            flex: none;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            width: 174px;
            height: 120px;
            background: #F5F7FA;
            border-radius: 2px;
            cursor: pointer;
            margin-right: 6px;
            margin-bottom: 10px;

            &:hover {
                background: #F0F5FF;

                .layout-preview {
                    display: block;
                }
                .layout-footer {
                    background-color: #E1ECFF;
                }
            }

            &.checked {
                background: #F0F5FF;
                .checkbox {
                    display: block;
                }

                .layout-footer {
                    background-color: #E1ECFF;
                    color: #3A84FF;
                }

                &:hover {
                    .default-tag {
                        &.setting {
                            display: block;
                        }
                    }

                    .layout-preview {
                        display: none;
                    }
                }
            }

            &.disabled {
                background: #F5F7FA;
                cursor: not-allowed;
                .checkbox {
                    border-color: transparent transparent #C4C6CC transparent;
                }
                .layout-footer {
                    background-color: #EAEBF0;
                    color: #979BA5;;
                }
            }

            .default-tag {
                position: absolute;
                right: 0;
                top: 0;
                height: 18px;
                line-height: 18px;
                border-radius: 2px;
                font-size: 12px;
                color: #fff;
                padding: 0 5px;

                &.checked {
                    background: #FFB848;
                }
                &.setting {
                    display: none;
                    background: #699DF4;
                    cursor: pointer;
                }
            }
            .checkbox {
                display: none;
                position: absolute;
                right: -1px;
                bottom: -1px;
                border-style: solid;
                border-width: 0 0 30px 34px;
                border-color: transparent transparent #3A84FF transparent;
                .checked-icon {
                    position: absolute;
                    left: -20px;
                    top: 10px;
                    color: #fff;
                    font-size: 20px;
                }
            }

            .layout-img {
                margin: 6px 6px 0;
                width: 160px;
                height: 84px;
                img {
                    width: 100%;
                    height: 100%;
                }
                .empty-navigation-img {
                    width: 100%;
                    height: 100%;
                    background-color: #fff;
                }
            }

            .layout-footer {
                width: 100%;
                font-size: 12px;
                color: #979BA5;
                line-height: 24px;
                margin-top: 6px;
                background: #EAEBF0;
                color: #979BA5;
            }

            .layout-empty-name {
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 0 6px;
                font-size: 12px;
                line-height: 24px;
            }

            .layout-label {
                width: 100%;
                padding: 0 6px;
                display: flex;
                justify-content: space-between;
                font-size: 12px;
                .layout-name {
                    width: 110px;
                    @mixin ellipsis 100%, block;
                }

                .layout-preview {
                    font-size: 12px;
                    color: #3a84ff;
                    cursor: pointer;
                    display: none;
                }
            }
        }
        .list-item.from-project {
            &:nth-of-type(2n) {
                margin-right: 0;
            }
        }
    }
</style>
