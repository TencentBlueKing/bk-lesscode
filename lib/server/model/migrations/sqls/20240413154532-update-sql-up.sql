DROP TABLE IF EXISTS `flow_tpl`;
CREATE TABLE `flow_tpl`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '流程名称',
  `summary` varchar(255) DEFAULT NULL COMMENT '流程描述',
  `nodes` longtext DEFAULT NULL COMMENT '流程节点',
  `edges` longtext DEFAULT NULL COMMENT '流程连线',
  `projectId` int(11) DEFAULT NULL COMMENT '项目id',
  `deployed` int(11) DEFAULT 0 COMMENT '流程是否部署，1代表已部署',
  `createTime` datetime(0) DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updateTime` datetime(0) DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '最新更新时间',
  `createUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '创建人，默认当前用户',
  `updateUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '更新人，默认当前用户',
  `deleteFlag` int(11) DEFAULT 0 COMMENT '是否删除，1代表已删除',
  PRIMARY KEY (`id`),
  INDEX `id`(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;

DROP TABLE IF EXISTS `flow_task`;
CREATE TABLE `flow_task`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `tplId` int(11) DEFAULT NULL COMMENT '流程模板id',
  `nodes` longtext DEFAULT NULL COMMENT '流程节点快照',
  `edges` longtext DEFAULT NULL COMMENT '流程连线快照',
  `projectId` int(11) DEFAULT NULL COMMENT '项目id',
  `createTime` datetime(0) DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updateTime` datetime(0) DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '最新更新时间',
  `createUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '创建人，默认当前用户',
  `updateUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '更新人，默认当前用户',
  `deleteFlag` int(11) DEFAULT 0 COMMENT '是否删除，1代表已删除',
  PRIMARY KEY (`id`),
  INDEX `id`(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = DYNAMIC;
