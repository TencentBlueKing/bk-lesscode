/* Replace with your SQL commands */

ALTER TABLE `form`
ADD COLUMN `pageId` int(11) DEFAULT NULL COMMENT '表单在哪个自定义页面创建' AFTER `versionId`;

ALTER TABLE `form`
ADD COLUMN `componentId` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL COMMENT '表单由哪个表单容器创建' AFTER `pageId`;
