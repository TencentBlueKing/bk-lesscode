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

import block from './block'
import grid from './grid'
import column from './column'
import freeLayout from './free-layout'
import button from './button'

// 这个对象里组件的顺序与页面左侧待选组件区的顺序一致，从左至右，从上至下
// 是为了要保证 Array.from(new Set(bkComponents.map(item => item.group))) 得到的结果是
// ['布局', '基础', '表单', '导航', '数据', '反馈', '图表']
const bkComponents = Object.seal([
    block,
    grid,
    column,
    freeLayout,
    button
])

export default bkComponents

export const bkComponentGroupList = Object.keys(bkComponents.reduce((result, item) => {
    if (item.group) {
        result[item.group] = true
    }
    return result
}, {}))
