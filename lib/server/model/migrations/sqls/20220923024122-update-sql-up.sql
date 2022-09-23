/* Replace with your SQL commands *//* Replace with your SQL commands */
DROP TABLE IF EXISTS `iam_app_perm_model`;
CREATE TABLE `iam_app_perm_model`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updateTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '最新更新时间',
  `createUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '创建人，默认当前用户',
  `updateUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '更新人，默认当前用户',
  `deleteFlag` int(11) NULL DEFAULT 0 COMMENT '是否删除，1代表已删除',
  `projectId` int(11) NULL DEFAULT NULL COMMENT '应用id',
  `actionId` varchar(50) NOT NULL COMMENT '操作id',
  `actionName` varchar(510) NOT NULL COMMENT '操作名称',
  `actionNameEn` varchar(510) NOT NULL COMMENT '操作名称英文',
  `actionDesc` varchar(510) NULL COMMENT '操作描述',
  `actionDescEn` varchar(510) NULL COMMENT '操作描述英文',
  `actionType` varchar(50) NULL COMMENT '操作类型',
  `actionRelatedResourceId` json NULL COMMENT '关联资源id',
  PRIMARY KEY (`id`),
  INDEX `id`(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;


ALTER TABLE `project`
ADD COLUMN `isRegistryInIam` int(11) NOT NULL DEFAULT '0' COMMENT '应用权限模型是否注册到权限中心：0 为未注册，1 为已注册' AFTER `isEnableDataSource`
