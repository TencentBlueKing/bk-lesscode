import {
    generateExportStruct,
    generateExportDatas
} from 'shared/data-source'
import {
    downloadFile
} from '@/common/util.js'

const demoTable = [{
    'tableName': 'demo_table',
    'comment': 'demo',
    'columns': [
        {
            'name': 'id',
            'type': 'int',
            'primary': true,
            'index': true,
            'unique': false,
            'nullable': false,
            'default': '',
            'comment': '自增唯一主键。系统保留字段，不可修改',
            'createDate': false,
            'updateDate': false,
            'length': 11,
            'columnId': 'id',
            'generated': true,
            'scale': 0
        },
        {
            'name': 'createTime',
            'type': 'datetime',
            'primary': false,
            'index': false,
            'unique': false,
            'nullable': true,
            'default': '',
            'comment': '系统会默认写入数据创建时间。系统保留字段，不可修改',
            'createDate': true,
            'updateDate': false,
            'length': 0,
            'columnId': 'createTime',
            'generated': false,
            'scale': 0
        },
        {
            'name': 'createUser',
            'type': 'varchar',
            'primary': false,
            'index': false,
            'unique': false,
            'nullable': true,
            'default': '',
            'comment': '系统会默认写入数据创建人。系统保留字段，不可修改',
            'createDate': false,
            'updateDate': false,
            'length': 255,
            'columnId': 'createUser',
            'generated': false,
            'scale': 0
        },
        {
            'name': 'updateTime',
            'type': 'datetime',
            'primary': false,
            'index': false,
            'unique': false,
            'nullable': true,
            'default': '',
            'comment': '系统会默认写入数据更新时间。系统保留字段，不可修改',
            'createDate': false,
            'updateDate': true,
            'length': 0,
            'columnId': 'updateTime',
            'generated': false,
            'scale': 0
        },
        {
            'name': 'updateUser',
            'type': 'varchar',
            'primary': false,
            'index': false,
            'unique': false,
            'nullable': true,
            'default': '',
            'comment': '系统会默认写入数据更新人。系统保留字段，不可修改',
            'createDate': false,
            'updateDate': false,
            'length': 255,
            'columnId': 'updateUser',
            'generated': false,
            'scale': 0
        },
        {
            'name': 'demo',
            'type': 'varchar',
            'primary': false,
            'index': false,
            'unique': false,
            'nullable': false,
            'default': '',
            'comment': '',
            'createDate': false,
            'updateDate': false,
            'length': '255',
            'columnId': 'jphmlphg',
            'generated': false,
            'scale': 0
        }
    ]
}]

// 下载表结构示例
export const downloadStructTemplate = (type) => {
    const fileName = type === 'sql' ? 'bklesscode-struct-demo.sql' : ''
    const files = generateExportStruct(demoTable, type, fileName)
    files.forEach(({ name, content }) => {
        downloadFile(content, name)
    })
}

// 下载数据示例
export const downloadDataTemplate = (type, demoData) => {
    const fileName = type === 'sql' ? 'bklesscode-data-demo.sql' : ''
    const files = generateExportDatas(demoData, type, fileName)
    files.forEach(({ name, content }) => {
        downloadFile(content, name)
    })
}
