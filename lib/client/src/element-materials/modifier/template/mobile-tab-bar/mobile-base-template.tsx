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

import { defineComponent } from '@vue/composition-api'
import { VNode } from 'vue'
import menuLayout from '../top-menu/base-menu-template'

export default defineComponent({
    components: {
        menuLayout
    },
    props: {
        menuList: Array,
        showIcon: Boolean,
        title: String
    },
    setup (props, { emit }) {
        const changeHandler = (key, value) => {
            emit('change', key, value)
        }
        return { changeHandler }
    },
    render (): VNode {
        return (
            <menuLayout
                menuList={this.menuList}
                menuKey="menuList"
                show-icon={this.showIcon}
                has-child={false}
                platform="MOBILE"
                headerTitle={this.title}
                onChange={this.changeHandler}></menuLayout>
        )
    }
})
