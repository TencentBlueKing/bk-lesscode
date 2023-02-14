import http from '@/api'
export default {
    namespaced: true,
    state: {
        activeNode: '', // 当前编辑节点的数据管理页
        selectedComp: {
            type: '',
            data: {}
        }, // 被选中的组件，目前包括流程数据管理节点数据页筛选区域操作按钮、表格内操作列按钮
        pageConfig: { // 数据管理页配置
            buttons: [], // 页面操作按钮
            filters: {}, // 筛选条件
            tableConfig: {}, // 表格展示哪些字段
            tableActions: [] // 表格操作列的按钮
        }
    },
    getters: {
        pageConfig: state => state.pageConfig
    },
    mutations: {
        setActiveNode (state, id = '') {
            state.activeNode = id
        },
        setSelectedComp (state, comp = { type: '', data: {} }) {
            state.selectedComp = comp
        },
        setPageConfig (state, pageConfig) {
            state.pageConfig = pageConfig
        },
        resetPageConfig (state) {
            state.pageConfig = {}
        }
    },
    actions: {
        // 导出列表组件的数据
        exportData (_, params) {
            return http.post('/engine/data/export_list_component_data/', params, { responseType: 'arraybuffer' }).then(respond => respond.data)
        }
    }
}
