/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2025 Tencent. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

export default {
    name: 'bkvision',
    type: 'widget-bk-vision',
    display: 'none',
    displayName: 'BKVision仪表盘',
    icon: 'bk-drag-histogram',
    group: 'ECharts',
    order: 1,
    events: [],
    styles: [
        {
            name: 'size',
            include: ['width', 'height']
        }
    ],
    renderStyles: {
        width: '100%',
        height: '100%',
        minHeight: '100px'
    },
    props: {
        uid: {
            type: 'request-select',
            payload: {
                url: '/bkvision/shareList',
                key: 'uid',
                value: 'name',
                slotText: '新增仪表盘分享',
                slotLink: process.env.BK_VISION_WEB_URL + '/#/space',
                isGroup: true,
                groupChildren: 'share'
            },
            tips: '图表平台嵌入管理中的仪表盘分享id, 请先到图表平台配置，步骤：<br> 1、选择想要分享的空间或新建空间， 进入空间后新建仪表盘 <br> 2、点击上方嵌入管理、新增嵌入 <br>3、新增时选择想要分享的仪表盘、蓝鲸应用ID选择“当前应用”，并填入“visual-layout”(运维开发平台的应用ID) <br>4、下一步嵌入模式选择“JS-SDK嵌入”， 提交后返回列表页开启发布分享 <br> 5、回到LessCode平台选择所需的分享'
        }
    }
}
