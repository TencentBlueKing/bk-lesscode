import { h } from 'bk-lesscode-render'
import cloneDeep from 'lodash.clonedeep'
import LC from '@/element-materials/core'
import formEngineLayout from '@/form-engine/layout/index'

export default {
    name: 'widget-form-container',
    inheritAttrs: false,
    props: {
        componentData: {
            type: Object,
            required: true
        }
    },
    data () {
        return {
            actived: '',
            propsData: this.getPropsData(this.componentData)
        }
    },
    mounted () {
        LC.addEventListener('activeElementUpdate', this.activeFieldCallBack)
        LC.addEventListener('update', this.updateCallBack)
    },
    beforeDestroy () {
        LC.removeEventListener('activeElementUpdate', this.activeFieldCallBack)
        LC.removeEventListener('update', this.updateCallBack)
    },
    methods: {
        activeFieldCallBack () {
            const activeElement = LC.getActiveElement()
            if (activeElement) {
                const { componentData, elementData } = activeElement
                if (componentData.componentId === this.componentData.componentId) {
                    this.actived = elementData.id
                    return
                }
            }
            this.actived = ''
        },
        updateCallBack ({ type, target }) {
            if (type === 'setProp' && target.type === 'widget-form-container') {
                if (target.componentId === this.componentData.componentId) {
                    this.propsData = this.getPropsData(target)
                }
            }
        },
        getPropsData (node) {
            if (!node) {
                return {}
            }

            const { dataSource, fields, rowLayout, actions } = node.renderProps
            return {
                dataSource: dataSource.code,
                fields: fields.code,
                rowLayout: rowLayout.code,
                actions: actions.code
            }
        }
    },
    render (render) {
        h.init(render)

        const self = this

        return h({
            component: 'div',
            class: 'form-container-comp',
            style: { height: '100%' },
            children: [
                h({
                    component: formEngineLayout,
                    props: {
                        actived: self.actived,
                        ...self.propsData
                    },
                    on: {
                        mouseMoveField: () => {
                            LC.triggerEventListener('componentMouserleave', {
                                type: 'componentMouserleave'
                            })
                        },
                        activeField: field => {
                            const activeNode = LC.getActiveNode()
                            if (activeNode) {
                                activeNode.activeClear()
                            }
                            LC.triggerEventListener('componentMouserleave', {
                                type: 'componentMouserleave'
                            })
                            LC.setActiveElement(self.componentData, field)
                        },
                        delField: field => {
                            const activeElement = LC.getActiveElement()
                            if (activeElement && activeElement.elementData.id === field.id) {
                                LC.resetActiveElement()
                            }
                            this.componentData.active()
                        },
                        update: list => {
                            const fields = cloneDeep(this.componentData.renderProps.fields)
                            const listCopy = cloneDeep(list)
                            this.componentData.setProp('fields', {
                                ...fields,
                                code: listCopy,
                                renderValue: listCopy
                            })
                        }
                    }
                })
            ]
        })
    }
}
