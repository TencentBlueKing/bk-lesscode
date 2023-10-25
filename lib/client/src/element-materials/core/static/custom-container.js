import {
    triggerEventListener
} from '../event'
// import cloneDeep from 'lodash.clonedeep'

// 存储编辑容器里选中的元素，如表单容器里的字段，数据管理容器里的按钮
let activeElement = null

const triggerEvent = () => {
    triggerEventListener('activeElementUpdate', activeElement)
}

export const setActiveElement = (componentData, elementData) => {
    activeElement = { componentData, elementData }
    triggerEvent()
}

export const getActiveElement = () => {
    return activeElement
}

export const resetActiveElement = () => {
    if (activeElement) {
        activeElement = null
        triggerEvent()
    }
}
