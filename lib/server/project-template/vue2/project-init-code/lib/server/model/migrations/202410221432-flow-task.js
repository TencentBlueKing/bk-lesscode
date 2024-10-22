const path = require('path')
const { execSql } = require('../../util')

export class FlowTask202410221432 {
    async up (queryRunner) {
        await execSql(queryRunner, path.resolve(__dirname, './sql/202410221432-flow-task.sql'))
    }

    async down () {}
}