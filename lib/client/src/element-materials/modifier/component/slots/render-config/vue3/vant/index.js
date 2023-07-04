function getVal (val) {
    if (typeof val === 'object') val = JSON.stringify(val).replace(/'/g, '\\\'').replace(/"/g, '\'')
    return val
}

const vantRenderMap = {
    'van-checkbox' ({ val, from, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const valueKey = valueKeys?.value || 'value'
        const disabledKey = valueKeys?.disabled || 'disabled'
        return `
            <van-checkbox
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :disabled="item.${disabledKey}"
                :shape="'square'"
                :name="item.${valueKey}"
            >{{item.${labelKey}}}</van-checkbox>
        `
    },
    'van-radio' ({ val, from, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const valueKey = valueKeys?.value || 'value'
        const disabledKey = valueKeys?.disabled || 'disabled'
        return `
            <van-radio
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :name="item.${valueKey}"
                :disabled="item.${disabledKey}"
            >{{item.${labelKey}}}</van-radio>
        `
    },
    'van-step' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const textKey = valueKeys?.text || 'text'
        return `
            <van-step
                v-for="(item,index) in ${displayVal}"
                :key="index"
            >
            {{item.${textKey}}}</van-step>
        `
    },
    'van-tab' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const nameKey = valueKeys?.name || 'name'
        const titleKey = valueKeys?.title || 'title'
        const disabledKey = valueKeys?.disabled || 'disabled'
        const dotKey = valueKeys?.dot || 'dot'
        const urlKey = valueKeys?.url || 'url'
        const toKey = valueKeys?.to || 'to'
        return `
            <van-tab
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :name="item.${nameKey}"
                :title="item.${titleKey}"
                :disabled="item.${disabledKey}"
                :dot="item.${dotKey}"
                :url="item.${urlKey}"
                :to="item.${toKey}">
            </van-tab>
        `
    }
}

export default vantRenderMap
