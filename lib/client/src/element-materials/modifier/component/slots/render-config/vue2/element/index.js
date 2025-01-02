function getVal (val) {
    if (typeof val === 'object') val = JSON.stringify(val).replace(/'/g, '\\\'').replace(/"/g, '\'')
    return val
}

const elementRenderMap = {
    'el-radio' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const valueKey = valueKeys?.value || 'value'
        return `
            <el-radio
                v-for="item in ${displayVal}"
                :key="item.${valueKey}"
                :label="item.${labelKey}"
            >{{item.${labelKey}}}</el-radio>
        `
    },
    'el-checkbox' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const valueKey = valueKeys?.value || 'value'
        return `
            <el-checkbox
                v-for="item in ${displayVal}"
                :key="item.${valueKey}"
                :label="item.${labelKey}"
            >{{item.${labelKey}}}</el-checkbox>
        `
    },
    'el-option' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const idKey = valueKeys?.id || 'id'
        const nameKey = valueKeys?.name || 'name'
        return `
            <el-option
                v-for="item in ${displayVal}"
                :key="item.${idKey}"
                :value="item.${idKey}"
                :label="item.${nameKey}"
            ></el-option>
        `
    },
    'el-table-column' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const propKey = valueKeys?.prop || 'prop'
        const sortableKey = valueKeys?.sortable || 'sortable'
        const props = `
            :label="item.${labelKey}"
            :prop="item.${propKey}"
            :sortable="item.${sortableKey}"
            :width="item.width"
            :type="item.type"
            :status="item.status"
        `
        return `
            <template v-for="(item, index) in ${displayVal}">
                <el-table-column
                    v-if="item.type === 'customCol'"
                    :key="item.templateCol"
                    ${props}
                >
                    <template slot-scope="props">
                        <render-html
                            :html="item.templateCol"
                            :render-options="item"
                            :props="props"
                            :parent-id="_uid"
                        ></render-html>
                    </template>
                </el-table-column>
                <widget-table-column
                    v-else
                    column-type="el-table-column"
                    :key="index"
                    ${props}
                ></widget-table-column>
            </template>
        `
    },
    'el-tab-pane' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const nameKey = valueKeys?.name || 'name'
        const labelKey = valueKeys?.label || 'label'
        return `
            <el-tab-pane
                v-for="item in ${displayVal}"
                :key="item.${nameKey}"
                :label="item.${labelKey}"
                :name="item.${nameKey}"
            ></el-tab-pane>
        `
    },
    'el-step' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const titleKey = valueKeys?.title || 'title'
        const iconKey = valueKeys?.icon || 'icon'
        const descriptionKey = valueKeys?.description || 'description'
        return `
            <el-step
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :title="item.${titleKey}"
                :description="item.${descriptionKey}"
                :icon="item.${iconKey}"
            ></el-step>
        `
    },
    'el-breadcrumb-item' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const toKey = valueKeys?.to || 'to'
        const labelKey = valueKeys?.label || 'label'
        return `
            <el-breadcrumb-item
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :to="item.${toKey}"
            >{{item.${labelKey}}}</el-breadcrumb-item>
        `
    },
    'el-carousel-item' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const labelKey = valueKeys?.label || 'label'
        const nameKey = valueKeys?.name || 'name'
        const contentKey = valueKeys?.content || 'content'
        return `
            <el-carousel-item
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :name="item.${nameKey}"
                :label="item.${labelKey}"
            >
                <div v-html="item.${contentKey}"></div>
            </el-carousel-item>
        `
    },
    'el-timeline-item' ({ val, valueKeys }) {
        const displayVal = getVal(val)
        const timestampKey = valueKeys?.timestamp || 'timestamp'
        const colorKey = valueKeys?.color || 'color'
        const labelKey = valueKeys?.label || 'label'
        return `
            <el-timeline-item
                v-for="(item, index) in ${displayVal}"
                :key="index"
                :timestamp="item.${timestampKey}"
                :color="item.${colorKey}"
                :label="item.${labelKey}"
            >{{item.${labelKey}}}</el-timeline-item>
        `
    }
}

export default elementRenderMap
