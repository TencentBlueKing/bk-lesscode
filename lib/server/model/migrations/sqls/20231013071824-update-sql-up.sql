/* Replace with your SQL commands */
-- ----------------------------
-- TABLE STRUCTURE FOR ai_prompt
-- ----------------------------
CREATE TABLE `ai_prompt`  (
    `id` int(11) NOT NULL AUTO_INCREMENT COMMENT '自增唯一主键。系统保留字段，不可修改',
    `createTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) COMMENT '系统会默认写入数据创建时间。系统保留字段，不可修改',
    `createUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '系统会默认写入数据创建人。系统保留字段，不可修改',
    `updateTime` datetime(0) NULL DEFAULT CURRENT_TIMESTAMP(0) ON UPDATE CURRENT_TIMESTAMP(0) COMMENT '系统会默认写入数据更新时间。系统保留字段，不可修改',
    `updateUser` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '系统会默认写入数据更新人。系统保留字段，不可修改',
    `prompt` text NOT NULL,
    `deleteFlag` int(11) NULL DEFAULT 0 COMMENT '是否删除，1代表已删除',
    PRIMARY KEY (`id`) USING BTREE,
    INDEX `id`(`id`) USING BTREE,
    CONSTRAINT `_UNIQUE_id` UNIQUE(`id`)
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci  ROW_FORMAT = Dynamic;

INSERT INTO `ai_prompt`(`createTime`,`createUser`,`updateTime`,`updateUser`,`prompt`,`deleteFlag`) VALUES('2023-10-16 10:16:57','admin','2023-10-16 10:16:57','admin','帮我新增一个按钮',0);
INSERT INTO `ai_prompt`(`createTime`,`createUser`,`updateTime`,`updateUser`,`prompt`,`deleteFlag`) VALUES('2023-10-16 10:16:57','admin','2023-10-16 10:16:57','admin','清空画布',0);
INSERT INTO `ai_prompt`(`createTime`,`createUser`,`updateTime`,`updateUser`,`prompt`,`deleteFlag`) VALUES('2023-10-16 10:16:57','admin','2023-10-16 10:16:57','admin','删除组件{{ 组件id }}',0);
INSERT INTO `ai_prompt`(`createTime`,`createUser`,`updateTime`,`updateUser`,`prompt`,`deleteFlag`) VALUES('2023-10-16 10:16:57','admin','2023-10-16 10:16:57','admin','修改组件{{ 组件id }}的文本为你好',0);
INSERT INTO `ai_prompt`(`createTime`,`createUser`,`updateTime`,`updateUser`,`prompt`,`deleteFlag`) VALUES('2023-10-16 10:16:57','admin','2023-10-16 10:16:57','admin','修改组件{{ 组件id }}展示{{ 数据表名 }}表的数据',0);
INSERT INTO `ai_prompt`(`createTime`,`createUser`,`updateTime`,`updateUser`,`prompt`,`deleteFlag`) VALUES('2023-10-16 10:16:57','admin','2023-10-16 10:16:57','admin','修改组件{{ 组件id }}展示函数{{ 函数名 }}的数据',0);
INSERT INTO `ai_prompt`(`createTime`,`createUser`,`updateTime`,`updateUser`,`prompt`,`deleteFlag`) VALUES('2023-10-16 10:16:57','admin','2023-10-16 10:16:57','admin','给组件{{ 组件id }}添加点击事件，打印“我被点击了”',0);
