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

import block from '../bk/block'
import grid from '../bk/grid'
import freeLayout from '../bk/free-layout'
import h5Container from './h5-container'
import h5Page from './h5-page'

// Basic
import Button from './button'
 
// 其他
const vantComponents = Object.seal([
    h5Page,
    h5Container,
    block,
    grid,
    freeLayout,
    Button
])
 
export default vantComponents
 
export const vantComponentGroupList = Array.from(new Set(vantComponents.map(item => item.group)))
