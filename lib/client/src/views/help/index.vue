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
                                <div class="nav-child"
                                    v-for="child in item.childs"
                                    :class="$route.name === child.name ? 'nav-active' : ''"
                                    :key="child.name"
                                    @click="jump(child.name)">
                                    {{child.title}}
                                </div>
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
                        title: '产品使用文档',
                        name: 'doc',
                        childs: [{
                            title: '产品简介',
                            name: 'intro'
                        }, {
                            title: '快速上手',
                            name: 'start'
                        }]
                    },
                    {
                        title: '布局',
                        name: 'layout',
                        childs: [{
                            title: '栅格布局',
                            name: 'grid'
                        }, {
                            title: '自由布局',
                            name: 'freeLayout'
                        }]
                    },
                    {
                        title: '功能指引',
                        name: 'guide',
                        childs: [{
                            title: '交互式组件使用指引',
                            name: 'interactive'
                        }, {
                            title: '函数使用指引',
                            name: 'method'
                        }, {
                            title: '指令使用指引',
                            name: 'directive'
                        }, {
                            title: '变量使用指引',
                            name: 'variable'
                        }, {
                            title: '布局模板使用指引',
                            name: 'layout-guide'
                        }, {
                            title: '应用模板使用指引',
                            name: 'template-project'
                        }, {
                            title: '页面模板使用指引',
                            name: 'template-page'
                        }, {
                            title: '二次开发指引',
                            name: 'develop'
                        }, {
                            title: '表格查询实战案例',
                            name: 'table-search'
                        }, {
                            title: '自定义组件开发指引',
                            name: 'custom'
                        }]
                    }, {
                        title: '日志',
                        name: 'log',
                        childs: [{
                            title: '发布日志',
                            name: 'changelog'
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
                this.$router.push({
                    name: routeName
                })
            }
        }
    }
</script>

<style lang="postcss">
    @import './index.css';
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

    .container{
        width: 1280px;
        margin: 0 auto;
    }
    
</style>
