/* Replace with your SQL commands */
ALTER TABLE `page`
ADD COLUMN `pageType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT '页面类型：PC 或 MOBILE' AFTER `pageCode`;

ALTER TABLE `layout`
ADD COLUMN `layoutType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT '布局模板类型：PC 或 MOBILE' AFTER `id`;

ALTER TABLE `comp`
ADD COLUMN `compType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT '自定义组件类型：PC 或 MOBILE' AFTER `id`;

ALTER TABLE `page_template`
ADD COLUMN `templateType` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin COMMENT '模板类型：PC 或 MOBILE' AFTER `templateCode`;