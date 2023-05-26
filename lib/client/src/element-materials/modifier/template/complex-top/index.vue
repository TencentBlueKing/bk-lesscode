<template>
    <div class="project-complex-top-menu-modifier">
        <div class="menu-title" @click="() => showContent = !showContent">
            <i
                :class="{
                    'bk-icon icon-angle-down': true,
                    close: !showContent
                }"
            ></i>
            <span>{{ $t('导航菜单') }}</span>
        </div>
        <template v-if="showContent">
            <div class="menu-wraper">
                <vue-draggable
                    class="group-list"
                    ghost-class="menu-ghost-item"
                    :list="localMenuList"
                    handle=".item-drag"
                    @change="triggerChange"
                    :group="{ name: 'cpmplex-top-col' }">
                    <transition-group type="transition" :name="'flip-list'">
                        <menu-item
                            v-for="(menu, index) in localMenuList"
                            :key="`${menu.id}`"
                            :data="menu"
                            :last-one="localMenuList.length === 1"
                            :has-child="false"
                            @on-delete="handleRemove(index)"
                            @on-change="value => handleChange(value, index)" />
                    </transition-group>
                </vue-draggable>
            </div>
            <div class="footer">
                <bk-button size="small" text @click="handleAdd">{{ $t('继续添加') }}</bk-button>
            </div>
        </template>
    </div>
</template>
<script>
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
            }
        },
        data () {
            return {
                showContent: true,
                localMenuList: []
            }
        },
        watch: {
            topMenuList: {
                handler  (menuList) {
                    this.localMenuList = menuList
                },
                immediate: true
            }
        },
        methods: {
            triggerChange () {
                this.$emit('on-change', 'topMenuList', this.localMenuList)
            },
            handleAdd () {
                this.localMenuList.push(generatorMenu())
                this.triggerChange()
            },
            handleChange (value, index) {
                this.localMenuList.splice(index, 1, value)
                this.triggerChange()
            },
            handleRemove (index) {
                const localMenuList = [...this.localMenuList]
                localMenuList.splice(index, 1)
                this.localMenuList = localMenuList
                this.triggerChange()
            }
        }
    }
</script>
<style lang='postcss'>
    @import "@/css/mixins/scroller";

    .project-complex-top-menu-modifier {
        .menu-title {
            display: flex;
            align-items: center;
            height: 40px;
            font-size: 12px;
            font-weight: bold;
            color: #313238;
            margin-bottom: 0;
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
        .menu-wraper{
            margin-bottom:  10px;
        }
        .footer {
            padding-bottom: 20px;
        }
    }
</style>
