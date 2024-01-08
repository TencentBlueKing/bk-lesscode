CREATE TABLE `saas_module_story`  (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增唯一主键。系统保留字段，不可修改',
    `createTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '系统会默认写入数据创建时间。系统保留字段，不可修改',
    `createUser` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '系统会默认写入数据创建人。系统保留字段，不可修改',
    `updateTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '系统会默认写入数据更新时间。系统保留字段，不可修改',
    `updateUser` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '系统会默认写入数据更新人。系统保留字段，不可修改',
    `moduleId` int(11) NULL DEFAULT 0 COMMENT '所属module对应的saas-backend表id',
    `uuid` varchar(30) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '本条需求的唯一标识',
    `story` text NOT NULL COMMENT '需求描述',
    `deleteFlag` int(11) NULL DEFAULT 0 COMMENT '是否删除，1代表已删除',
    PRIMARY KEY (`id`),
    INDEX `id`(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci  ROW_FORMAT = Dynamic;