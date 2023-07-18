/* Replace with your SQL commands */
ALTER TABLE `comp`
ADD COLUMN `publicType` varchar(50) DEFAULT 'INFO' COMMENT '公开分类' AFTER `isPublic`;