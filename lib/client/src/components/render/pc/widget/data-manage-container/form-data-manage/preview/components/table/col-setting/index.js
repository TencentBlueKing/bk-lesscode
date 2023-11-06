import { h } from 'bk-lesscode-render'
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
                                'bk-checkbox',
                                {
                                    class: 'field-item',
                                    props: {
                                        key,
                                        value: key,
                                        checked: !this.localList.includes(key)
                                    },
                                    on: {
                                        change: () => {
                                            const index = this.localList.findIndex(item => item === key)
                                            if (index > -1) {
                                                this.localList.splice(index, 1)
                                            } else {
                                                this.localList.push(key)
                                            }
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
                'h2',
                {
                    class: 'setting-content-title'
                },
                [this.$t('表格设置')]
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
                    this.getFieldsGroup(h, this.$t('系统字段'), sysFieldList),
                    this.getFieldsGroup(h, this.$t('自定义字段'), cusFieldList)
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
                        'bk-button',
                        {
                            props: {
                                theme: 'primary'
                            },
                            style: { marginRight: '10px' },
                            on: {
                                click: () => {
                                    this.$emit('update', this.localList)
                                }
                            }
                        },
                        this.$t('确定')
                    ),
                    h(
                        'bk-button',
                        {
                            on: {
                                click: this.close
                            }
                        },
                        this.$t('取消')
                    )
                ]
            )]
        },
        renderHeader (h, { column, $index }) {
            return h(
                'div',
                {
                    class: 'table-col-setting-header',
                    props: {}
                },
                [h(
                    'bk-popover',
                    {
                        ref: 'popoverRef',
                        props: {
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
    render (render) {
        h.init(render)

        const self = this

        const getFieldsGroup = (title, list) => {
            return h({
                component: 'div',
                class: 'fields-group',
                children: [
                    h({
                        component: 'div',
                        class: 'group-title',
                        children: title
                    }),
                    h({
                        component: 'div',
                        class: 'group-content',
                        children: list.map(field => {
                            const key = field.configure.key
                            return h({
                                component: 'bk-checkbox',
                                class: 'field-item',
                                props: {
                                    key,
                                    value: key,
                                    checked: !this.localList.includes(key)
                                },
                                on: {
                                    change: () => {
                                        const index = this.localList.findIndex(item => item === key)
                                        if (index > -1) {
                                            this.localList.splice(index, 1)
                                        } else {
                                            this.localList.push(key)
                                        }
                                    }
                                },
                                children: field.configure.name
                            })
                        })
                    })
                ]
            })
        }
        const renderTitle = () => {
            return h({
                component: 'h2',
                class: 'setting-content-title',
                children: [this.$t('表格设置')]
            })
        }
        const renderFields = () => {
            const sysFieldList = []
            const cusFieldList = []
            this.fields.forEach(item => {
                if (item.system) {
                    sysFieldList.push(item)
                } else {
                    cusFieldList.push(item)
                }
            })
            return [h({
                component: 'div',
                class: 'fields-group-wrapper',
                children: [
                    getFieldsGroup(this.$t('系统字段'), sysFieldList),
                    getFieldsGroup(this.$t('自定义字段'), cusFieldList)
                ]
            })]
        }
        const renderActions = () => {
            return [h({
                component: 'div',
                class: 'setting-actions',
                children: [
                    h({
                        component: 'bk-button',
                        props: {
                            theme: 'primary'
                        },
                        style: { marginRight: '10px' },
                        on: {
                            click: () => {
                                self.$refs.settingContentRef.handleCancel()
                                this.$emit('update', this.localList)
                            }
                        },
                        children: this.$t('确定')
                    }),
                    h({
                        component: 'bk-button',
                        on: {
                            click: () => {
                                self.$refs.settingContentRef.handleCancel()
                                self.localList = self.exclude.slice()
                            }
                        },
                        children: this.$t('取消')
                    })
                ]
            })]
        }

        return h({
            component: 'bk-table-column',
            props: {
                index: 10000,
                type: 'setting',
                fixed: 'right'
            },
            children: [
                h({
                    component: 'bk-table-setting-content',
                    ref: 'settingContentRef',
                    directives: [
                        {
                            name: 'show',
                            value: false
                        }
                    ]
                }),
                h({
                    component: 'div',
                    class: 'data-manage-table-col-setting-content',
                    children: [
                        renderTitle(),
                        renderFields(),
                        renderActions()
                    ]
                })
            ]
        })
    }
}
