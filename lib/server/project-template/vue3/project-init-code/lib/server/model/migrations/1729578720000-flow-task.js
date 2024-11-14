const path = require('path')
const { execSql } = require('../../util')

export class FlowTask1729578720000 {
    async up (queryRunner) {
        await execSql(queryRunner, path.resolve(__dirname, './sql/1729578720000-flow-task.sql'))
    }

    async down () {}
}