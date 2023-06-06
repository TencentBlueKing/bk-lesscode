/* Replace with your SQL commands */
ALTER TABLE `page_template`
ADD COLUMN `framework` varchar(50) NULL COMMENT '框架';

ALTER TABLE `project`
ADD COLUMN `framework` varchar(50) NULL COMMENT '框架';

ALTER TABLE `comp`
ADD COLUMN `framework` varchar(50) NULL COMMENT '框架';
