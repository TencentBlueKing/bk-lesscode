ALTER TABLE `flow`
ADD COLUMN `pageId` int(11) NULL COMMENT '对应流程表单页面id' AFTER `itsmId`;

ALTER TABLE `flow`
ADD COLUMN `managePageIds` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL COMMENT '对应数据管理页id，英文逗号分隔' AFTER `itsmId`;

ALTER TABLE `flow`
ADD COLUMN `formIds` text COMMENT '节点对应表单id' AFTER `itsmId`;

ALTER TABLE `flow`
DROP COLUMN `dataSourceIds`;