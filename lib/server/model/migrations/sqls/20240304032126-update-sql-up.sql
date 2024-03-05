ALTER TABLE `release_version`
ADD COLUMN `releaseMd5` varchar(40) CHARACTER SET utf8 COLLATE utf8_general_ci NULL DEFAULT NULL COMMENT '源码包md5' AFTER `moduleCode`;