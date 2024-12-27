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
            displayName: '文本框内容变化',
            name: 'change',
            tips: '值变更时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '文本框输入',
            name: 'input',
            tips: '输入时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '获取焦点',
            name: 'focus',
            tips: '获取焦点时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '失去焦点',
            name: 'blur',
            tips: '失去焦点时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '按下键盘',
            name: 'keypress',
            tips: '按下键盘时触发，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '键盘按下能在页面产生字符的键',
            name: 'keydown',
            tips: '按下键盘时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '按下键盘后松开',
            name: 'keyup',
            tips: '按下键盘按键松开时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '聚焦后按下回车',
            name: 'enter',
            tips: '获取焦点时，按下回车时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '粘贴内容',
            name: 'paste',
            tips: '粘贴内容时触发事件，事件回调参数 (value: String, event: Event)'
        },
        {
            displayName: '点击文本框上清除图标',
            name: 'clear',
            tips: '清空值时触发事件，事件回调参数 (value: String, event: Event)'
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
            prop: 'model-value'
        }
    ],
    groups: [
        { label: '输入内容', value: 'input' },
        { label: '提示', value: 'tip' },
        { label: '状态', value: 'state' },
        { label: '限制字数', value: 'limitLen' },
        { label: '行数', value: 'rows' },
        { label: '前后缀', value: 'preSuffix' },
        { label: '样式', value: 'style' },
        { label: '其他', value: 'other' }
    ],
    props: {
        'model-value': {
            type: 'string',
            val: '',
            directive: 'v-model',
            displayName: '输入框内容',
            tips: '输入框内容，支持v-model双向绑定，v-model优先级更高',
            belongGroup: 'input'
        },
        type: {
            type: 'hidden',
            val: 'textarea',
            displayName: '输入框类型',
            tips: '输入框样式'
        },
        rows: {
            type: 'number',
            val: 1,
            displayName: '文本框行数',
            belongGroup: 'rows'
        },
        'select-readonly': {
            type: 'boolean',
            val: false,
            displayName: '选择时只读',
            tips: '选择时只读',
            belongGroup: 'state'
        },
        'with-validate': {
            type: 'boolean',
            val: false,
            displayName: '值改变时触发字段校验规则',
            belongGroup: 'other'
        },
        placeholder: {
            type: 'string',
            val: '请输入',
            displayName: '空值时提示文案',
            tips: '空白提示',
            belongGroup: 'tip'
        },
        disabled: {
            type: 'boolean',
            val: false,
            displayName: '是否禁用',
            tips: '是否不可用',
            belongGroup: 'state'
        },
        readonly: {
            type: 'boolean',
            val: false,
            displayName: '是否只读',
            tips: '是否只读',
            belongGroup: 'state'
        },
        maxlength: {
            type: 'number',
            displayName: '最大输入长度',
            tips: '最大输入长度',
            belongGroup: 'limitLen'
        },
        'show-word-limit': {
            type: 'boolean',
            val: false,
            displayName: '是否显示输入字数统计',
            tips: '是否显示输入字数统计',
            belongGroup: 'limitLen'
        },
        suffix: {
            type: 'string',
            val: '',
            displayName: '后缀字符',
            tips: '后缀字符，当配置suffix slot时失效',
            belongGroup: 'preSuffix'
        },
        prefix: {
            type: 'string',
            val: '',
            displayName: '前缀字符',
            tips: '前缀字符，当配置prefix slot时失效',
            belongGroup: 'preSuffix'
        },
        autosize: {
            type: ['boolean', 'object'],
            displayName: '文本框高度随内容自适应',
            tips: '如果为true， 则文本框高度随内容自适应， 也可以设置为对象{"minRows":2, "maxRows": 5}， 则文本框高度最小为2行， 最高为5行',
            belongGroup: 'other'
        },
        minlength: {
            type: 'number',
            displayName: '最小输入长度',
            tips: '最小输入长度',
            belongGroup: 'limitLen'
        },
        name: {
            type: 'string',
            displayName: '名称',
            tips: '名称',
            belongGroup: 'other'
        },
        overMaxLengthLimit: {
            type: 'boolean',
            displayName: '超出最大字数限制后是否可以继续输入',
            tips: '超出最大字数限制后是否可以继续输入，结合maxlength使用',
            belongGroup: 'limitLen'
        },
        stopPropagation: {
            type: 'boolean',
            displayName: '是否阻止事件冒泡',
            tips: '是否阻止事件冒泡',
            belongGroup: 'other'
        }
    }
    
}
