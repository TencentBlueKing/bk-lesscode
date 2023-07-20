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
            tips: '值变更时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'input',
            tips: '输入时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'focus',
            tips: '获取焦点时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'blur',
            tips: '失去焦点时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'keypress',
            tips: '按下键盘时触发，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'keydown',
            tips: '按下键盘时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'keyup',
            tips: '按下键盘按键松开时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'enter',
            tips: '获取焦点时，按下回车时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'paste',
            tips: '粘贴内容时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            name: 'clear',
            tips: '清空值时触发事件，事件回调参数 (value: String, event: Event)'
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
    props: {
        'model-Value': {
            type: 'string',
            val: '',
            directive: 'v-model'
        },
        type: {
            type: 'hidden',
            val: 'textarea',
            tips: '输入框样式'
        },
        size: {
            type: 'string',
            options: ['small', 'default', 'large'],
            val: 'default'
        },
        rows: {
            type: 'number',
            val: 1
        },
        'select-readonly': {
            type: 'boolean',
            val: false,
            tips: '选择时只读'
        },
        'with-validate': {
            type: 'boolean',
            val: false
        },
        placeholder: {
            type: 'string',
            val: '请输入',
            tips: '空白提示'
        },
        disabled: {
            type: 'boolean',
            val: false,
            tips: '是否不可用'
        },
        readonly: {
            type: 'boolean',
            val: false,
            tips: '是否只读'
        },
        clearable: {
            type: 'boolean',
            val: true,
            tips: '是否可清除。数字输入框时，此配置不生效'
        },
        maxlength: {
            type: 'number',
            tips: '最大输入长度'
        },
        'show-word-limit': {
            type: 'boolean',
            val: false,
            tips: '是否显示输入字数统计'
        },
        'show-clear-only-hover': {
            type: 'boolean',
            val: true,
            tips: '鼠标移入时显示清空按钮'
        },
        suffix: {
            type: 'string',
            val: '',
            tips: '后缀字符，当配置suffix slot时失效'
        },
        prefix: {
            type: 'string',
            val: '',
            tips: '前缀字符，当配置prefix slot时失效'
        }
        // prefixIcon: {
        //     type: 'icon',
        //     tips: '左图标'
        // },
        // suffixIcon: {
        //     type: 'icon',
        //     tips: '右图标'
        // }
    }
    
}
