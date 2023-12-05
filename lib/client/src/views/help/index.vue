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
    <main class="help-main">
        <div class="main-container">
            <aside class="main-left-sidebar">
                <div class="sidebar-panel">
                    <div class="sidebar-bd">
                        <div class="nav-list">
                            <div class="nav-item" v-for="item in navList" :key="item.name">
                                <div class="item-title">{{item.title}}</div>
                                <template v-if="item.tree">
                                    <bk-big-tree
                                        ext-cls="tree-cls"
                                        ref="trees"
                                        selectable
                                        enable-title-tip
                                        default-expand-all
                                        :data="item.childs"
                                        @select-change="handlerSelectTreeData">
                                    </bk-big-tree>
                                </template>
                                <template v-else>
                                    <div class="nav-child"
                                        v-for="child in item.childs"
                                        :class="$route.name === child.name ? 'nav-active' : ''"
                                        :key="child.name"
                                        @click="jump(child.name)">
                                        {{child.title}}
                                    </div>
                                </template>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <div class="main-content">
                <div class="container">
                    <router-view :key="$route.path"></router-view>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
    import { getActualTop } from '@/common/util'

    export default {
        data () {
            return {
                navList: [
                    {
                        title: window.i18n.t('产品使用文档'),
                        name: 'doc',
                        childs: [{
                            title: window.i18n.t('产品简介'),
                            name: 'intro'
                        }, {
                            title: window.i18n.t('快速上手'),
                            name: 'start'
                        }]
                    },
                    {
                        title: window.i18n.t('abbr_应用开发'),
                        name: 'app',
                        tree: true,
                        childs: [{
                            name: window.i18n.t('页面布局'),
                            level: 0,
                            id: 'layout',
                            children: [{
                                name: window.i18n.t('栅格布局'),
                                level: 1,
                                id: 'grid'
                            }, {
                                name: window.i18n.t('自由布局'),
                                level: 1,
                                id: 'freeLayout'
                            }, {
                                name: window.i18n.t('导航布局'),
                                level: 1,
                                id: 'layout-guide'
                            }]
                        }, {
                            name: window.i18n.t('页面画布'),
                            level: 0,
                            id: 'canvas',
                            children: [{
                                name: window.i18n.t('变量使用指引'),
                                level: 1,
                                id: 'variable'
                            }, {
                                name: window.i18n.t('组件指令使用指引'),
                                level: 1,
                                id: 'directive'
                            }, {
                                name: window.i18n.t('交互式组件使用指引'),
                                level: 1,
                                id: 'interactive'
                            }]
                        }, {
                            name: window.i18n.t('交互函数'),
                            level: 0,
                            id: 'function',
                            children: [{
                                name: window.i18n.t('函数使用指引'),
                                level: 1,
                                id: 'method'
                            }]
                        }, {
                            name: window.i18n.t('二次开发指引'),
                            level: 0,
                            id: 'develop'
                        }, {
                            name: window.i18n.t('自定义组件开发指引'),
                            level: 0,
                            id: 'custom'
                        }]
                    },
                    {
                        title: window.i18n.t('模板市场'),
                        name: 'template',
                        childs: [{
                            title: window.i18n.t('应用模板使用指引'),
                            name: 'template-project'
                        }, {
                            title: window.i18n.t('页面模板使用指引'),
                            name: 'template-page'
                        }]
                    }
                ]
            }
        },
        watch: {
            '$route' (to, from) {
                this.adjustAnchor()
            }
        },
        mounted () {
            this.adjustAnchor()

            setTimeout(() => {
                document.querySelector('.nav-list .nav-child.nav-active')?.scrollIntoView()
            }, 0)
        },
        methods: {
            adjustAnchor () {
                const hash = this.$route.hash
                const anchor = hash.replace('#/?anchor=', '')
                if (!anchor) {
                    document.querySelector('.main-content').scrollTo(0, 0)
                    return
                }
                setTimeout(() => {
                    this.jumpAnchor(anchor)
                }, 0)
            },

            jumpAnchor (anchor) {
                const node = document.getElementById(anchor)
                if (!node) {
                    document.querySelector('.main-content').scrollTo(0, 0)
                    return
                }
                const top = getActualTop(node)
                this.$nextTick(() => {
                    document.querySelector('.main-content').scrollTo(0, top - 80)
                })
            },

            /**
             * 切换帮助文档内的 router
             *
             * @param {string} routeName routeName
             */
            jump (routeName) {
                this.$refs.trees[0].setSelected(null)
                this.$router.push({
                    name: routeName
                })
            },

            handlerSelectTreeData (data) {
                if (data.isLeaf) {
                    this.$router.push({
                        name: data.id
                    })
                }
            }
        }
    }
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

</style>
