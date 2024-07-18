/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default {
    namespaced: true,
    state: {
        defaultConfig: {
            name: '蓝鲸运维开发平台', // 站点的名称，通常显示在页面左上角，也会出现在网页title中
            nameEn: 'BlueKing LessCode', // 站点的名称-英文
            brandName: '腾讯蓝鲸智云',
            brandNameEn: 'BlueKing',
            appLogo: '/static/images/logo.png', // 站点logo
            favicon: '/static/images/logo.png', // 站点favicon
            version: ''
        },
        platformConfig: {
            bkAppCode: '', // appcode
            name: '', // 站点的名称，通常显示在页面左上角，也会出现在网页title中
            nameEn: '', // 站点的名称-英文
            appLogo: '', // 站点logo
            favicon: '', // 站点favicon
            helperText: '',
            helperTextEn: '',
            helperLink: '',
            brandImg: '',
            brandImgEn: '',
            brandName: '', // 品牌名，会用于拼接在站点名称后面显示在网页title中
            favIcon: '',
            brandNameEn: '', // 品牌名-英文
            footerInfo: '', // 页脚的内容，仅支持 a 的 markdown 内容格式
            footerInfoEn: '', // 页脚的内容-英文
            footerCopyright: '', // 版本信息，包含 version 变量，展示在页脚内容下方
    
            footerInfoHTML: '',
            footerInfoHTMLEn: '',
            footerCopyrightContent: '',
    
            // 需要国际化的字段，根据当前语言cookie自动匹配，页面中应该优先使用这里的字段
            i18n: {
                name: '',
                helperText: '...',
                brandImg: '...',
                brandName: '...',
                footerInfoHTML: '...'
            }
        }
    },
    getters: {
        defaultConfig: state => state.defaultConfig,
        platformConfig: state => state.platformConfig
    },
    mutations: {
        update (state, value) {
            Object.assign(state.platformConfig, value)
        }
    }
}
