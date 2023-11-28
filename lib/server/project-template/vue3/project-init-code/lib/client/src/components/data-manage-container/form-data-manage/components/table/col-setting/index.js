import { h, resolveComponent } from 'vue'
import './index.postcss'

export default {
    name: 'data-manage-table-col-setting',
    props: {
        fields: {
            type: Array,
            default: () => []
        },
        exclude: {
            type: Array,
            default: () => []
        }
    },
    data () {
        return {
            localList: this.exclude.slice()
        }
    },
    watch: {
        exclude (val) {
            this.localList = val.slice()
        }
    },
    methods: {
        close () {
            console.log(this.$el)
            this.localList = this.exclude.slice()
            // this.$emit('update', this.localList)
            // this.$refs.popoverRef.hide()
        },
        getFieldsGroup (h, title, list) {
            return h(
                'div',
                {
                    class: 'fields-group'
                },
                [
                    h(
                        'div',
                        {
                            class: 'group-title'
                        },
                        title
                    ),
                    h(
                        'div',
                        {
                            class: 'group-content'
                        },
                        list.map(field => {
                            const key = field.configure.key
                            return h(
                                resolveComponent('bk-checkbox'),
                                {
                                    class: 'field-item',
                                    key,
                                    value: key,
                                    checked: !this.localList.includes(key),
                                    onChange: () => {
                                        const index = this.localList.findIndex(item => item === key)
                                        if (index > -1) {
                                            this.localList.splice(index, 1)
                                        } else {
                                            this.localList.push(key)
                                        }
                                    }
                                },
                                field.configure.name
                            )
                        })
                    )
                ]
            )
        },
        renderTitle (h) {
            return h(
                resolveComponent('h2'),
                {
                    class: 'setting-content-title'
                },
                '表格设置'
            )
        },
        renderFields (h) {
            const sysFieldList = []
            const cusFieldList = []
            this.fields.forEach(item => {
                if (item.system) {
                    sysFieldList.push(item)
                } else {
                    cusFieldList.push(item)
                }
            })
            return [h(
                'div',
                {
                    class: 'fields-group-wrapper'
                },
                [
                    this.getFieldsGroup(h, '系统字段', sysFieldList),
                    this.getFieldsGroup(h, '自定义字段', cusFieldList)
                ]
            )]
        },
        renderActions (h) {
            return [h(
                'div',
                {
                    class: 'setting-actions'
                },
                [
                    h(
                        resolveComponent('bk-button'),
                        {
                            theme: 'primary',
                            style: { marginRight: '10px' },
                            onClick: () => {
                                this.$emit('update', this.localList)
                            }
                        },
                        '确定'
                    ),
                    h(
                        resolveComponent('bk-button'),
                        {
                            onClick: this.close
                        },
                        '取消'
                    )
                ]
            )]
        },
        renderHeader (h, { column, $index }) {
            return h(
                'div',
                {
                    class: 'table-col-setting-header'
                },
                [h(
                    resolveComponent('bk-popover'),
                    {
                        ref: 'popoverRef',
                        class: 'table-col-setting-popover',
                        'ext-cls': 'g-popover-empty-padding bk-table-setting-popover-content-theme',
                        style: 'margin: 9px 0 9px 4px; align-self: flex-end;',
                        theme: 'light',
                        distance: 0,
                        trigger: 'click',
                        placement: 'bottom-end',
                        tippyOptions: {
                            animateFill: false
                        }
                    },
                    [
                        h(
                            'i',
                            {
                                class: 'bk-icon icon-cog-shape setting-icon',
                                slot: 'default'
                            }
                        ),
                        h(
                            'div',
                            {
                                class: 'data-manage-table-col-setting-content',
                                slot: 'content'
                            },
                            [
                                this.renderTitle(h),
                                this.renderFields(h),
                                this.renderActions(h)
                            ]
                        )
                    ]
                )]
            )
        }
    },
    render () {
        return h(
            resolveComponent('bk-table-column'),
            {
                type: 'setting',
                render: this.renderHeader
            }
        )
    }
}
