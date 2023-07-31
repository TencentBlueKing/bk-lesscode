export const oldPrompt = () => {
    return [
        {
            role: 'user',
            content: '新增一个bk-table组件'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "create",
                    "target": "",
                    "content": {
                        "type": "bk-table"
                    }
                }]
            `
        },
        // 样式
        {
            role: 'user',
            content: '修改table-9c893组件的样式display为block,color为红色'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "edit",
                    "target": "table-9c893",
                    "content": {
                        "renderStyles": {
                            "display": "block",
                            "color": "red"
                        }
                    }
                }]
            `
        },
        // 属性
        {
            role: 'user',
            content: '修改button-9c893组件的 title 属性为 你好，AI'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "edit",
                    "target": "button-9c893",
                    "content": {
                        "renderProps": {
                            "title": {
                                "format": "value",
                                "code": "你好，AI",
                                "renderValue": "你好，AI",
                                "valueType": "string",
                                "payload": {}
                            }
                        }
                    }
                }]
            `
        },
        {
            role: 'user',
            content: '修改button-9c893组件的title属性为dd变量'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "edit",
                    "target": "button-9c893",
                    "content": {
                        "renderProps": {
                            "title": {
                                "format": "variable",
                                "code": "dd",
                                "renderValue": "你好，AI",
                                "valueType": "string",
                                "payload": {}
                            }
                        }
                    }
                }]
            `
        },
        // 事件
        {
            role: 'user',
            content: '设置table-9c893组件的select事件为alert函数'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "edit",
                    "target": "table-9c893",
                    "content": {
                        "renderEvents": {
                            "select": {
                                "enable": true,
                                "methodCode": "alert",
                                "params": []
                            }
                        }
                    }
                }]
            `
        },
        // 指令
        {
            role: 'user',
            content: '设置table-9c893组件的v-for指令为qq变量'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "edit",
                    "target": "table-9c893",
                    "content": {
                        "renderDirectives": [
                            {
                                "type": "v-for",
                                "prop": "",
                                "format": "variable",
                                "code": "qq",
                                "renderValue": [
                                    "Jack",
                                    "Lucy",
                                    "Lily"
                                ]
                            }
                        ]
                    }
                }]
            `
        },
        {
            role: 'user',
            content: '设置table-9c893组件的v-for指令为page表'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "edit",
                    "target": "table-9c893",
                    "content": {
                        "renderDirectives": [
                            {
                                "type": "v-for",
                                "prop": "",
                                "format": "dataSource",
                                "code": "page",
                                "renderValue": [],
                                "dataSourceType": "preview"
                            }
                        ]
                    }
                }]
            `
        },
        // 函数
        {
            role: 'user',
            content: '修改table-9c893组件的数据源为 alert 函数'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "edit",
                    "target": "table-9c893",
                    "content": {
                        "renderProps": {
                            "data": {
                                "format": "value",
                                "code": [
                                    1,
                                    23
                                ],
                                "valueType": "remote",
                                "payload": {
                                    "methodCode": "alert",
                                    "params": []
                                }
                            }
                        }
                    }
                }]
            `
        },
        // 数据源
        {
            role: 'user',
            content: '修改table-9c893组件的数据源为page表'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "edit",
                    "target": "table-9c893",
                    "content": {
                        "renderProps": {
                            "data": {
                                "format": "value",
                                "code": [],
                                "valueType": "table-data-source",
                                "payload": {
                                    "sourceData": {
                                        "tableName": "page",
                                        "dataSourceType": "preview",
                                        "showOperationColumn": true
                                    }
                                }
                            }
                        }
                    }
                }]
            `
        },
        {
            role: 'user',
            content: '关联table-9c893组件和page表'
        },
        {
            role: 'assistant',
            content: `
                [{
                    "type": "edit",
                    "target": "table-9c893",
                    "content": {
                        "renderProps": {
                            "data": {
                                "format": "value",
                                "code": [],
                                "valueType": "table-data-source",
                                "payload": {
                                    "sourceData": {
                                        "tableName": "page",
                                        "dataSourceType": "preview",
                                        "showOperationColumn": true
                                    }
                                }
                            }
                        }
                    }
                }]
            `
        }
    ]
}

export const methodPrompt = () => {

}

export const layoutPrompt = () => {
    return [
        {
            role: 'user',
            content: 'help me solve this task:\n帮我新增一个按钮组件'
        },
        {
            role: 'assistant',
            content: [
                '好的，我们需要创建一个按钮组件，我看看我们有哪些适合的组件',
                '```',
                'cmd: <component.all()>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'You can use these component type:',
                '- bk-button (基础按钮)',
                'Note: before inserting or updating a component, use `component.get("<componentType>")` to learn how to write configuration.'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '看起来我们有 bk-button 按钮组件，现在新增并选中 bk-button 按钮组件',
                '```',
                'cmd: <component.insert("bk-button", "button-a0001")>',
                'cmd: <component.select("button-a0001")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'Inserted and selected',
                'Have you finished the task? If so, call `done()`. Otherwise please continue."'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '任务已完成',
                '```',
                'cmd: <done()>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: 'help me solve this task:\n帮我新增一个表格组件，用来展示page表的所有数据'
        },
        {
            role: 'assistant',
            content: [
                '好的，首先我们需要创建一个表格组件，用来展示page表的所有数据，我看看我们有哪些适合的组件',
                '```',
                'cmd: <component.all()>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'You can use these component type:',
                '- widget-bk-table (表格)',
                'Note: before inserting or updating a component, use `component.get("<componentType>")` to learn how to write configuration.'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '看起来我们有widget-bk-table表格组件来展示page表的数据，现在新增并选中widget-bk-table表格组件，并设置widget-bk-table组件展示page表的数据',
                '```',
                'cmd: <component.insert("widget-bk-table", "table-a0002")>',
                'cmd: <component.select("table-a0002")>',
                'cmd: <component.connect("table-a0002", "page")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'Inserted and selected and connected',
                'Have you finished the task? If so, call `done()`. Otherwise please continue."'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '任务已完成',
                '```',
                'cmd: <done()>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: 'help me solve this task:\n帮我画一个商城首页，需要轮播展示商品，表格展示数据'
        },
        {
            role: 'assistant',
            content: [
                '好的，首先我们需要创建一个轮播图组件，用来轮播展示商品，我看看我们有哪些适合的组件',
                '```',
                'cmd: <component.all()>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'You can use these component type:',
                '- bk-swiper (轮播图)',
                'Note: before inserting or updating a component, use `component.get("<componentType>")` to learn how to write configuration.'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '看起来我们有 bk-swiper 组件来轮播展示商品，我看看轮播图组件的完整配置',
                '```',
                'cmd: <component.get("bk-swiper")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'The complete configuration of the bk-swiper component is as follows:',
                'type: \'bk-swiper\'',
                'props: {}',
                'Note: you can use \'component.insert("<componentType>", "<componentId>")\' to insert bk-swiper component.'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '现在新增并选中 bk-swiper 轮播图组件',
                '```',
                'cmd: <component.insert("bk-swiper", "swiper-a0003")>',
                'cmd: <component.select("swiper-a0003")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'Inserted and selected',
                'Have you finished the task? If so, call `done()`. Otherwise please continue."'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '出于美观考虑，我们设置轮播图组件的宽度为 100%',
                '```',
                'cmd: <component.setStyle("swiper-a0003", "width", "100%")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'The style has been successfully set.',
                'Have you finished the task? If so, call `done()`. Otherwise please continue."'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '接下来我将在这个轮播图组件后添加表格组件。看起来 widget-bk-table 组件可以用来展示数据，我看看 widget-bk-table 组件的完整配置',
                '```',
                'cmd: <component.get("widget-bk-table")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'The complete configuration of the widget-bk-table component is as follows:',
                'type: \'widget-bk-table\'',
                'props: {}'

            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '现在新增并选中 widget-bk-table 表格组件',
                '```',
                'cmd: <component.insert("widget-bk-table", "table-a0004")>',
                'cmd: <component.select("table-a0004")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'Inserted and selected',
                'Have you finished the task? If so, call `done()`. Otherwise please continue."'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '任务已完成',
                '```',
                'cmd: <done()>',
                '```'
            ].join('\n')
        }
    ]
}
