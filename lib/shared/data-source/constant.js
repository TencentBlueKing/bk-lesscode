/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */
import { sharedI18n } from '../util'
/**
 * 数据源，公共 orm columns
 */
export const BASE_COLUMNS = () => ([
    {
        name: 'id',
        columnId: 'id',
        type: 'int',
        primary: true,
        generated: true,
        index: true,
        nullable: false,
        unique: true,
        comment: sharedI18n().t('自增唯一主键。系统保留字段，不可修改')
    },
    {
        name: 'createTime',
        columnId: 'createTime',
        type: 'datetime',
        createDate: true,
        nullable: true,
        default: 'CURRENT_TIMESTAMP',
        comment: sharedI18n().t('系统会默认写入数据创建时间。系统保留字段，不可修改')
    },
    {
        name: 'createUser',
        columnId: 'createUser',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: sharedI18n().t('系统会默认写入数据创建人。系统保留字段，不可修改')
    },
    {
        name: 'updateTime',
        columnId: 'updateTime',
        type: 'datetime',
        updateDate: true,
        nullable: true,
        default: 'CURRENT_TIMESTAMP',
        comment: sharedI18n().t('系统会默认写入数据更新时间。系统保留字段，不可修改')
    },
    {
        name: 'updateUser',
        columnId: 'updateUser',
        type: 'varchar',
        length: 255,
        nullable: true,
        comment: sharedI18n().t('系统会默认写入数据更新人。系统保留字段，不可修改')
    }
])

/**
 * 数据源使用的 ORM KEYS
 */
export const ORM_KEYS = [
    'name',
    'type',
    'primary',
    'index',
    'nullable',
    'unique',
    'default',
    'comment',
    'createDate',
    'updateDate',
    'length',
    'columnId',
    'generated',
    'scale'
]

/**
 * 数据源字段类型
 */
export const FIELDS_TYPES = [
    {
        id: 'varchar',
        name: 'varchar',
        defaultValue: ''
    },
    {
        id: 'int',
        name: 'int',
        defaultValue: 0
    },
    {
        id: 'date',
        name: 'date',
        defaultValue: ''
    },
    {
        id: 'datetime',
        name: 'datetime',
        defaultValue: ''
    },
    {
        id: 'text',
        name: 'text',
        defaultValue: ''
    },
    {
        id: 'decimal',
        name: 'decimal',
        defaultValue: 0
    },
    {
        id: 'json',
        name: 'json',
        defaultValue: {}
    }
]

/**
 * typeorm 不支持 length 属性的 key
 */
export const NO_LENGTH_ORM_KEY = [
    'decimal',
    'datetime',
    'text',
    'int',
    'json'
]

/**
 * 数据的修改类型
 */
export const DATA_MODIFY_TYPE = {
    INSERT: 'insert',
    UPDATE_INSERT: 'update_insert',
    DE_DUPLICATION_INSERT: 'de_duplication_insert',
    UPDATE: 'update',
    DELETE: 'delete'
}

/**
 * 索引的修改类型
 */
export const INDEX_MODIFY_TYPE = {
    DROP: 'DROP',
    ADD: 'ADD'
}

/**
 * 唯一性约束的修改类型
 */
export const UNIQUE_MODIFY_TYPE = {
    DROP: 'DROP',
    ADD: 'ADD'
}

/**
 * 字段的修改类型
 */
export const FIELD_MODIFY_TYPE = {
    CHANGE_COLUMN: (name) => `CHANGE COLUMN ${name}`,
    MODIFY_COLUMN: 'MODIFY COLUMN',
    ADD_COLUMN: 'ADD COLUMN',
    DROP_COLUMN: 'DROP COLUMN'
}

/**
 * 表的修改类型
 */
export const TABLE_MODIFY_TYPE = {
    CREATE: 'create',
    MODIFY: 'modify',
    DROP: 'drop',
    RENAME: 'rename',
    COMMENT: 'comment'
}

/**
 * 部署使用的 migration 表名
 */
export const MIGRATION_TABLE_NAME = 'lesscode_migrations_data'

/**
 * 表连接类型
 */
export const JOIN_TYPE = {
    LEFT_JOIN: 'LEFT JOIN',
    INNER_JOIN: 'INNER JOIN',
    RIGHT_JOIN: 'RIGHT JOIN'
}

/**
 * 条件类型
 */
export const CONDITION_TYPE = {
    AND: 'AND',
    OR: 'OR'
}

/**
 * 排序类型
 */
export const ORDER_TYPE = {
    ASC: 'ASC',
    DESC: 'DESC'
}

/**
 * sql 函数类型
 */
export const SQL_FUNCTION_TYPE = () => ({
    NONE: {
        VAL: '',
        NAME: sharedI18n().t('默认字段')
    },
    AVG: {
        VAL: 'AVG',
        NAME: 'AVG'
    },
    COUNT: {
        VAL: 'COUNT',
        NAME: 'COUNT'
    },
    MAX: {
        VAL: 'MAX',
        NAME: 'MAX'
    },
    MIN: {
        VAL: 'MIN',
        NAME: 'MIN'
    },
    SUM: {
        VAL: 'SUM',
        NAME: 'SUM'
    }
})

// 连接类型
export const CONNECT_TYPE_LIST = [
    '=',
    '>',
    '<',
    '>=',
    '<=',
    '!=',
    'LIKE',
    'BETWEEN',
    'IN',
    'NOT IN',
    'IS NULL',
    'NOT NULL'
]

// 数据源来源类型
export const DATA_SOURCE_TYPE = {
    PREVIEW: 'preview',
    BK_BASE: 'bk-base'
}

// 数据源导入导出文件类型
export const DATA_FILE_TYPE = {
    SQL: 'sql',
    XLSX: 'xlsx'
}

// 数据导入操作类型
export const DATA_IMPORT_OPERATION_TYPE = () => (
    {
        ALL_INSERT: {
            ID: 'ALL_NEW',
            NAME: sharedI18n().t('新增导入'),
            TIPS: sharedI18n().t('1. 所有导入的数据以新增的方式插入数据库<br />2. 新增数据的唯一性约束字段不能和已有数据重复，否则新增失败')
        },
        UPDATE_INSERT: {
            ID: 'UPDATE_NEW',
            NAME: sharedI18n().t('更新导入'),
            TIPS: sharedI18n().t('1. 导入的数据中，如果某条数据已经在数据库中存在则更新这条数据。如果不存在则新增这条数据<br />2. 通过表结构中的唯一性约束字段或者ID字段判断是否在数据库中存在该条数据')
        },
        DE_DUPLICATION_INSERT: {
            ID: 'DE_DUPLICATION_NEW',
            NAME: sharedI18n().t('去重导入'),
            TIPS: sharedI18n().t('1. 导入的数据中，如果某条数据已经在数据库中存在则忽略这条数据。如果不存在则新增这条数据<br />2. 通过表结构中的唯一性约束字段或者ID字段判断是否在数据库中存在该条数据')
        }
    }
)
