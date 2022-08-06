ALTER TABLE `flow`
ADD COLUMN `deployed` int(11) DEFAULT 0 COMMENT '流程编辑后是否被部署' AFTER `itsmId`;
