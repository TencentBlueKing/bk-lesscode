<template>
    <div class="template-menu-box" :style="styles">
        <i
            :class="{
                'bk-icon': true,
                'icon-down-shape': true,
                'close': !showMenu
            }"
            @click="() => showMenu = !showMenu"
        />
        <div class="menu-item-operate">
            <i class="bk-drag-icon bk-drag-drag-small1 item-drag" />
            <i class="bk-icon icon-close item-remove" :class="{ last: lastOne }" @click="handleRemove"></i>
        </div>
        <menu-edit
            ref="menuEditArea"
            class="menu-edit-area"
            :data="baseInfo"
            :show-menu="showMenu"
            v-bind="$attrs"
            @on-change="handleChange" />
        <div v-if="hasChild && isShowChild && showMenu" class="children-wraper">
            <div
                :class="[
                    'menu-children-box',
                    {
                        'has-query-code': hasQueryCode,
                        'is-page-link': isPageLink
                    }
                ]"
                v-for="(childItem, index) in childList"
                :key="index">
                <menu-edit
                    :data="childItem"
                    @on-change="value => handleChildrenChange(value, index)"
                />
                <div class="menu-children-remove" @click="handleRemoveChildren(index)">
                    <i class="bk-icon icon-minus-circle" />
                </div>
            </div>
        </div>
        <div v-if="hasChild" class="menu-children-create" @click="handleAddChildren">
            <i class="bk-icon icon-plus-circle" v-bk-tooltips="{ content: $t('添加二级导航'), placement: 'top' }" />
        </div>
    </div>
</template>
<script>
    import { generatorMenu } from '../../../../../../../shared/util'
    import MenuEdit from './edit'

    export default {
        components: {
            MenuEdit
        },
        inheritAttrs: false,
        props: {
            data: {
                type: Object,
                required: true
            },
            lastOne: {
                type: Boolean,
                default: false
            },
            hasChild: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                showMenu: true,
                baseInfo: generatorMenu(),
                childList: []
            }
        },
        computed: {
            isShowChild () {
                return this.childList.length > 0
            },
            styles () {
                if (!this.hasChild) {
                    return {
                        padding: '1px 20px 16px 28px'
                    }
                }
                return {
                    padding: '1px 37px 16px 28px'
                }
            },
            hasQueryCode () {
                return this.$refs.menuEditArea?.isShowPageQuery
            },
            isPageLink () {
                return !this.$refs.menuEditArea?.isPageCode
            }
        },
        created () {
            this.baseInfo = Object.freeze({ ...this.data })
            this.childList = Object.freeze(this.data.children || [])
        },
        methods: {
            triggerChange () {
                this.$emit('on-change', {
                    ...this.baseInfo,
                    children: this.childList
                })
            },
            handleChange (value) {
                this.baseInfo = value
                this.triggerChange()
            },
            handleChildrenChange (value, index) {
                const childList = [...this.childList]
                childList.splice(index, 1, value)
                this.childList = childList
                this.triggerChange()
            },
            handleAddChildren () {
                const childList = [...this.childList]
                childList.push(generatorMenu())
                this.childList = childList
                this.triggerChange()
            },
            handleRemoveChildren (index) {
                const childList = [...this.childList]
                childList.splice(index, 1)
                this.childList = childList
                this.triggerChange()
            },
            handleRemove () {
                if (this.lastOne) {
                    this.messageError(this.$t('模板导航不能为空'))
                    return
                }
                this.$emit('on-delete')
            }
        }
    }
</script>
<style lang='postcss'>
    .template-menu-box{
        position: relative;
        background: #F5F7FA;
        border-radius: 2px;
        transition: all .15s;
        &:hover{
            box-shadow: 0px 2px 4px 0px rgba(0,0,0,0.2);
            .menu-item-operate {
                display: block;
            }
        }
        &:nth-child(n + 2) {
            margin-top: 10px;
        }
        .icon-down-shape {
            position: absolute;
            top: 24px;
            left: 8px;
            color: #979BA5;
            transition: transform 200ms;
            cursor: pointer;
            &.close {
                transform: rotate(-90deg);
            }
        }
        .menu-edit-area {
            margin-top: 16px;
        }
        .menu-item-operate {
            position: absolute;
            right: 0px;
            color: #979BA5;
            display: none;
            font-size: 20px;
            margin-top: -3px;
            .item-remove {
                cursor: pointer;
                &:hover {
                    color: #63656E;
                }
                &.last{
                    color: #EA3636;
                }
            }
            .item-drag {
                cursor: move;
                padding-left: 220px;
                margin-right: -8px;
            }
        }
        .menu-children-box{
            position: relative;
            padding-top: 6px;
            padding-left: 20px;
            &:before{
                content: '';
                position: absolute;
                top: -70px;
                left: 4px;
                bottom: 0;
                width: 1px;
                background: #DCDEE5;
            }
            &:last-child{
                &:before{
                    content: '';
                    position: absolute;
                    bottom: unset;
                    height: 92px;
                }
            }
            .menu-name{
                position: relative;
                &:before{
                    content: '';
                    position: absolute;
                    top: 50%;
                    left: 0;
                    width: 16px;
                    height: 1px;
                    background: #DCDEE5;
                    transform: translate(-100%, -50%);
                }
            }
            &.has-query-code {
                &:before {
                    top: -80px;
                }
                &:last-child::before {
                    height: 102px;
                }
            }
            &.is-page-link {
                &:before {
                    top: -40px;
                }
                &:last-child::before {
                    height: 62px;
                }
            }
        }
        .menu-children-create{
            position: absolute;
            top: 25px;
            right: 12px;
            display: flex;
            font-size: 16px;
            color: #979BA5;
            cursor: pointer;
        }
        .menu-children-remove{
            position: absolute;
            top: 14px;
            right: -28px;
            display: flex;
            font-size: 16px;
            color: #979BA5;
            cursor: pointer;
        }
    }
</style>
