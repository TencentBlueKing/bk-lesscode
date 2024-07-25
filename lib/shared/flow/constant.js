import { sharedI18n } from '../util'

// 新建流程模板的初始化数据
export const GET_INITIALIZE_FLOW_TPL_STRUCTURE = () => ({
    nodes: [
        {
            id: 0,
            type: 'Start',
            axis: {
                x: 80,
                y: 150
            },
            config: {
                name: sharedI18n().t('开始')
            }
        },
        {
            id: 1,
            type: 'Manual',
            axis: {
                x: 200,
                y: 150
            },
            config: {
                name: sharedI18n().t('人工节点'),
                formType: '',
                formId: null
            }
        },
        {
            id: 2,
            type: 'DataProcessing',
            axis: {
                x: 550,
                y: 160
            },
            config: {
                name: sharedI18n().t('数据处理节点'),
                action: '',
                tableName: '',
                conditions: {
                    connector: '',
                    expression: []
                },
                mapping: []
            }
        },
        {
            id: 3,
            type: 'End',
            axis: {
                x: 925,
                y: 150
            },
            config: {
                name: sharedI18n().t('结束')
            }
        }
    ],
    edges: [
        {
            id: 0,
            source: {
                id: 0,
                port: 'Right'
            },
            target: {
                id: 1,
                port: 'Left'
            }
        },
        {
            id: 1,
            source: {
                id: 1,
                port: 'Right'
            },
            target: {
                id: 2,
                port: 'Left'
            }
        },
        {
            id: 2,
            source: {
                id: 2,
                port: 'Right'
            },
            target: {
                id: 3,
                port: 'Left'
            }
        }
    ]
})
