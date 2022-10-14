ALTER TABLE `iam_app_perm_action`
ADD COLUMN `registeredStatus` int(11) DEFAULT 0 COMMENT '同步到权限中心的状态：0 为未同步；1 为已同步；-1 为已更新但未同步' AFTER `actionRelatedResourceId`;

ALTER TABLE `iam_app_perm_action`
ADD COLUMN `pageComponentRef` json COMMENT '页面组件引用记录' AFTER `registeredStatus`;
