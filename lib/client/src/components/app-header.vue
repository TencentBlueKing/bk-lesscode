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
    <header class="app-header">
        <div class="logo" @click="toProjectList">
            <img src="../images/logo.png" alt="logo">
            {{ $t('蓝鲸可视化开发平台') }} </div>
        <nav class="top-nav">
            <ul class="menu">
                <router-link
                    v-for="(menu, index) in menus"
                    custom
                    :to="menu.to"
                    :key="index"
                    v-slot="{ href, route, navigate, isActive }">
                    <li :class="['menu-item', { active: isActive || isMenuActive(route) }]">
                        <a :href="href" @click="navigate">{{menu.name}}</a>
                    </li>
                </router-link>
            </ul>
        </nav>
        <div class="top-info">
            <bk-popover class="info-item"
                theme="light header-top-info-popover"
                animation="fade"
                placement="bottom-end"
                :arrow="false"
                :distance="5"
                :tippy-options="{
                    animateFill: false,
                    hideOnClick: false
                }">
                <div :class="['info-language']">
                    <i :class="`bk-icon icon-${currentLang === 'en' ? 'english' : 'chinese'} language-icon`"></i>
                </div>
                <template slot="content">
                    <a
                        v-for="(lang) in languageList"
                        :key="lang.id"
                        class="popover-link"
                        @click="handleLanguageChange(lang)"
                    >
                        <i :class="`bk-icon icon-${lang.icon} language-icon`"></i>{{ lang.name }}
                    </a>
                </template>
            </bk-popover>
            <bk-popover class="info-item"
                theme="light header-top-info-popover"
                animation="fade"
                placement="bottom-end"
                :arrow="false"
                :distance="5"
                :tippy-options="{
                    animateFill: false,
                    hideOnClick: false
                }">
                <div :class="['info-help', { active: isRouteContains('help', $route) }]">
                    <svg class="bk-icon" style="width: 1em; height: 1em;vertical-align: middle;fill: currentColor;overflow: hidden;" viewBox="0 0 64 64" version="1.1" xmlns="http://www.w3.org/2000/svg">
                        <path d="M32,4C16.5,4,4,16.5,4,32c0,3.6,0.7,7.1,2,10.4V56c0,1.1,0.9,2,2,2h13.6C36,63.7,52.3,56.8,58,42.4S56.8,11.7,42.4,6C39.1,4.7,35.6,4,32,4z M31.3,45.1c-1.7,0-3-1.3-3-3s1.3-3,3-3c1.7,0,3,1.3,3,3S33,45.1,31.3,45.1z M36.7,31.7c-2.3,1.3-3,2.2-3,3.9v0.9H29v-1c-0.2-2.8,0.7-4.4,3.2-5.8c2.3-1.4,3-2.2,3-3.8s-1.3-2.8-3.3-2.8c-1.8-0.1-3.3,1.2-3.5,3c0,0.1,0,0.1,0,0.2h-4.8c0.1-4.4,3.1-7.4,8.5-7.4c5,0,8.3,2.8,8.3,6.9C40.5,28.4,39.2,30.3,36.7,31.7z"></path>
                    </svg>
                </div>
                <template slot="content">
                    <router-link custom exact to="/help" v-slot="{ href, isActive }">
                        <a :class="['popover-link', { active: isActive }]" target="_blank" :href="href">{{ $t('产品文档') }}</a>
                    </router-link>
                    <a class="popover-link" href="javascript:;" @click="log.changeIsShow()">{{ $t('版本日志') }}</a>
                    <a class="popover-link" target="_blank" href="https://github.com/TencentBlueKing/bk-lesscode/issues">{{ $t('问题反馈') }}</a>
                    <a class="popover-link" target="_blank" href="https://github.com/TencentBlueKing/bk-lesscode/blob/master/readme.md">{{ $t('开源社区') }}</a>
                </template>
            </bk-popover>
            <bk-popover class="info-item"
                theme="light header-top-info-popover"
                animation="fade"
                placement="bottom-end"
                :arrow="false"
                :distance="5"
                :tippy-options="{
                    animateFill: false,
                    hideOnClick: false
                }">
                <div class="info-user">
                    <div>{{userName}}</div>
                    <i class="bk-drag-icon bk-drag-angle-up-fill"></i>
                </div>
                <template slot="content">
                    <a class="popover-link" href="javascript:void(0)"
                        @click="goLogin">
                        {{ $t('退出登录') }} </a>
                </template>
            </bk-popover>
        </div>
        <changelog ref="log"></changelog>
    </header>
</template>

<script>
    import { defineComponent, computed, ref } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRouter } from '@/router'
    import { IAM_ACTION } from 'shared/constant'
    import changelog from '@/components/changelog-version'
    import jsCookie from 'js-cookie'

    export default defineComponent({
        components: {
            changelog
        },
        computed: {
            currentRoute () {
                return this.$route
            }
        },

        setup () {
            const languageList = [
                {
                    id: 'zhCN',
                    name: '中文',
                    icon: 'chinese'
                },
                {
                    id: 'en',
                    name: 'English',
                    icon: 'english'
                }
            ]
            const store = useStore()
            const router = useRouter()
            const log = ref()
            const iamNoResourcesPerm = computed(() => store.getters['iamNoResourcesPerm'])
            
            const user = computed(() => store.getters['user'])
            const userName = computed(() => user.value?.username ?? '')
            const menus = computed(() => {
                const list = [
                    {
                        to: '/home',
                        name: window.i18n.t('产品介绍'),
                        authed: true
                    },
                    {
                        to: '/projects',
                        name: window.i18n.t('应用开发'),
                        authed: true
                    },
                    {
                        to: '/marketplace',
                        name: window.i18n.t('资源市场'),
                        authed: true
                    },
                    {
                        to: '/op',
                        name: window.i18n.t('运营数据'),
                        authed: iamNoResourcesPerm.value[IAM_ACTION.view_operation_data[0]]
                    }
                ]

                return list.filter(item => item.authed)
            })
            const currentLang = computed(() => jsCookie.get('blueking_language') || 'zh-cn')

            const isMenuActive = (route) => {
                const [topRoute] = router.currentRoute.matched
                return route.name === topRoute?.meta?.owner
            }

            const isRouteContains = (path, currentRoute) => {
                const paths = path.split(',')
                return currentRoute?.matched?.some(route => paths.some(p => route.path.startsWith(`/${p}`)))
            }

            const goLogin = () => {
                window.location.href = user.value.loginRedirectUrl + '&c_url=' + encodeURIComponent(window.location.href)
            }

            const toProjectList = () => {
                router.push({
                    name: 'projects'
                })
            }

            /** 语言切换 */
            const handleLanguageChange = (lang) => {
                const domainList = location.hostname.split('.')

                // 本项目开发环境因为需要配置了 host 域名比联调环境多 1 级
                if (process.env.NODE_ENV === 'development') {
                    domainList.splice(0, 1)
                }

                // handle duplicate cookie names
                for (let i = 0; i < domainList.length - 1; i++) {
                    jsCookie.remove('blueking_language', {
                        domain: domainList.slice(i).join('.')
                    })
                }

                jsCookie.set('blueking_language', lang.id, {
                    expires: 30,
                    // 和平台保持一致，cookie 种在上级域名
                    domain: domainList.length > 2 ? domainList.slice(1).join('.') : domainList.join('.')
                })

                window.location.reload()
            }

            return {
                languageList,
                userName,
                menus,
                log,
                isMenuActive,
                isRouteContains,
                goLogin,
                toProjectList,
                currentLang,
                handleLanguageChange
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .app-header {
        display: flex;
        position: fixed;
        height: 52px;
        width: 100%;
        min-width: 1280px;
        padding: 0 16px;
        top: 0;
        z-index: 1000;
        background: #182132;

        .logo {
            display: flex;
            align-items: center;
            cursor: pointer;
            color: #EAEBF0;
            font-size: 16px;
            text-decoration: none;
            white-space: nowrap;

            img {
                width: 32px;
                margin-right: 12px;
            }
        }

        .top-nav {
            margin-left: 58px;
            .menu {
                display: flex;
                height: 100%;

                .menu-item {
                    margin: 0 20px;

                    a {
                        display: flex;
                        align-items: center;
                        height: 100%;
                        font-size: 14px;
                        color: #96A2B9;
                        white-space: nowrap;

                        &:hover {
                            color: #d3d9e4;
                        }
                    }

                    &.active {
                        a {
                            color: #fff;
                        }
                    }
                }
            }
        }

        .top-info {
            display: flex;
            align-items: center;
            margin-left: auto;

            .info-item {
                cursor: pointer;
                margin-left: 16px;
            }

            .info-language {
                i {
                    font-size: 18px;
                    color: #979aa5;
                }
            }

            .info-help {
                display: flex;
                align-items: center;
                justify-content: center;
                height: 32px;
                width: 32px;
                color: #768197;
                font-size: 16px;
                position: relative;

                &:hover,
                &.active {
                    background: linear-gradient(270deg,rgba(37, 48, 71, 1) 0%,rgba(38, 50, 71, 1) 100%);
                    border-radius: 100%;
                    color: #D3D9E4;
                }
            }
            .info-user {
                display: flex;
                align-items: center;
                height: 32px;
                color: #96A2B9;
                margin-top: -1px;

                &:hover {
                    color: #D3D9E4;
                }

                .bk-drag-icon {
                    font-size: 12px;
                    margin-left: 4px;
                    margin-top: 2px;
                }
            }
        }
       
    }

    .header-top-info-popover-theme {
        .popover-link {
            display: block;
            padding: 8px 12px;
            font-size: 12px;
            color: #63656E;
            cursor: pointer;

            &:hover,
            &.active {
                color:#3A84FF;
                background: #F0F1F5;
            }

            .language-icon {
                margin-right: 4px;
                font-size: 16px;
            }
        }
    }

</style>
<style>
    .tippy-tooltip.header-top-info-popover-theme {
        padding: 4px 0 !important;
        overflow: hidden;
        border-radius: 2px !important;
        background: #FFFFFF;
        border: 1px solid #DCDEE5;
        box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.10);
    }
    
</style>
