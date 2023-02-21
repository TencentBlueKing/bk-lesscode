export default {
    name: 'textarea',
    type: 'bk-input',
    displayName: '文本框',
    icon: 'bk-drag-input',
    group: '表单',
    order: 2,
    document: 'https://magicbox.bk.tencent.com/static_api/v3/components_vue/2.0/example/index.html#/input',
    events: [
        {
            name: 'change',
            tips: '文本框内容变化时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'input',
            tips: '文本框输入时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'focus',
            tips: '文本框获取焦点时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'blur',
            tips: '文本框失去焦点时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'keypress',
            tips: '文本框输入按下键盘时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'keydown',
            tips: '文本框输入按下键盘时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'keyup',
            tips: '文本框输入按下键盘按键松开时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'enter',
            tips: '文本框获取焦点时，按下回车时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'paste',
            tips: '文本框粘贴内容时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'clear',
            tips: '点击文本框的清除图标时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'left-icon-click',
            tips: '点击配置的左图标时调用该事件函数，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'right-icon-click',
            tips: '点击配置的右图标时调用该事件函数，事件回调参数 (value: String, event: Event)'
        }
    ],
    styles: [
        'position',
        {
            name: 'size',
            exclude: ['height', 'maxHeight', 'minHeight']
        },
        'margin',
        'pointer',
        'opacity'
    ],
    renderStyles: {
        display: 'inline-block',
        verticalAlign: 'middle',
        width: '300px'
    },
    directives: [
        {
            type: 'v-model',
            prop: 'value'
        }
    ],
    props: {
        value: {
            type: 'text',
            val: ''
        },
        type: {
            type: 'hidden',
            val: 'textarea',
            tips: '输入框样式'
        },
        'font-size': {
            type: 'string',
            options: ['normal', 'medium', 'large'],
            val: 'normal',
            tips: '设置输入框内容字体大小：normal--12px；medium--14px；large--16px'
        },
        placeholder: {
            type: 'text',
            tips: '空白提示'
        },
        disabled: {
            type: 'boolean',
            val: false
        },
        readonly: {
            type: 'boolean',
            val: false
        },
        maxlength: {
            type: 'number',
            tips: '最大输入长度'
        },
        minlength: {
            type: 'number',
            tips: '最小输入长度'
        },
        name: {
            type: 'string',
            tips: 'html 原生属性 name'
        },
        'left-icon': {
            type: 'icon'
        },
        'right-icon': {
            type: 'icon'
        }
    }
    
}
