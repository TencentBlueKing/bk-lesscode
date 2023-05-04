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

import alert from './alert'
import animateNumber from './animate-number'
import badge from './badge'
import block from './block'
import breadCrumb from './bread-crumb'
import button from './button'
import card from './card'
import cascader from './cascader'
import checkbox from './checkbox'
import checkboxGroup from './checkbox-group'
// import codeDiff from './code-diff'
// import collapse from './collapse'
import colorPicker from './color-picker'
import datePicker from './date-picker'
import dialog from './dialog'
import divider from './divider'
import exception from './exception'
import form from './form'
import freeLayout from './free-layout'
import grid from './grid'
import icon from './icon'
// import image from './image'
import input from './input'
import link from './link'
import pagination from './pagination'
import popover from './popover'
import process from './process'
import progress from './progress'
import radio from './radio'
import rate from './rate'
import searchSelect from './search-select'
import sideslider from './sideslider'
import slider from './slider'
import steps from './steps'
import swiper from './swiper'
import switcher from './switcher'
import tab from './tab'
import table from './table'
import tagInput from './tag-input'
import timePicker from './time-picker'
import timeline from './timeline'
import transfer from './transfer'
import tree from './tree'
import upload from './upload'

// 这个对象里组件的顺序与页面左侧待选组件区的顺序一致，从左至右，从上至下
// 是为了要保证 Array.from(new Set(bkComponents.map(item => item.group))) 得到的结果是
// ['布局', '基础', '表单', '导航', '数据', '反馈', '图表']
const bkComponents = Object.seal([
    alert,
    animateNumber,
    badge,
    block,
    breadCrumb,
    button,
    card,
    cascader,
    checkbox,
    checkboxGroup,
    // codeDiff,
    // collapse,
    colorPicker,
    datePicker,
    dialog,
    divider,
    exception,
    form,
    freeLayout,
    grid,
    icon,
    // image,
    input,
    link,
    pagination,
    popover,
    process,
    progress,
    radio,
    rate,
    searchSelect,
    sideslider,
    slider,
    steps,
    swiper,
    switcher,
    tab,
    table,
    tagInput,
    timePicker,
    timeline,
    transfer,
    tree,
    upload
])

export default bkComponents

export const bkComponentGroupList = Object.keys(bkComponents.reduce((result, item) => {
    if (item.group) {
        result[item.group] = true
    }
    return result
}, {}))
