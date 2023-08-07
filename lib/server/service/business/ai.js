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
    const firstTableId = 'jdhr1'
    const tableId = 'hg74b'
    const swiperId = 'n78gp'
    const swiperTableId = 'm8gbw'
    return [
        {
            role: 'user',
            content: 'help me solve this task:\n帮我新增一个表格'
        },
        {
            role: 'assistant',
            content: [
                '好的，我们需要创建一个表格组件，我看看我们有哪些适合的组件',
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
                '- render-column (列)',
                'Note: before inserting or updating a component, use `component.get("<componentType>")` to learn how to write configuration.'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '看起来我们有很多适合的组件可以用来创建表格，比如widget-bk-table、render-column等。由于您没有特殊指明需要用哪个组件，我将默认采用第一种组件，现在将使用默认配置新增并选中表格组件(widget-bk-table)',
                '```',
                `cmd: <component.insert("widget-bk-table", "table-${firstTableId}")>`,
                `cmd: <component.select("table-${firstTableId}")>`,
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
                `任务已完成，已为您新增了表格组件（table-${firstTableId}）`,
                '```',
                'cmd: <done()>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: 'help me solve this task:\n给按钮组件（button-xyz12）添加点击事件，打印“我被点击了”'
        },
        {
            role: 'assistant',
            content: [
                '好的，我现在给按钮添加点击事件',
                '```',
                'cmd: <component.setEvent("button-xyz12", "click", "handleClick",  "console.log(\'我被点击了\')") >',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'The event has been successfully set.',
                'Have you finished the task? If so, call `done()`. Otherwise please continue."'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '任务已完成，已为按钮组件（button-xyz12）添加点击事件',
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
                '看起来我们有表格组件(widget-bk-table)来展示page表的数据，现在新增并选中表格组件(widget-bk-table)，并设置表格组件(widget-bk-table)展示page表的数据',
                '```',
                `cmd: <component.insert("widget-bk-table", "table-${tableId}")>`,
                `cmd: <component.select("table-${tableId}")>`,
                `cmd: <component.connect("table-${tableId}", "page")>`,
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
                `任务已完成，已为您新增了表格组件（table-${tableId}）`,
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
                '看起来我们有轮播图组件(bk-swiper)来轮播展示商品，我看看轮播图组件的完整配置',
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
                '由于您没有特殊指明需要设置的配置，现在将使用默认配置新增并选中轮播图组件(bk-swiper)',
                '```',
                `cmd: <component.insert("bk-swiper", "swiper-${swiperId}")>`,
                `cmd: <component.select("swiper-${swiperId}")>`,
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
                `cmd: <component.setStyle("swiper-${swiperId}", "width", "100%")>`,
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
                '接下来我将使用表格展示数据。看起来表格组件(widget-bk-table)可以用来展示数据，我看看表格组件(widget-bk-table)的完整配置',
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
                '由于您没有特殊指明需要设置的配置，现在将使用默认配置新增并选中表格组件(widget-bk-table)',
                '```',
                `cmd: <component.insert("widget-bk-table", "table-${swiperTableId}")>`,
                `cmd: <component.select("table-${swiperTableId}")>`,
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
                `任务已完成，已为您新增轮播图组件（swiper-${swiperId}）和表格组件（table-${swiperTableId}）`,
                '```',
                'cmd: <done()>',
                '```'
            ].join('\n')
        }
    ]
}
