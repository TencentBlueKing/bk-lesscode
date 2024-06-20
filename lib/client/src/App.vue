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
        <not-exist v-if="isNotExist" :message="notExistMsg" />
        <template v-else>
            <apply-page v-if="isNotPermission" :auth-result="authResult" />
            <router-view v-if="!isNotPermission" :name="topView" />
        </template>
    </section>
    <section v-else-if="authed">
        <div id="app" :class="systemCls">
            <notice-component :api-url="noticeUrl" @show-alert-change="showAlertChange" />
            <app-header></app-header>
            <div class="page-body" :style="{ height: bodyHeight }" >
                <not-exist v-if="isNotExist" :message="notExistMsg" />
                <template v-else>
                    <apply-page v-if="isNotPermission" :auth-result="authResult" />
                    <router-view v-if="!isNotPermission" :name="topView" v-show="!mainContentLoading" />
                </template>
            </div>   
        </div>
    </section>
</template>
<script>
    import { mapGetters } from 'vuex'

    import { bus } from './common/bus'
    import ApplyPage from './components/apply-permission/apply-page.vue'
    import NoticeComponent from '@blueking/notice-component-vue2'
    import '@blueking/notice-component-vue2/dist/style.css'

    export default {
        name: 'app',
        components: {
            ApplyPage,
            NoticeComponent
        },
        data () {
            return {
                noticeUrl: `${process.env.BK_AJAX_URL_PREFIX}/notice-center/getNoticeList`,
                systemCls: 'mac',
                position: 'middle',
                navItems: [
                    {
                        icon: 'bk-drag-icon bk-drag-document',
                        text: window.i18n.t('文档'),
                        action: () => {
                            const routerUrl = this.$router.resolve({
                                path: '/help'
                            })
                            window.open(routerUrl.href, '_blank')
                        }
                    },
                    {
                        icon: 'bk-drag-icon bk-drag-comment-fill',
                        text: window.i18n.t('反馈'),
                        action: () => {
                            window.open('https://github.com/TencentBlueKing/bk-lesscode/issues')
                        }
                    }
                ],
                routerNameData: ['/home', '/help'],
                appTabData: [{ name: window.i18n.t('产品介绍'), url: '/', routerName: 'home' }, { name: window.i18n.t('帮助文档'), url: '/help', routerName: 'intro' }],
                isNotPermission: false,
                authResult: {
                    requiredPermissions: []
                },
                isNotExist: false,
                notExistMsg: ''
            }
        },

        computed: {
            ...mapGetters(['mainContentLoading', 'bodyHeight']),
            emptyPage () {
                return this.$route.name === 'preview' || this.$route.name === 'previewTemplate' || this.$route.name === 'previewMobile' || this.$route.meta?.navigation === 'empty'
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
                    this.isNotPermission = false
                    this.isNotExist = false
                },
                immediate: true
            }
        },

        async created () {
            bus.$on('permission-page', this.permissionHold)
            this.$once('hook:beforeDestroy', () => {
                bus.$off('permission-page', this.permissionHold)
            })

            bus.$on('not-exist', this.notExistHold)
            this.$once('hook:beforeDestroy', () => {
                bus.$off('not-exist', this.notExistHold)
            })
            await Promise.all([
                this.$store.dispatch('checkIamNoResourcesPerm'),
                this.$store.dispatch('ai/checkAiAvailable'),
                this.$store.dispatch('saasBackend/checkSaasAvailable')
            ])
        },

        mounted () {
            const platform = window.navigator.platform.toLowerCase()
            if (platform.indexOf('win') === 0) {
                this.systemCls = 'win'
            }
        },
        methods: {
            permissionHold (authResult) {
                this.isNotPermission = true
                this.authResult = authResult
            },

            notExistHold (msg) {
                this.isNotExist = true
                this.notExistMsg = msg
            },

            showAlertChange (isShow) {
                this.$store.commit('updateShowAlertNotice', isShow)
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
        .page-body {
            position: relative;
            overflow-y: hidden;
        }
    }

    .mac {
        /* font-family: PingFang SC, Microsoft Yahei, Helvetica, Aria; */
        font-family: -apple-system, BlinkMacSystemFont, PingFang SC, Microsoft YaHei, Helvetica Neue, Arial;
    }

    input::-webkit-input-placeholder {
        /* placeholder字体大小 */
        font-size: 12px;
    }

    .dialog-footer {
        button + button {
            margin-left: 6px;
        }
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
        z-index: 2000;
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

    .header-small-padding-dialog {
        .bk-dialog-header {
            padding-bottom: 6px;
        }
    }
</style>
