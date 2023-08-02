import { Entity, Column } from 'typeorm'
import Base from './base'

@Entity({ name: 'white_list', comment: '白名单' })
export default class extends Base {
    @Column({ type: 'varchar' })
    userName

    @Column({ type: 'varchar' })
    type
}
