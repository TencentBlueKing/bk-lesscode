ALTER TABLE `flow_tpl`
ADD COLUMN `notifyConfig` longtext DEFAULT NULL COMMENT '任务执行通知配置' AFTER `edges`;
