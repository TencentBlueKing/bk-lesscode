import LC from '@/element-materials/core'
import Node from '@/element-materials/core/Node'
import store from '@/store'

export const createBkIcon = (node, config) => {
    if (node.type === 'bk-icon') {
        node.setProp('type', LC.utils.genPropFormatValue({
            format: 'value',
            code: config.props.type.val,
            renderValue: config.props.type.val
        }))
    }
}

export const createElIcon = (node, config) => {
    if (node.type === 'i' && /^el-icon-/.test(node.name)) {
        node.setProp('type', LC.utils.genPropFormatValue({
            format: 'value',
            code: config.props.class.val,
            renderValue: config.props.class.val
        }))
    }
}

export const createSameTypeComp = (node, config) => {
    if (node.type === 'chart' || node.type.startsWith('bk-charts') || node.type === 'bk-input') {
        Object.assign(node, new Node(config))
    }
}

export const createBkRadioGroup = (node, config) => {
    if (node.type === 'bk-radio-group' && config.name === 'radio-group') {
        const slotConfig = config.slots.default
        node.setRenderSlots({
            format: 'value',
            component: 'bk-radio',
            code: slotConfig.val,
            valueType: 'list',
            renderValue: slotConfig.val
        })
    }
}

export const createParagraph = (node, config) => {
    if (node.type === 'p') {
        const paragraphStyle = {
            PC: {
                display: 'inline-block',
                width: '281px',
                height: '102px',
                textAlign: 'left',
                fontSize: '14px',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
            },
            MOBILE: {
                display: 'inline-block',
                textAlign: 'left',
                fontSize: '28rpx',
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all'
            }
        }
        const platform = store.getters['page/platform']
        const renderStyle = paragraphStyle[platform]
        node.setRenderStyles(renderStyle)
    }
}

export const createColumn = (node) => {
    if (node.type === 'render-column') {
        const platform = store.getters['page/platform']
        const padding = platform === 'PC'
            ? '5px'
            : '10rpx'
        node.setRenderStyles({
            'paddingTop': padding,
            'paddingRight': padding,
            'paddingBottom': padding,
            'paddingLeft': padding
        })
    }
}

/** 插入h5容器时，根据画布尺寸自动调整h5-page高度 */
export const setH5PageHeight = (node) => {
    if (node.type === 'h5-container') {
        node.children.forEach(child => {
            const { height } = store.getters['page/pageSize']
            child.setStyle('height', `${height}px`)
        })
    }
}
