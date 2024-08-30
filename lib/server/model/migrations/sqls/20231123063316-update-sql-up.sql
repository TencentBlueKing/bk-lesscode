/* Replace with your SQL commands */
-- ----------------------------
-- TABLE STRUCTURE FOR third_part_db
-- ----------------------------
CREATE TABLE `third_part_db`  (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增唯一主键。系统保留字段，不可修改',
    `createTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '系统会默认写入数据创建时间。系统保留字段，不可修改',
    `createUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '系统会默认写入数据创建人。系统保留字段，不可修改',
    `updateTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '系统会默认写入数据更新时间。系统保留字段，不可修改',
    `updateUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '系统会默认写入数据更新人。系统保留字段，不可修改',
    `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `password` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `host` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `projectId` int(11) NOT NULL,
    `dbName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `port` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
    `deleteFlag` int(11) NULL DEFAULT 0 COMMENT '是否删除，1代表已删除',
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `id`(`id`) USING BTREE,
    CONSTRAINT `_UNIQUE_id` UNIQUE(`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT 'third_part_db' ROW_FORMAT = Dynamic;

-- ----------------------------
-- MODIFY TABLE data_table
-- ----------------------------
ALTER TABLE `data_table`
ADD COLUMN `thirdPartDBId` int(11) NOT NULL;

-- ----------------------------
-- MODIFY TABLE query_record
-- ----------------------------
ALTER TABLE `query_record`
ADD COLUMN `thirdPartDBName` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '第三方 db 名';
