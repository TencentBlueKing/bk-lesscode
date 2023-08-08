ALTER TABLE `project`
ADD COLUMN `archiveFlag` int(11) DEFAULT 0 COMMENT '1表示已归档' AFTER `deleteFlag`;