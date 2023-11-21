import { h, toolTips } from 'bk-lesscode-render'
import { uuid } from 'shared/util'
import elementBox from '../element-box'
import './index.postcss'

export default {
    name: 'form-data-buttons',
    inheritAttrs: false,
    props: {
        buttons: {
            type: Array,
            default: () => [],
            required: true
        }
    },
    methods: {
        getProperties (btn) {
            const props = {}
            Object.keys(btn.props).forEach(key => {
                props[key] = btn.props[key].val
            })
            return props
        },
        handleAddBtn (e) {
            e.stopPropagation()
            const buttons = this.buttons.slice(0)
            const btn = {
                id: `button-${uuid(8)}`,
                type: 'formDataButton',
                name: this.$t('按钮'),
                props: {},
                events: { click: { enable: false, name: '' } },
                perms: []
            }
            if (buttons.length === 0) {
                btn.props.theme = { val: 'primary' } // 第一个按钮主题默认值primary
            }
            buttons.push(btn)
            this.update(buttons)
            this.$emit('active', btn)
        },
        handleCopyBtn (btn) {
            const buttons = this.buttons.slice()
            const copy = Object.assign({}, btn, { id: `button-${uuid(8)}` })
            const index = buttons.findIndex(item => item.id === btn.id)
            if (index > -1) {
                buttons.splice(index + 1, 0, copy)
                this.update(buttons)
            }
            this.$emit('active', btn)
        },
        handleDelBtn (btn) {
            const buttons = this.buttons.filter(item => item.id !== btn.id)
            this.update(buttons)
            this.$emit('del', btn)
        },
        update (buttons) {
            this.$emit('update', 'buttons', buttons)
        }
    },
    render (render) {
        h.init(render)

        const self = this

        const renderButtons = () => {
            const buttonElements = []
            self.buttons.forEach(btn => {
                buttonElements.push(h({
                    component: elementBox,
                    class: 'comp-box',
                    props: {
                        elementData: btn
                    },
                    on: {
                        click: () => {
                            self.$emit('active', btn)
                        },
                        copy: () => {
                            self.handleCopyBtn(btn)
                        },
                        del: () => {
                            self.handleDelBtn(btn)
                        }
                    },
                    slots: {
                        default: () => {
                            return h({
                                component: 'bk-button',
                                props: self.getProperties(btn),
                                children: btn.name
                            })
                        }
                    }
                }))
            })

            buttonElements.push(h({
                component: 'div',
                class: 'add-btn',
                directives: [{
                    name: toolTips,
                    value: {
                        content: self.$t('添加按钮'),
                        placement: 'top'
                    }
                }],
                on: {
                    click: self.handleAddBtn
                },
                children: [
                    h({
                        component: 'span',
                        class: 'bk-drag-icon bk-drag-add-line add-icon'
                    })
                ]
            }))

            return buttonElements
        }

        return h({
            component: 'div',
            class: 'form-data-buttons',
            children: renderButtons()
        })
    }
}
