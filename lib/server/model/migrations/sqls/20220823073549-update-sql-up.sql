ALTER TABLE `project`
ADD COLUMN `templateImg` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL COMMENT '模板预览图' AFTER `isOffcial`;