/* Replace with your SQL commands */
ALTER TABLE `func` 
ADD COLUMN `apiChoosePath` json NULL COMMENT '选择的api' AFTER `apiBody`;
