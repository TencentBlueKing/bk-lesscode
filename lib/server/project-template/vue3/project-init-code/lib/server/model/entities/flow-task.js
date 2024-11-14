import { Entity, Column } from 'typeorm'
import Base from './base'

@Entity({ name: 'flow_task', comment: '应用创建的任务' })
export default class extends Base {
    // 关联的流程id
    @Column({ type: 'int' })
    tplId

    // 和bkflow关联的任务id
    @Column({ type: 'int' })
    bkFlowTaskId

    // 流程任务名称
    @Column({ type: 'varchar', length: 100 })
    name

    // 节点配置，创建任务时的快照
    @Column({ type: 'longtext' })
    nodes

    // 连线配置，创建任务时的快照
    @Column({ type: 'longtext' })
    edges

    // 是否删除，默认值为0，表示未删除，1为已删除
    @Column({ type: 'int' })
    deleteFlag

}