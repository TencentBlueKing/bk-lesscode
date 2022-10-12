ALTER TABLE `iam_app_perm_action`
ADD COLUMN `registeredStatus` int(11) DEFAULT 0 COMMENT '注册到权限中心的状态：0 为未注册；1 为已注册；-1 为已注册到权限中心但在 lesscode 中被删除的状态，当部署到权限中心后，-1 状态的操作会被真正删除' AFTER `actionRelatedResourceId`;

ALTER TABLE `iam_app_perm_action`
ADD COLUMN `pageComponentRef` json COMMENT '页面组件引用记录' AFTER `registeredStatus`;
