/* Replace with your SQL commands */
ALTER TABLE `data_table`
ADD COLUMN `source` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '表来源' AFTER `comment`;
