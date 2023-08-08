/**
  Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
  Copyright (C) 2017-2019 THL A29 Limited, a Tencent company. All rights reserved.
  Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
  You may obtain a copy of the License at
  http://opensource.org/licenses/MIT
  Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
  an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
  specific language governing permissions and limitations under the License.
*/

import LC from '@/element-materials/core'

const createRootMenu = () => [
    {
        name: window.i18n.t('粘贴'),
        disabled: !LC.execCommand('copy', false), // 没有执行复制操作不允许执行粘贴操作
        action: () => {
            const copyNode = LC.execCommand('copy', false).cloneNode()
            copyNode.setStyle({
                position: '',
                top: '',
                right: '',
                bottom: '',
                left: '',
                marginTop: '',
                marginRight: '',
                marginBottom: '',
                marginLeft: ''
            })
            LC.getRoot().appendChild(copyNode)
        }
    },
    {
        name: window.i18n.t('插入行'),
        action: () => {
            const blockNode = LC.createNode('render-block')
            LC.getRoot().appendChild(blockNode)
        }
    },
    {
        name: window.i18n.t('插入多列'),
        action: () => {
            const renderGridNode = LC.createNode('render-grid')
            LC.getRoot().appendChild(renderGridNode)
        }
    },
    {
        name: window.i18n.t('插入自由布局'),
        action: () => {
            const freeLayoutNode = LC.createNode('free-layout')
            LC.getRoot().appendChild(freeLayoutNode)
        }
    },
    {
        name: window.i18n.t('清空画布'),
        action: () => {
            LC.reset()
        }
    }
]

export default () => {
    const activeNode = LC.getActiveNode()

    // 没有选中组件，操作目标画布根节点
    if (!activeNode) {
        return createRootMenu()
    }
    const list = []

    // render-column 不支持复制
    if (activeNode.type !== 'render-column') {
        list.push({
            name: window.i18n.t('复制'),
            key: 'Ctrl + C',
            command: 'copy'
        })
        list.push({
            name: window.i18n.t('剪切'),
            key: 'Ctrl + X',
            command: 'cut'
        })
    }
    // 支持复制操作的组件
    if ([
        'render-column',
        'render-block',
        'free-layout',
        'h5-page'
    ].includes(activeNode.type)) {
        list.push({
            name: window.i18n.t('粘贴'),
            key: 'Ctrl + V',
            command: 'paste',
            disabled: !LC.execCommand('copy', false) // 没有执行复制操作不允许执行粘贴操作
        })
    }
    // 添加列
    if (activeNode.type === 'render-column') {
        list.push({
            name: window.i18n.t('新增一列'),
            action: () => {
                activeNode.parentNode.insertAfter(LC.createNode('render-column'), activeNode)
            }
        })
    }
    // 添加行
    if (activeNode.type === 'render-grid') {
        list.push({
            name: window.i18n.t('新增一行'),
            action: () => {
                const gridNode = LC.createNode('render-grid', false)
                activeNode.children.forEach(() => {
                    gridNode.appendChild(LC.createNode('render-column'))
                })
                activeNode.parentNode.insertAfter(gridNode, activeNode)
            }
        })
    }
    // 支持清空操作的组件
    if ([
        'render-column',
        'render-block',
        'free-layout',
        'h5-page'
    ].includes(activeNode.type)) {
        list.push({
            name: window.i18n.t('清空'),
            command: 'clearLayout',
            disabled: activeNode.children.length < 1
        })
    }

    let removeDisabled = false
    if (activeNode.type === 'render-column') {
        removeDisabled = activeNode.parentNode.children.length <= 1
    }

    if (activeNode.parentNode?.type === 'free-layout') {
        list.push({
            name: window.i18n.t('上移一层'),
            action: () => {
                const zIndex = ~~activeNode.style['z-index']
                activeNode.setStyle({
                    zIndex: zIndex + 1
                })
            }
        })
        list.push({
            name: window.i18n.t('下移一层'),
            action: () => {
                const zIndex = ~~activeNode.style['z-index']
                activeNode.setStyle({
                    zIndex: zIndex - 1
                })
            }
        })
    }
    
    list.push({
        name: window.i18n.t('删除'),
        key: 'Del',
        command: 'remove',
        disabled: removeDisabled
    })

    return list
}
