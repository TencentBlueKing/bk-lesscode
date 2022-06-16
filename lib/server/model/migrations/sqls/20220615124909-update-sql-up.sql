/* Replace with your SQL commands */

ALTER TABLE `func` 
CHANGE COLUMN `apiId` `apiCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT 'Api Code' AFTER `funcCode`;

DROP TABLE IF EXISTS `r_func_api`;
CREATE TABLE `r_func_api`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updateTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '最新更新时间',
  `createUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '创建人，默认当前用户',
  `updateUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '更新人，默认当前用户',
  `deleteFlag` int(11) NULL DEFAULT 0 COMMENT '是否删除，1代表已删除',
  `funcCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '函数code',
  `apiCode` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '函数code',
  `projectId` int(11) NULL DEFAULT NULL COMMENT '项目id',
  `versionId` int(11) NULL DEFAULT NULL COMMENT '版本id',
  PRIMARY KEY (`id`),
  INDEX `id`(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;
