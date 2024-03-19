ALTER TABLE `saas_module_story`
ADD COLUMN `projectId` int(11) NULL DEFAULT 0 COMMENT 'projectId' AFTER `moduleId`;