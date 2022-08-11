ALTER TABLE `form`
ADD COLUMN `tableName` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '关联数据表名称' AFTER `content`;