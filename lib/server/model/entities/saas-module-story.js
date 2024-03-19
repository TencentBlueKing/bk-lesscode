import { Entity, Column } from 'typeorm'
import Base from './base'

@Entity({ name: 'saas_module_story', comment: 'saas后端模块' })
export default class extends Base {
    @Column({ type: 'int' })
    moduleId

    @Column({ type: 'int' })
    projectId

    @Column({ type: 'varchar' })
    uuid

    @Column({ type: 'text' })
    story
}
