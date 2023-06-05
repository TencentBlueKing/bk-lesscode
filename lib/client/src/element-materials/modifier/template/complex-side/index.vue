<template>
    <div class="project-complex-side-menu-modifier">
        <div class="top-menu-info">
            <div>
                <span class="label">{{ localTopMenu.name || '--' }}</span>
                <!-- <span class="bk-icon icon-delete"></span> -->
            </div>
            <!-- <div class="top-menu-action">
                <bk-button size="small" @click="handleRemoveTopMenu">删除</bk-button>
            </div> -->
        </div>
        <div class="wraper" :key="menuActive">
            <div class="complex-action-title side-menu-title">
                <div class="info-title" @click="() => showContent = !showContent">
                    <i
                        :class="{
                            'bk-icon icon-angle-down': true,
                            close: !showContent
                        }"
                    ></i>
                    <span>{{ $t('开启侧边导航') }}</span>
                </div>
                <div class="info-content" v-if="showContent">
                    <bk-switcher
                        v-bk-tooltips="hasSideMenu ? $t('清空侧边导航') : $t('添加侧边导航')"
                        size="small"
                        theme="primary"
                        :value="hasSideMenu"
                        @change="handleCreateSideMenu"
                    />
                </div>
            </div>
            <div class="side-menu-wraper" v-if="hasSideMenu">
                <div class="info-title" @click="() => showMenuContent = !showMenuContent">
                    <i
                        :class="{
                            'bk-icon icon-angle-down': true,
                            close: !showMenuContent
                        }"
                    ></i>
                    <span>{{ $t('导航菜单') }}</span>
                </div>
                <vue-draggable
                    v-if="showMenuContent"
                    class="group-list"
                    ghost-class="menu-ghost-item"
                    :list="localSideMenu"
                    handle=".item-drag"
                    @change="triggerChange"
                    :group="{ name: 'complex-top-col' }">
                    <transition-group type="transition" :name="'flip-list'">
                        <menu-item
                            v-for="(menu, index) in localSideMenu"
                            :key="`${menu.id}`"
                            show-icon
                            :data="menu"
                            :last-one="localTopMenu.length === 1"
                            @on-delete="handleSideMenuRemove(index)"
                            @on-change="value => handleSideMenuChange(value, index)" />
                    </transition-group>
                </vue-draggable>
            </div>
            <div v-if="hasSideMenu && showMenuContent" class="footer">
                <bk-button size="small" text @click="handleAddSideMenu">{{ $t('继续添加') }}</bk-button>
            </div>
        </div>
    </div>
</template>
<script>
    import _ from 'lodash'
    import { generatorMenu } from '../../../../../../shared/util'
    import MenuItem from '../editor/menu'

    export default {
        name: '',
        components: {
            MenuItem
        },
        inheritAttrs: false,
        props: {
            topMenuList: {
                type: Array,
                default: () => []
            },
            menuActive: {
                type: [Number, String],
                required: true
            }
        },
        data () {
            return {
                localTopMenu: {},
                localSideMenu: [],
                hasSideMenu: false,
                showContent: true,
                showMenuContent: true
            }
        },
        watch: {
            topMenuList: {
                handler  () {
                    this.init()
                },
                immediate: true
            },
            menuActive: {
                handler  () {
                    this.init()
                },
                immediate: true
            }
        },
        methods: {
            init () {
                const currentTopMenu = _.find(this.topMenuList, _ => _.id === this.menuActive)
                this.localTopMenu = currentTopMenu
                this.localSideMenu = [...currentTopMenu.children || []]
                this.hasSideMenu = this.localSideMenu.length > 0
            },
            triggerChange () {
                const currentTopMenuIndex = _.findIndex(this.topMenuList, _ => _.id === this.menuActive)
                const topMenuList = [...this.topMenuList]
                topMenuList.splice(currentTopMenuIndex, 1, {
                    ...this.localTopMenu,
                    children: this.localSideMenu
                })
                this.$emit('on-change', 'topMenuList', topMenuList)
            },
            handleRemoveTopMenu () {
                const currentTopMenuIndex = _.findIndex(this.topMenuList, _ => _.id === this.menuActive)
                const topMenuList = [...this.topMenuList]
                topMenuList.splice(currentTopMenuIndex, 1)
                this.$emit('on-change', 'topMenuList', topMenuList)
            },
            handleTopMenuChange (value) {
                this.localTopMenu = value
                this.triggerChange()
            },
            handleCreateSideMenu () {
                if (!this.hasSideMenu) {
                    this.hasSideMenu = true
                    const localSideMenu = [...this.localSideMenu]
                    localSideMenu.push(generatorMenu())
                    this.localSideMenu = localSideMenu
                } else {
                    this.hasSideMenu = false
                    this.localSideMenu = []
                }
                this.triggerChange()
            },
            handleAddSideMenu () {
                const localSideMenu = [...this.localSideMenu]
                localSideMenu.push(generatorMenu())
                this.localSideMenu = localSideMenu
                this.triggerChange()
            },
            handleSideMenuChange (value, index) {
                const localSideMenu = [...this.localSideMenu]
                localSideMenu.splice(index, 1, value)
                this.localSideMenu = localSideMenu
                this.triggerChange()
            },

            handleSideMenuRemove (index) {
                const localSideMenu = [...this.localSideMenu]
                localSideMenu.splice(index, 1)
                this.localSideMenu = localSideMenu
                this.triggerChange()
            }
        }
    }
</script>
<style lang='postcss'>
    @import "@/css/mixins/scroller";

    .project-complex-side-menu-modifier{
        .top-menu-info{
            padding: 12px 0;
            font-size: 14px;
            line-height: 17px;
            text-align: center;
            border-bottom: 1px solid #EAEBF0;
            .label {
                color: #313238;
            }
            .bk-icon {
                margin-left: 12px;
                font-size: 12px;
                cursor: pointer;
            }
        }
        .wraper {
            padding: 0 12px;
        }
        .top-menu-action{
            margin-top: 10px;
        }
        .side-menu-title{
            border-bottom: 1px solid #EAEBF0;
        }
        .info-title {
            display: flex;
            align-items: center;
            height: 40px;
            font-size: 12px;
            font-weight: bold;
            color: #313238;
            cursor: pointer;
            .bk-icon {
                margin-left: -5px;
                margin-right: 3px;
                font-size: 20px;
                color: #63656E;
                display: inline-block;
                transition: transform 200ms;
                cursor: pointer;
                &.close {
                    transform: rotate(-90deg);
                }
            }
        }
        .info-content {
            width: 100%;
            margin: 4px 0 16px;
        }
        .side-menu-wraper{
            margin-bottom:  10px;
        }
        .footer {
            padding-bottom: 20px;
        }
    }
</style>
