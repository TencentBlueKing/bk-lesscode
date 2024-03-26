import { Entity, Column } from 'typeorm'
import Base from './base'

@Entity({ name: 'saas_backend', comment: 'saas后端模块' })
export default class extends Base {
    @Column({ type: 'varchar' })
    appCode

    @Column({ type: 'varchar' })
    moduleCode

    @Column({ type: 'int' })
    projectId

    @Column({ type: 'varchar' })
    activeUser

    @Column({
        type: 'datetime',
        comment: '最后活跃时间'
    })
    activeTime
}
