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
    <section v-if="emptyPage" class="preview-page">
        <router-view :name="topView" />
    </section>
    <section v-else-if="authed">
        <div id="app" :class="systemCls">
            <home-header v-if="homeHeaderNav"></home-header>
            <app-header v-else></app-header>
            <router-view :name="topView" v-show="!mainContentLoading" />
        </div>
        <bk-fixed-navbar
            :ext-cls="hasFooterBar ? 'nav-footer-bar' : 'no-footer-bar'"
            :style="showFixedNavBar ? 'transform: translateY(-50%); opacity: 1' : 'transform: translateY(100%); opacity: 0'"
            :position="position"
            :nav-items="navItems"></bk-fixed-navbar>
        <div class="nav-icon" @click="toggerNavbar" :class="hasFooterBar ? 'nav-icon-footer' : 'nav-icon-bottom'">
            <i class="bk-drag-icon bk-drag-arrow-down toggle-arrow" :class="showFixedNavBar ? 'nav-icon-down' : 'nav-icon-up'" />
        </div>
    </section>
</template>
<script>
    import { mapGetters } from 'vuex'

    import { bus } from './common/bus'

    export default {
        name: 'app',

        data () {
            return {
                systemCls: 'mac',
                position: 'middle',
                navItems: [
                    {
                        icon: 'bk-drag-icon bk-drag-document',
                        text: '文档',
                        action: () => {
                            const routerUrl = this.$router.resolve({
                                path: '/help'
                            })
                            window.open(routerUrl.href, '_blank')
                        }
                    },
                    {
                        icon: 'bk-drag-icon bk-drag-comment-fill',
                        text: '反馈',
                        action: () => {
                            window.open('https://github.com/TencentBlueKing/bk-lesscode/issues')
                        }
                    }
                ],
                routerNameData: ['/home', '/help'],
                homeHeaderNav: true,
                appTabData: [{ name: '产品介绍', url: '/', routerName: 'home' }, { name: '帮助文档', url: '/help', routerName: 'intro' }],
                hasFooterBar: false,
                showFixedNavBar: true
            }
        },

        computed: {
            ...mapGetters(['mainContentLoading']),
            emptyPage () {
                return this.$route.name === 'preview' || this.$route.name === 'previewTemplate' || this.$route.name === 'previewMobile'
            },
            authed () {
                return this.$route.meta.authed
            },
            topView () {
                const topRoute = this.$route.matched[0]
                return (topRoute && topRoute.meta.view) || 'default'
            },
            isCanvas () {
                return this.$route.name === 'new'
            }
        },

        watch: {
            '$route': {
                handler (value) {
                    if (value.matched[0]) {
                        this.$nextTick(() => {
                            this.hasFooterBar = !!document.getElementsByClassName('footer').length
                        })
                        this.homeHeaderNav = this.routerNameData.includes(value.matched[0].path) || this.routerNameData.includes(value.fullPath + value.name)
                    }
                },
                immediate: true
            }
        },

        async created () {
            await this.$store.dispatch('isPlatformAdmin')
        },

        mounted () {
            const platform = window.navigator.platform.toLowerCase()
            if (platform.indexOf('win') === 0) {
                this.systemCls = 'win'
            }
            bus.$on('redirect-login', data => {
                window.location.replace(data.loginUrl)
            })
        },
        methods: {
            toggerNavbar () {
                this.showFixedNavBar = !this.showFixedNavBar
            }
        }
    }
</script>

<style lang="postcss">
    @import './css/reset.css';
    @import './css/common.css';
    @import './css/bk-patch.css';
    @import "@/css/mixins/scroller";

    body {
        background-color: #fafbfd;
        @mixin scroller;
    }

    #app {
        width: 100%;
        height: 100%;
        overflow-y: hidden;
        @mixin scroller;
        font-size: 14px;
        color: #63656e;
    }

    .mac {
        /* font-family: PingFang SC, Microsoft Yahei, Helvetica, Aria; */
        font-family: -apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, Helvetica Neue, Arial;
    }

    .bk-fixed-navbar-wrapper {
        z-index: 9999;
    }

    .nav-footer-bar.middle {
        transition:transform .5s, opacity .5s;
        top: auto;
        bottom: 1%;
    }

    .no-footer-bar.middle {
        transition:transform .5s, opacity .5s;
        top: auto;
        bottom: -3%;
    }

    .nav-icon{
        z-index: 2009;
        position: fixed;
        right: 10px;
        width: 52px;
        height: 20px;
        background: #3A84FF;
        box-shadow: 0 -2px 8px 0 rgba(0,0,0,0.12);
        border-radius: 15px 15px 0 0;
        bottom: 50px;
        text-align: center;
        color: #fff;
        font-size: 24px;
        cursor: pointer;
        i {
            position: absolute;
            top: -1px;
            left: 14px;
            transition:transform 0.5s;
        }
        .nav-icon-down{
            transform: rotate(0deg);
        }
        .nav-icon-up{
            transform: rotate(180deg);
        }
    }

    .nav-icon-footer{
        bottom: 50px;
    }

    .nav-icon-bottom{
        bottom: 0px;
    }

    .win {
        /* font-family: Microsoft Yahei, PingFang SC, Helvetica, Aria; */
        font-family: -apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, Helvetica Neue, Arial;
    }

    .red-point {
        display:block;
        margin-left: 3px;
        background:#f00;
        border-radius:50%;
        width:6px;
        height:6px;
    }
</style>
