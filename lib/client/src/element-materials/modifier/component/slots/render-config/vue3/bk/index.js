function getVal (val) {
    if (typeof val === 'object') val = JSON.stringify(val).replace(/'/g, '\\\'').replace(/"/g, '\'')
    return val
}

const bkRenderMap = {
    'bk-checkbox' ({ val, from, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const valueKey = valueKeys?.value || 'value'
        const checkedKey = valueKeys?.checked || 'checked'
        return `
            <bk-checkbox
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :label="item.${valueKey}"
                ${from !== 'canvas' ? '' : `:class="item.${checkedKey} ? \'is-checked\' : \'\'"`}
                style="margin-right: 20px"
            >{{item.${labelKey}}}</bk-checkbox>
        `
    },
    'bk-radio' ({ val, from, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const valueKey = valueKeys?.value || 'value'
        return `
            <bk-radio
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :label="item.${valueKey}"
                :disabled="item.disabled"
                ${from !== 'canvas' ? '' : ':class="item.checked ? \'is-checked\' : \'\'"'}
            >{{item.${labelKey}}}</bk-radio>
        `
    },
    'bk-radio-button' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const valueKey = valueKeys?.value || 'value'
        return `
            <bk-radio-button
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :label="item.${labelKey}"
                :value="item.${valueKey}"
                :disabled="item.disabled"
            >{{item.${labelKey}}}</bk-radio-button>
        `
    },
    'bk-option' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const idKey = valueKeys?.id || 'id'
        const nameKey = valueKeys?.name || 'name'
        return `
            <bk-option
                v-for="item in ${displayVal || '[]'}"
                :key="item.${idKey}"
                :value="item.${idKey}"
                :label="item.${nameKey}"
            ></bk-option>
        `
    },
    'bk-tab-panel' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const nameKey = valueKeys?.name || 'name'
        const labelKey = valueKeys?.label || 'label'
        return `
            <bk-tab-panel
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :label="item.${labelKey}"
                :name="item.${nameKey}"
            ></bk-tab-panel>
        `
    },
    'bk-breadcrumb-item' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const toKey = valueKeys?.to || 'to'
        const labelKey = valueKeys?.label || 'label'
        return `
            <bk-breadcrumb-item
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :to="item.${toKey}"
            >{{item.${labelKey}}}</bk-breadcrumb-item>
        `
    },
    'bk-table-column' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const propKey = valueKeys?.field || 'prop'
        const sortableKey = valueKeys?.sortable || 'sortable'
        const filterableKey = valueKeys?.filterable || 'filterable'
        const props = `
            :label="item.${labelKey}"
            :prop="item.${propKey}"
            :sort="item.${sortableKey}"
            :width="item.width"
            :filter="item.${filterableKey}"
            :type="item.type"
            :index="index"
        `
        return `
            <template v-for="(item, index) in ${displayVal}">
                <bk-table-column
                    v-if="item.type === 'customCol'"
                    :key="item.templateCol"
                    ${props}
                >
                    <template #default="props">
                        <render-html
                            :html="item.templateCol"
                            :render-options="item"
                            :props="props"
                            :key="item.templateCol"
                        ></render-html>
                    </template>
                </bk-table-column>
                <widget-table-column
                    v-else
                    column-type="bk-table-column"
                    :key="index + item.${labelKey} + item.${propKey} + item.type + item.width"
                    ${props}
                ></widget-table-column>
            </template>
        `
    }
}

export default bkRenderMap
