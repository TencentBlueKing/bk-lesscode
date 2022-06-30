ALTER TABLE `release_version` 
ADD COLUMN `releaseSqlIds` varchar(255) NULL COMMENT '本次发布执行的sql id' AFTER `isOffline`;