export const layoutPrompt = () => {
    const firstTableId = 'jdhr1'
    const tableId = 'hg74b'
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
                '- render-column (列)'
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
            content: 'help me solve this task:\n给按钮组件（button-xyz12）的点击事件绑定函数 handleClick'
        },
        {
            role: 'assistant',
            content: [
                '好的，我现在给按钮点击事件绑定 handleClick 函数',
                '```',
                'cmd: <component.setEvent("button-xyz12", "click", "handleClick")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'Updating the click event of the component failed. The function handleClick does not exist. please rethink and issue commands'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '看起来函数库并不存在handleClick函数。你可以尝试说“查询函数库”后再执行该任务',
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
                '好的，首先我们需要新增或者更新 handleButtonXyz12Click 函数，函数内部执行"打印“我被点击了”"。然后将 handleButtonXyz12Click 函数绑定到按钮组件（button-xyz12）的点击事件上',
                '```',
                'cmd: <method.createOrUpdate("handleButtonXyz12Click", "console.log(\'我被点击了\')")>',
                'cmd: <component.setEvent("button-xyz12", "click", "handleButtonXyz12Click")>',
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
                '- widget-bk-table (表格)'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '看起来我们有表格组件(widget-bk-table)来展示page表的数据，现在新增并选中表格组件(widget-bk-table)，并设置表格组件(widget-bk-table)展示page表的数据',
                '```',
                `cmd: <component.insert("widget-bk-table", "table-${tableId}")>`,
                `cmd: <component.select("table-${tableId}")>`,
                `cmd: <dataSource.table("table-${tableId}", "page")>`,
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
            content: 'help me solve this task:\n修改table-3f357第一个表头的名称为234'
        },
        {
            role: 'assistant',
            content: [
                '好的，对于修改表格组件(table-3f357)的表头名称，我们需要首先获取其配置信息以了解如何设置',
                '```',
                'cmd: <component.getInfo("table-3f357")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'The complete rendering configuration of the table-3f357 component is as follows:',
                '{componentId: "table-3f357",renderSlots:{default:{format: "value",component:"bk-table-column",payload: {},valueType: "table-list",code: [{ "label": "第一列", "prop": "prop1", "sortable": false, "filterable": false, "type": "" }],renderValue: [{ "label": "第一列", "prop": "prop1", "sortable": false, "filterable": false, "type": "" }]}}}}'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '好的，我们需要修改table-3f357的default slot，将第一列的"label"值由"第一列"修改为"234"',
                '```',
                'cmd: <component.setSlot("table-3f357", "default", {format: "value", component: "bk-table-column", payload: {}, valueType: "table-list", code: [{ "label": "234", "prop": "prop1", "sortable": false, "filterable": false, "type": "" }], renderValue: [{ "label": "234", "prop": "prop1", "sortable": false, "filterable": false, "type": "" }] })>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'The slot has been successfully set.',
                'Have you finished the task? If so, call `done()`. Otherwise please continue."'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '任务已完成，已修改表格组件(table-3f357)的第一个表头的名称为234',
                '```',
                'cmd: <done()>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: 'help me solve this task:\n修改 button-75ke8 的title属性为234'
        },
        {
            role: 'assistant',
            content: [
                '好的，我们需要修改按钮组件（button-75ke8）的 title 属性为234，首先获取button-75ke8的配置信息以了解如何设置',
                '```',
                'cmd: <component.getInfo("button-75ke8")>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'The complete rendering configuration of the button-75ke8 component is as follows:',
                '{ componentId: "button-75ke8", renderProps: { title: { format: "value", code: "hello world", renderValue: "hello world", valueType: "string", payload: {} } } }'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '好的，我们可以看到 title 是 renderProps 中的一个属性，我们可以通过修改这个属性来改变按钮的标题。现在设置 button-75ke8 的 title 属性为 234。',
                '```',
                'cmd: <component.setProp("button-75ke8", "title", { format: "value", code: "234", renderValue: "234", valueType: "string", payload: {} })>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: [
                '# cmd',
                'The prop has been successfully set.',
                'Have you finished the task? If so, call `done()`. Otherwise please continue."'
            ].join('\n')
        },
        {
            role: 'assistant',
            content: [
                '任务已完成，已修改按钮组件（button-75ke8）的 title 属性为234',
                '```',
                'cmd: <done()>',
                '```'
            ].join('\n')
        }
    ]
}

export const eventPrompt = () => {
    return [
        {
            role: 'user',
            content: '跳转到home页面。然后执行函数 funcCode，参数是 1，23，4。将变量 variableCode 修改成 abc。然后跳转到 /test.com。修改组件 button-a244a 的高度为 500px，宽度为 300px'
        },
        {
            role: 'assistant',
            content: [
                '```',
                'cmd: <jumpByPage("home")>',
                'cmd: <executeFunction("funcCode", [{ value: "1" }, { value: "23" }, { value: "4" }])>',
                'cmd: <setVariableValue("variableCode", "abc")>',
                'cmd: <jumpByAddress("/test.com")>',
                'cmd: <setComponentStyle("button-a244a", [{ key: "height", value: "500px" }, { key: "width", value: "300px" }])>',
                '```'
            ].join('\n')
        },
        {
            role: 'user',
            content: '将变量 page 修改成事件第二个参数，将变量 limit 修改成事件第一个参数'
        },
        {
            role: 'assistant',
            content: [
                '```',
                'cmd: <setVariableValue("page", "${args[1]}")>',
                'cmd: <setVariableValue("limit", "${args[0]}")>',
                '```'
            ].join('\n')
        }
    ]
}
