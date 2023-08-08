import { Entity, Column } from 'typeorm'
import Base from './base'

@Entity({ name: 'project', comment: '项目表' })
export default class extends Base {
    @Column({
        type: 'varchar',
        length: 255, // default
        nullable: false, // default
        comment: '项目 ID 即英文名称'
    })
    projectCode

    @Column({
        type: 'varchar',
        comment: '项目名称'
    })
    projectName

    @Column({
        type: 'varchar',
        nullable: true,
        comment: '项目简介'
    })
    projectDesc

    @Column({
        type: 'int',
        nullable: false,
        default: '0',
        comment: '项目状态：0 为正常，1 为私有，2 为删除'
    })
    status

    @Column({
        type: 'varchar',
        nullable: true,
        comment: '绑定蓝鲸应用'
    })
    appCode

    @Column({
        type: 'varchar',
        nullable: true,
        comment: '绑定应用模块'
    })
    moduleCode

    @Column({
        type: 'int',
        default: '0',
        comment: '是否归档，1为是'
    })
    archiveFlag

    @Column({
        type: 'int',
        default: '0',
        comment: '是否官方项目模板，1为是'
    })
    isOffcial

    @Column({
        type: 'varchar',
        nullable: true,
        comment: '模板预览图'
    })
    templateImg

    @Column({
        type: 'int',
        default: '0',
        comment: '是否开启数据源，1代表已开启'
    })
    isEnableDataSource

    @Column({
        type: 'varchar',
        comment: '模板分类'
    })
    offcialType

    @Column({
        type: 'varchar',
        nullable: true,
        comment: '创建人，默认当前用户'
    })
    createUser

    @Column({
        type: 'varchar',
        nullable: true,
        comment: '更新人，默认当前用户'
    })
    updateUser

    @Column({
        type: 'varchar',
        comment: '框架'
    })
    framework
}
