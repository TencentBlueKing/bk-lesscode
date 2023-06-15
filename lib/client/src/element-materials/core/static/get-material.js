import _ from 'lodash'
import vue2ElementMaterials from '../../materials/vue2'
import vue3ElementMaterials from '../../materials/vue3'
import { useStore } from '@/store'
import { framework } from './framework'

const materialMap = {
    vue2: {
        root: {
            type: 'root',
            name: 'root'
        }
    },
    vue3: {
        root: {
            type: 'root',
            name: 'root'
        }
    }
}

const register = (lib, framework) => {
    lib.forEach(item => {
        materialMap[framework][item.type] = item
    })
}

// 注册 vue2 组件
register(vue2ElementMaterials.bk, 'vue2')
register(vue2ElementMaterials.element, 'vue2')
register(vue2ElementMaterials.vant, 'vue2')
// 注册 vue3 组件
register(vue3ElementMaterials.bk, 'vue3')
register(vue3ElementMaterials.vant, 'vue3')

const registerCustomMemo = {
    vue2: {},
    vue3: {}
}

export const registerMaterial = (type, config, framework = 'vue2') => {
    if (materialMap[framework][type]) {
        console.error(window.i18n.t('registerMaterial: 组件 {n} 已存在', { n: type }))
        return
    }
    materialMap[framework][type] = config
    registerCustomMemo[framework][type] = true
}

export const unregisterMaterial = () => {
    Object.keys(registerCustomMemo).forEach(framework => {
        Object.keys(registerCustomMemo[framework]).forEach((type) => {
            delete registerCustomMemo[framework][type]
            delete materialMap[framework][type]
        })
    })
}

export default function (type, name) {
    /** bk-charts hack config settings
     * bk-charts存在同type，但是配置不同的情况
     *  - 在面板拖拽时，已经由hacker.js处理，因此有些地方可能不会传入name
     *  - 在右侧props属性面板渲染时，会传入name，获取准确的配置
     */
    const elementMaterials = framework === 'vue2' ? vue2ElementMaterials : vue3ElementMaterials
    // 同一个type名称，对应不同组件，需要根据name进一步区分
    const sameTypeArr = ['bk-charts', 'chart', 'bk-input', 'bk-radio-group']

    if (sameTypeArr.indexOf(type) !== -1 && name) {
        const material = elementMaterials.bk.find(item => item.name === name)
        return _.cloneDeep(material)
    }

    if (type === 'p') {
        const store = useStore()
        const library = store.getters['page/platform'] === 'PC' ? elementMaterials.bk : elementMaterials.vant
        const material = library.find(item => item.type === type)
        return _.cloneDeep(material)
    }

    const material = materialMap[framework][type]
    if (!material) {
        return null
    }
    return _.cloneDeep(material)
}
