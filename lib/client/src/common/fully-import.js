/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

import Vue from 'vue'
import bkMagicVue from 'bk-magic-vue'
import bkText from '@/components/patch/text'
import bkImage from '@/components/patch/image'
import chart from '@/components/patch/chart'
import widgetElTable from '@/components/patch/widget-el-table'
import widgetBkVision from '@/components/patch/widget-bk-vision'
import VueAwesomeSwiper from 'vue-awesome-swiper'

// import style
import 'bk-magic-vue/dist/bk-magic-vue.min.css'
import 'swiper/css/swiper.css'
import bkCharts from '@/components/patch/bkCharts'

Vue.use(VueAwesomeSwiper, {
    height: '800px',
    pagination: {
        el: '.swiper-pagination'
    }
})

Vue.use(bkText)
Vue.use(bkImage)
Vue.use(chart)
Vue.use(bkMagicVue)
Vue.use(bkCharts)
Vue.use(widgetBkVision)
Vue.use(widgetElTable)
