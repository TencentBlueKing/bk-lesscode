const path = require('path')
const { execSql } = require('../../util')

export class FlowTask172957872000 {
    async up (queryRunner) {
        await execSql(queryRunner, path.resolve(__dirname, './sql/172957872000-flow-task.sql'))
    }

    async down () {}
}