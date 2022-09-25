/* Replace with your SQL commands *//* Replace with your SQL commands */
DROP TABLE IF EXISTS `iam_app_perm`;
CREATE TABLE `iam_app_perm`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updateTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '最新更新时间',
  `createUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '创建人，默认当前用户',
  `updateUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '更新人，默认当前用户',
  `deleteFlag` int(11) NULL DEFAULT 0 COMMENT '是否删除，1代表已删除',

  `projectId` int(11) NULL DEFAULT NULL COMMENT '应用 id',
  `systemId` varchar(50) NOT NULL COMMENT '注册到权限中心的系统 id',
  `systemName` varchar(510) NOT NULL COMMENT '注册到权限中心的系统名称',
  `systemNameEn` varchar(510) NOT NULL COMMENT '注册到权限中心的系统名称英文',
  `systemDesc` varchar(510) NULL COMMENT '注册到权限中心的系统描述',
  `systemDescEn` varchar(510) NULL COMMENT '注册到权限中心的系统描述英文',
  `systemClients` varchar(510) NOT NULL COMMENT '有权限调用的客户端，即有权限调用的 app_code 列表',
  `systemProviderConfig` json NULL COMMENT '权限中心回调接入系统的配置文件',
  `deployed` int(11) NULL DEFAULT 0 COMMENT '是否部署到权限中心，0 为未部署，1 为已部署',

  `resourceTypeId` varchar(50) NOT NULL COMMENT '注册到权限中心的资源类型 id',
  `resourceTypeName` varchar(510) NOT NULL COMMENT '注册到权限中心的资源类型名称',
  `resourceTypeNameEn` varchar(510) NOT NULL COMMENT '注册到权限中心的资源类型名称英文',
  `resourceTypeDesc` varchar(510) NULL COMMENT '注册到权限中心的资源类型描述',
  `resourceTypeDescEn` varchar(510) NULL COMMENT '注册到权限中心的资源类型描述英文',
  `resourceTypeProviderConfig` json NULL COMMENT '权限中心回调接入资源类型的配置文件',

  `instanceSelectionId` varchar(50) NOT NULL COMMENT '注册到权限中心的实例视图 id',
  `instanceSelectionName` varchar(510) NOT NULL COMMENT '注册到权限中心的实例视图名称',
  `instanceSelectionNameEn` varchar(510) NOT NULL COMMENT '注册到权限中心的实例视图名称英文',
  `instanceSelectionResourceTypeChain` json NOT NULL COMMENT '注册到权限中心实例视图的资源类型层级链路',
  PRIMARY KEY (`id`),
  INDEX `id`(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '应用权限模型-系统资源类型实例视图表' ROW_FORMAT = DYNAMIC;

DROP TABLE IF EXISTS `iam_app_perm_action`;
CREATE TABLE `iam_app_perm_action`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `createTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '创建时间',
  `updateTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '最新更新时间',
  `createUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '创建人，默认当前用户',
  `updateUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '更新人，默认当前用户',
  `deleteFlag` int(11) NULL DEFAULT 0 COMMENT '是否删除，1代表已删除',

  `iamAppPermId` int(11) NULL DEFAULT NULL COMMENT '应用权限模型-系统资源类型实例视图表 id',
  `projectId` int(11) NULL DEFAULT NULL COMMENT '应用 id',
  `actionId` varchar(50) NOT NULL COMMENT '操作 id',
  `actionName` varchar(510) NOT NULL COMMENT '操作名称',
  `actionNameEn` varchar(510) NOT NULL COMMENT '操作名称英文',
  `actionDesc` varchar(510) NULL COMMENT '操作描述',
  `actionDescEn` varchar(510) NULL COMMENT '操作描述英文',
  `actionType` varchar(50) NULL COMMENT '操作类型',
  `actionRelatedResourceId` json NULL COMMENT '关联资源 id',
  PRIMARY KEY (`id`),
  INDEX `id`(`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci COMMENT = '应用权限模型-操作表' ROW_FORMAT = DYNAMIC;
