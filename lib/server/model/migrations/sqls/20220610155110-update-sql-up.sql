ALTER TABLE `form`
ADD COLUMN `formName` varchar(60) CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL COMMENT 'form名称' AFTER `id`;