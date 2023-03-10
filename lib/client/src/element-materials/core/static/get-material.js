import _ from 'lodash'
import ElementMaterials from '../../materials'
import { useStore } from '@/store'

const {
    bk,
    element,
    vant
} = ElementMaterials

const materialMap = {
    'root': {
        type: 'root',
        name: 'root'
    }
}

const register = (lib) => {
    lib.forEach(item => {
        materialMap[item.type] = item
    })
}

register(bk)
register(element)
register(vant)

const registerCustomMemo = {}

export const registerMaterial = (type, config) => {
    if (materialMap[type]) {
        console.error(`registerMaterial: 组件 ${type} 已存在`)
        return
    }
    materialMap[type] = config
    registerCustomMemo[type] = true
}

export const unregisterMaterial = () => {
    Object.keys(registerCustomMemo).forEach(type => {
        delete registerCustomMemo[type]
        delete materialMap[type]
    })
}

export default function (elementType, name) {
    /** bk-charts hack config settings
     * bk-charts存在同type，但是配置不同的情况
     *  - 在面板拖拽时，已经由hacker.js处理，因此有些地方可能不会传入name
     *  - 在右侧props属性面板渲染时，会传入name，获取准确的配置
     */
    if (elementType.startsWith('bk-charts') && name) {
        const material = bk.find(item => item.name === name)
        return _.cloneDeep(material)
    }
    if (elementType.startsWith('bk-input') && name) {
        const material = bk.find(item => item.name === name)
        return _.cloneDeep(material)
    }

    if (elementType === 'p') {
        const store = useStore()
        const library = store.getters['page/platform'] === 'PC' ? bk : vant
        const material = library.find(item => item.type === elementType)
        return _.cloneDeep(material)
    }

    const material = materialMap[elementType]
    if (!material) {
        return null
    }
    return _.cloneDeep(material)
}
