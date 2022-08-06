const path = require('path')
const { OrmLog } = require('../logger')

const config = process.env.NODE_ENV === 'production'
    // v3 环境数据库配置
    ? {
        // 线上数据库名
        database: process.env.GCS_MYSQL_NAME || process.env.MYSQL_NAME,
        // 线上数据库用户名
        username: process.env.GCS_MYSQL_USER || process.env.MYSQL_USER,
        // 线上数据库密码
        password: process.env.GCS_MYSQL_PASSWORD || process.env.MYSQL_PASSWORD,
        // 线上host
        host: process.env.GCS_MYSQL_HOST || process.env.MYSQL_HOST,
        // 线上端口
        port: process.env.GCS_MYSQL_PORT || process.env.MYSQL_PORT,
        dialect: 'mysql',
        // 线上记录日志类型，默认为记录 error 日志，可选为 ['error', 'info', 'warn']
        logging: ['error']
    }
    // 本地开发环境数据库配置
    : {
        // 本地开发数据库名
        database: '',
        // 本地开发数据库用户名
        username: '',
        // 本地开发数据库密码
        password: '',
        // 本地开发host
        host: 'localhost',
        // 本地开发端口
        port: 3306,
        dialect: 'mysql',
        // 本地记录日志类型，默认为记录所有日志，可选为 ['error', 'info', 'warn']
        logging: ['error', 'warn']
    }

module.exports = {
    type: 'mysql',
    host: config.host,
    port: config.port,
    username: config.username,
    password: config.password,
    database: config.database,
    entities: [path.resolve(__dirname, '..', 'model/entities/!(base){.js,.ts}')],
    // 打印日志的类型
    logger: new OrmLog(config.logging),
    // 自动同步数据库表结构，有删除数据风险，推荐关闭
    synchronize: false,
    // 会自动执行更新SQL
    migrationsRun: true,
    migrationsTableName: 'lesscode_migrations_data',
    migrations: [path.resolve(__dirname, '..', 'model/migrations/*.js')],
    extra: {
        connectionLimit: 5
    }
}
