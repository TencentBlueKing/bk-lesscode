<template>
    <div class="drag-group-box">
        <div class="group-name" @click="handleToggle" v-bk-tooltips="{ content: groupName,disabled: !(groupName && groupName.length > 17),width: 400 }">
            <i
                class="bk-drag-icon bk-drag-arrow-down toggle-arrow"
                :class="{
                    floded: isFolded
                }" />
            <span>{{ groupName }}</span>
            <div v-if="$slots.tag">
                <slot name="tag" />
            </div>
        </div>
        <template v-if="!isFolded">
            <bk-exception
                v-if="list.length < 1"
                class="group-list-empty"
                type="empty"
                scene="part">
                <span>暂无数据</span>
            </bk-exception>
            <vue-draggable
                v-else
                :options="dragOptions"
                class="list-wrap"
                :list="list"
                :sort="false"
                :group="dragGroup"
                :force-fallback="false"
                ghost-class="source-ghost"
                chosen-class="source-chosen"
                drag-class="source-drag"
                :clone="cloneFunc"
                @choose="handleChoose($event, group)">
                <slot />
            </vue-draggable>
        </template>
    </div>
</template>
<script>
    import { mapGetters } from 'vuex'
    import LC from '@/element-materials/core'
    import * as createHacker from './hacker'
    
    export default {
        props: {
            list: Array,
            // 分组展示名
            groupName: String,
            // 如果设置了 group
            // 则该 group-box 下所有拖拽组件统一为配置的 group 值
            // 为空，通过组件 type 动态计算 group 的值
            group: String,
            // 选中组件时的回调
            createFallback: Function,
            dragOptions: {
                type: Object,
                default: () => ({})
            },
            folded: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                dragGroup: {
                    name: 'component',
                    pull: 'clone',
                    put: false
                },
                isFolded: false
            }
        },
        computed: {
            ...mapGetters('components', [
                'curNameMap'
            ])
        },
        created () {
            this.newNode = null
            this.isFolded = this.folded
        },
        methods: {
            handleToggle () {
                this.isFolded = !this.isFolded
            },
            /**
             * @desc 左侧组件列表区域拖拽 choose 回调函数
             * @param {Object} event 事件对象
             */
            handleChoose (event) {
                if (typeof this.createFallback === 'function') {
                    this.newNode = this.createFallback(this.list, event.oldIndex)
                } else {
                    const materialConfig = this.list[event.oldIndex]
                    const node = LC.createNode(materialConfig.type)

                    Object.values(createHacker).forEach(task => task(node, materialConfig))

                    // 自定义组件
                    if (this.curNameMap[node.type]) {
                        node.setProperty('isCustomComponent', true)
                    }
                    // 交互式组件
                    if (LC.isInteractiveType(node.type)) {
                        node.setProperty('isInteractiveComponent', true)
                    }
                    this.newNode = node
                }
                
                let groupName = ''
                
                if (LC.isLayoutType(this.newNode.type)) {
                    groupName = 'layout'
                } else if (LC.isInteractiveType(this.newNode.type)) {
                    groupName = 'interactive'
                } else {
                    groupName = 'component'
                }

                this.dragGroup = Object.freeze({
                    ...this.dragGroup,
                    name: groupName
                })
            },
            cloneFunc () {
                return this.newNode
            }
            
        }
    }
</script>

<style lang="postcss">
    .side-panel {
        position: relative;
        height: 100%;
        box-shadow: 1px 0 0 0 #DCDEE5;
        z-index: 1;
    }

    .panel-title {
        padding: 0 16px;
        height: 44px;
        line-height: 44px;
        font-size: 14px;
        background: #ffffff;
        border-top: 1px solid #dcdee5;
        border-bottom: 1px solid #dcdee5;
    }

    .fields-list-container {
        height: calc(100% - 56px);
        overflow: hidden;
        width: 100%;
        background: #FFFFFF;
        box-shadow: 1px 0 0 0 #DCDEE5;
    }

    .drag-group-box {
        .group-name {
            padding: 0 7px;
            height: 40px;
            font-size: 12px;
            color: #313238;
            font-weight: Bold;
            position: relative;
            display: flex;
            align-items: center;
            border-top: 1px solid #dde4eb;
            &:hover{
                cursor: pointer;
            }
            .toggle-arrow {
                display: block;
                line-height: 40px;
                font-size: 24px;
                color: #63656E;
                transition: all .1s linear;
                margin-right: 8px;
                &.floded {
                    transform: rotate(-90deg);
                }
            }
            span {
                display: block;
                line-height: 40px;
            }
            .group-tag {
                margin-left: 6px;
                font-size: 12px;
                font-weight: normal;
                padding: 2px 4px;
                color: #3A84FF;
                background: #F0F5FF;
                border-radius: 2px;
            }
        }

        .list-wrap {
            display: flex;
            /* justify-content: space-between; */
            flex-flow: row wrap;
            padding-left: 10px;
            &.disabled {
                .field-item {
                    cursor: inherit;;
                }
            }
        }

        .field-item {
            margin: 0 8px 8px 0;
            padding: 0 4px 0 12px;
            width: 134px;
            height: 32px;
            line-height: 32px;
            color: #63656e;
            background: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 4px;
            cursor: move;
            user-select: none;
            font-size: 0;
            span{
                font-size: 12px;
            }
            &:not(.not-available):hover {
                color: #3a84ff;
                border-color: #3a84ff;
            }
            &.not-available {
                color: #c4c6cc;
                border-color: #dcdee5;
                cursor: not-allowed;
            }
        }
    }

    .comp-icon {
        font-size: 16px;
        padding-right: 6px;
    }

    .drag-group-box {
        user-select: none;
        & ~ .drag-group-box{
            margin-top: 8px;
        }
        .group-list-empty{
            padding: 0 0 12px;
            .part-img{
                height: 72px;
            }
            .part-text {
                font-size: 12px;
                margin-top: -8px;
            }
        }
        .group-content{
            display: flex;
            flex-wrap: wrap;
            .render-drag-item{
                position: relative;
                width: 60px;
                height: 68px;
                text-align: center;
                color: #979BA5;
                border: 1px solid #DCDEE5;
                border-radius: 2px;
                background: #FAFBFD;
                margin-top: 10px;
                margin-left: 12px;
                cursor: pointer;
                &:hover{
                    border: 1px solid #3a84ff;
                    background: #3a84ff;
                    color: #fff;
                }
                .component-icon{
                    margin: 11px 0 2px 0;
                }
                .component-name{
                    font-size: 12px;
                    padding: 0 5px;
                    margin-top: 1px;
                    width: 100%;
                    overflow: hidden;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    display: -webkit-box;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: normal;
                    word-break: break-all;
                }
            }
            .render-drag-icon-item{
                width: 36px;
                height: 36px;
                margin-left: 12px;
                margin-top: 10px;
                background-color: #fafbfd;
                color: #979ba5;
                text-align: center;
                font-size: 16px;
                line-height: 36px;
                cursor: pointer;
                &:hover{
                    background: #3a84ff;
                    color: #fff;
                }
            }
        }
    }
</style>
