export const NODE_TYPE_LIST = [
    { type: 'START', name: window.i18n.t('开始节点'), menuIcon: '', icon: '' },
    { type: 'END', name: window.i18n.t('结束节点'), menuIcon: '', icon: '' },
    { type: 'NORMAL', name: window.i18n.t('人工节点'), menuIcon: 'bk-drag-rengongjiedian', icon: 'bk-drag-rengongjiedian' },
    { type: 'DATA_PROC', name: window.i18n.t('数据处理节点'), menuIcon: 'bk-drag-shujuchulijiedian', icon: 'bk-drag-shujuchulijiedian' },
    { type: 'TASK', name: window.i18n.t('API节点'), menuIcon: 'bk-drag-apijiedian', icon: 'bk-drag-apijiedian' },
    { type: 'APPROVAL', name: window.i18n.t('审批节点'), menuIcon: 'bk-drag-shenpijiedian', icon: 'bk-drag-shenpijiedian' },
    { type: 'ROUTER-P', name: window.i18n.t('并行网关'), menuIcon: 'bk-drag-parallel', icon: 'bk-drag-parallel' },
    { type: 'COVERAGE', name: window.i18n.t('汇聚网关'), menuIcon: 'bk-drag-converge', icon: 'bk-drag-converge' }
]

// 条件关系
export const CONDITION_RELATIONS = [
    { id: '==', name: window.i18n.t('等于') },
    { id: '!=', name: window.i18n.t('不等于') },
    { id: '>', name: window.i18n.t('大于') },
    { id: '<', name: window.i18n.t('小于') },
    { id: '>=', name: window.i18n.t('大于等于') },
    { id: '<=', name: window.i18n.t('小于等于') },
    { id: 'in', name: window.i18n.t('包含') },
    { id: 'not_in', name: window.i18n.t('不包含') }
]
