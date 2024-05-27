<!--
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
-->

<template>
    <main :class="['help-main', helpRootCls]">
        <div class="main-container">
            <aside v-show="isShowAside" class="main-left-sidebar">
                <div class="sidebar-panel">
                    <div class="sidebar-bd">
                        <div class="nav-list">
                            <div class="nav-item" v-for="item in navList" :key="item.name">
                                <div class="item-title">{{item.title}}</div>
                                <template v-for="child in item.childs">
                                    <div :key="child.id">
                                        <template v-if="!isSingleTree(child)">
                                            <div class="nav-child"
                                                :title="child.name"
                                                :class="selectDoc === child.id ? 'nav-active' : ''"
                                                @click="jump(child.id)">
                                                {{child.name}}
                                            </div>
                                        </template>
                                        <template v-else>
                                            <bk-big-tree
                                                ext-cls="tree-cls"
                                                ref="trees"
                                                selectable
                                                enable-title-tip
                                                default-expand-all
                                                :default-selected-node="selectDoc"
                                                :data="[child]"
                                                @select-change="handlerSelectTreeData">
                                            </bk-big-tree>
                                        </template>
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <div class="main-content">
                <div v-if="isExistDoc" :class="['container', detailBodyCls]">
                    <components :is="selectDoc" />
                </div>
                <bk-exception v-else type="empty" scene="part" ext-cls="excep-cls">
                    <span>暂无该文档</span>
                </bk-exception>
            </div>
        </div>
    </main>
</template>

<script>
    import { getActualTop } from '@/common/util'
    import { defineComponent, ref, watch, computed, onMounted } from '@vue/composition-api'
    import { useRoute } from '@/router'
    import docComs from './docs'
    export default defineComponent({
        name: 'HelpDocDetail',
        components: {
            ...docComs
        },
        props: {
            selectDoc: {
                type: String,
                default: 'intro'
            },
            isShowAside: {
                type: Boolean,
                default: true
            },
            // 根节点样式添加
            helpRootCls: {
                type: String,
                default: ''
            },
            // 详情外部样式
            detailBodyCls: {
                type: String,
                default: ''
            }
        },
        emits: ['pageSwitchMethod'],
        setup (props, ctx) {
            const navList = [
                {
                    title: window.i18n.t('产品使用文档'),
                    name: 'doc',
                    childs: [{
                        name: window.i18n.t('产品简介'),
                        id: 'intro'
                    }, {
                        name: window.i18n.t('快速上手'),
                        id: 'start'
                    }]
                },
                {
                    title: window.i18n.t('abbr_前端模块开发'),
                    name: 'app',
                    childs: [{
                        name: window.i18n.t('页面开发'),
                        level: 0,
                        id: 'layout',
                        children: [{
                            name: window.i18n.t('页面管理'),
                            level: 1,
                            id: 'pageManage'
                        }, {
                            name: window.i18n.t('画布编辑'),
                            level: 1,
                            id: 'canvasEdit'
                        }, {
                            name: window.i18n.t('栅格布局'),
                            level: 1,
                            id: 'grid'
                        }, {
                            name: window.i18n.t('自由布局'),
                            level: 1,
                            id: 'freeLayout'
                        }, {
                            name: window.i18n.t('移动端页面'),
                            level: 1,
                            id: 'mobilePage'
                        }, {
                            name: window.i18n.t('表单容器跟数据管理容器'),
                            level: 1,
                            id: 'formDataContainer'
                        }, {
                            name: window.i18n.t('画布中函数使用'),
                            level: 1,
                            id: 'functionUsing'
                        }, {
                            name: window.i18n.t('画布中变量使用'),
                            level: 1,
                            id: 'variableUsing'
                        }, {
                            name: window.i18n.t('交互式组件使用'),
                            level: 1,
                            id: 'interactive'
                        }]
                    }, {
                        name: window.i18n.t('路由管理'),
                        id: 'routeManage'
                    }, {
                        name: window.i18n.t('js函数开发'),
                        id: 'method'
                    }, {
                        name: window.i18n.t('变量管理'),
                        id: 'variable'
                    }, {
                        name: window.i18n.t('资源管理'),
                        level: 0,
                        id: 'resource',
                        children: [{
                            name: window.i18n.t('导航布局'),
                            level: 1,
                            id: 'layout-guide'
                        }, {
                            name: window.i18n.t('文件管理'),
                            level: 1,
                            id: 'file'
                        }, {
                            name: window.i18n.t('自定义组件'),
                            level: 1,
                            id: 'custom'
                        }, {
                            name: window.i18n.t('页面模板'),
                            level: 1,
                            id: 'pageTemplate'
                        }, {
                            name: window.i18n.t('API'),
                            level: 1,
                            id: 'api'
                        }]
                    }, {
                        name: window.i18n.t('发布管理'),
                        level: 0,
                        id: 'publication',
                        children: [{
                            name: window.i18n.t('发布部署'),
                            level: 1,
                            id: 'deploy'
                        }, {
                            name: window.i18n.t('版本管理'),
                            level: 1,
                            id: 'version'
                        }]
                    }]
                },
                {
                    title: window.i18n.t('数据源管理'),
                    name: 'data',
                    childs: [{
                        name: window.i18n.t('数据表管理'),
                        id: 'table'
                    }, {
                        name: window.i18n.t('数据操作'),
                        id: 'operation'
                    }]
                },
                {
                    title: window.i18n.t('其他文档'),
                    name: 'other',
                    childs: [{
                        name: window.i18n.t('模板市场'),
                        level: 0,
                        id: 'template',
                        children: [{
                            name: window.i18n.t('应用模板'),
                            level: 1,
                            id: 'template-project'
                        }, {
                            name: window.i18n.t('页面模板'),
                            level: 1,
                            id: 'template-page'
                        }]
                    }, {
                        name: window.i18n.t('实战案例'),
                        level: 0,
                        id: 'exercise',
                        children: [{
                            name: window.i18n.t('表格查询案例'),
                            level: 1,
                            id: 'tableQry'
                        }]
                    }, {
                        name: window.i18n.t('二次开发指引'),
                        id: 'develop'
                    }]
                }
            ]
            
            const jumpAnchor = (anchor) => {
                const node = document.getElementById(anchor)
                if (!node) {
                    document.querySelector('.main-content').scrollTo(0, 0)
                    return
                }
                const top = getActualTop(node)
                this.$nextTick(() => {
                    document.querySelector('.main-content').scrollTo(0, top - 80)
                })
            }
            const route = useRoute()
            const adjustAnchor = () => {
                const hash = route.hash
                const anchor = hash.replace('#/?anchor=', '')
                if (!anchor) {
                    document.querySelector('.main-content').scrollTo(0, 0)
                    return
                }
                setTimeout(() => {
                    jumpAnchor(anchor)
                }, 0)
            }

            const isSingleTree = computed(() => {
                return (child) => {
                    const childrenNodes = child?.children || ''
                    if (!childrenNodes) return false
                    if (!Array.isArray(childrenNodes)) return false
                    return childrenNodes.length > 0
                }
            })

            const isExistDoc = computed(() => {
                const comKeys = Object.keys(docComs)
                const firstCharUp = props.selectDoc?.slice(0, 1).toUpperCase() + props.selectDoc?.slice(1)
                if (comKeys.includes(firstCharUp)) {
                    return true
                }
                return false
            })

            // 切换页面详情时，滚动条位置
            watch(() => props.selectDoc, (newVal, oldVal) => {
                setTreeSelect(props.selectDoc)
                adjustAnchor()
            })

            const trees = ref(null)
            const setTreeSelect = (val) => {
                trees.value.forEach(element => {
                    element.setSelected(val)
                })
            }
            const jump = (routeName) => {
                setTreeSelect(null)
                //  详情切换 方式 由外部决定
                ctx.emit('pageSwitchMethod', routeName)
            }

            const handlerSelectTreeData = (data) => {
                if (data.isLeaf) {
                    // 详情切换 方式 由外部决定
                    ctx.emit('pageSwitchMethod', data.id)
                } else {
                    // 保持一个树下 叶子节点 是选中状态 is-selected
                    data.tree.setSelected(props.selectDoc)
                }
            }

            onMounted(() => {
                adjustAnchor()
                setTimeout(() => {
                    document.querySelector('.nav-list .nav-child.nav-active')?.scrollIntoView()
                }, 0)
            })

            return {
                navList,
                trees,
                jump,
                isSingleTree,
                isExistDoc,
                handlerSelectTreeData
            }
        }
    })
</script>

<style lang="postcss">
    @import './index.css';
    .container{
        width: 1000px;
        margin: 0 auto;
    }
    .tree-cls{
        .bk-big-tree-node{
            padding-left: 20px;
            height: 40px;
            line-height: 40px;
            &:hover {
                background-color: #f0f1f5;
            }
            &.is-root.is-selected {
                background: none;
                .node-content {
                    color: #63656e;
                }
            }
        }
        .is-leaf{
            .node-content{
                padding-left: 20px;
            }
        }
        .is-selected{
            color: #2d8cf0;
            background: #f0faff;
        }
    }
    .nav-list{
        .nav-item{
            .item-title{
                padding-left: 20px;
                padding-bottom: 10px;
                font-weight: 600;
                font-size: 19px;
                color: #313238;
            }
            .nav-child{
                padding-left: 20px;
                font-size: 14px;
                line-height: 40px;
                cursor: pointer;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                .bk-drag-icon {
                    font-size: 24px;
                }
                .name {
                    margin-left: 10px;
                }
                &:hover {
                    background-color: #f0f1f5;
                }
            }
        }
    }
    .excep-cls.bk-exception {
        top: 50%;
        margin-top: -60px;
    }
</style>
