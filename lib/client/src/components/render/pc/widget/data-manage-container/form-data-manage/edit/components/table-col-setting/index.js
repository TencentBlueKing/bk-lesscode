import { h } from 'bk-lesscode-render'
import './index.postcss'

export default {
    name: 'table-col-setting',
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
                            return h({
                                component: 'bk-checkbox',
                                class: 'field-item',
                                props: {
                                    key: field.key,
                                    value: field.key,
                                    checked: !this.localList.includes(field.key)
                                },
                                on: {
                                    change: () => {
                                        const index = this.localList.findIndex(item => item === field.key)
                                        if (index > -1) {
                                            this.localList.splice(index, 1)
                                        } else {
                                            this.localList.push(field.key)
                                        }
                                    }
                                },
                                children: field.name
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
                type: 'setting'
                // renderHeader: this.renderHeader
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
                    class: 'table-col-setting-content',
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
