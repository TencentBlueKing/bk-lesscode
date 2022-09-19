/* Replace with your SQL commands */
ALTER TABLE `layout_inst` 
ADD COLUMN `layoutType` varchar(50) NOT NULL COMMENT '值为"MOBILE"或"PC"' AFTER `layoutCode`;
