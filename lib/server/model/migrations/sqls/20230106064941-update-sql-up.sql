ALTER TABLE `r_page_comp`
ADD COLUMN `compVersion` varchar(50) NULL COMMENT '组件版本号' AFTER `versionId`;

ALTER TABLE `r_page_comp`
ADD COLUMN `compType` varchar(50) NULL COMMENT '组件ID' AFTER `versionId`;