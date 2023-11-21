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
import mobileBaseTemplate from './mobile-base-template'

export default defineComponent({
    components: {
        mobileBaseTemplate
    },
    props: {
        menuList: Array
    },
    setup (props, { emit }) {
        const changeHandler = (key, value) => {
            emit('on-change', key, value)
        }
        return { changeHandler }
    },
    render (): VNode {
        return (
            <mobileBaseTemplate
                onChange={this.changeHandler}
                menuList={this.menuList}
                title={window.i18n.t('移动端导航配置')}
                show-icon={true}></mobileBaseTemplate>
        )
    }
})
