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
import vanGrid from './grid'

import paragraph from './paragraph'

// Basic
import Button from './button'
import Cell from './cell'
import Icon from './icon'
import Image from './image'
// import Calendar from './calendar'

// import calendar from './calendar'
 
// Form
import Switch from './switch'
import CheckboxGroup from './check-box-group'
import DatetimePicker from './date-time-picker'
import Field from './field'
// import NumberKeyboard from './number-keyboard'
// import PasswordInput from './password-input'
import Picker from './picker'
import RadioGroup from './radio-group'
import Rate from './rate'
import Stepper from './stepper'
import Slider from './slider'
import Search from './search'
 
// 数据
import Tag from './tag'
import Skeleton from './skeleton'
import Progress from './progress'
import NoticeBar from './notice-bar'
import Empty from './empty'
import Divider from './divider'
import CountDown from './count-down'
import Circle from './circle'
import Badge from './badge'
 
// 反馈

import Loading from './loading'
 
// 导航
// import TreeSelect from './tree-select'
import Pagination from './pagination'
import Navbar from './navbar'
import Steps from './steps'
import Tab from './tab'
import WidgetTab from './widget-tab'
import WidgetTabPanel from './widget-tab-panel'
 
// 其他
import luckyCanvas from './lucky-canvas'
 
const vantComponents = Object.seal([
    h5Page,
    h5Container,
    block,
    grid,
    freeLayout,
    paragraph,
    Button,
    Cell,
    Icon,
    Image,
    CheckboxGroup,
    DatetimePicker,
    Field,
    // NumberKeyboard,
    // PasswordInput,
    Picker,
    RadioGroup,
    Rate,
    // TreeSelect,
    Pagination,
    Navbar,
    Tag,
    Skeleton,
    Progress,
    NoticeBar,
    Empty,
    Divider,
    CountDown,
    Circle,
    // Calendar,
    Loading,
    Badge,
    Switch,
    Steps,
    Stepper,
    Slider,
    Search,
    Tab,
    vanGrid,
    WidgetTab,
    WidgetTabPanel,
    luckyCanvas
])
 
export default vantComponents
 
export const vantComponentGroupList = Array.from(new Set(vantComponents.map(item => item.group)))
