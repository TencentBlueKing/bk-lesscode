/* Replace with your SQL commands */
ALTER TABLE `query_record` 
ADD COLUMN `dataSourceType` varchar(50) NULL COMMENT '数据来源' AFTER `message`;
