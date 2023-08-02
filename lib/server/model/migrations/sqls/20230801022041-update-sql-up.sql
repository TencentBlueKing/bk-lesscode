/* Replace with your SQL commands */
-- ----------------------------
-- TABLE STRUCTURE FOR white_list
-- ----------------------------
DROP TABLE IF EXISTS `white_list`;
CREATE TABLE `white_list`  (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增唯一主键。系统保留字段，不可修改',
    `createTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '系统会默认写入数据创建时间。系统保留字段，不可修改',
    `createUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '系统会默认写入数据创建人。系统保留字段，不可修改',
    `updateTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '系统会默认写入数据更新时间。系统保留字段，不可修改',
    `updateUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '系统会默认写入数据更新人。系统保留字段，不可修改',
    `userName` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '用户名',
    `type` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL COMMENT '白名单类型',
    `deleteFlag` int(11) NULL DEFAULT 0 COMMENT '是否删除，1代表已删除',
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `id`(`id`) USING BTREE,
    CONSTRAINT `_UNIQUE_id` UNIQUE(`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT 'white_list' ROW_FORMAT = Dynamic;
