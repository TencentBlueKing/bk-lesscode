DROP TABLE IF EXISTS `iam_migration`;
CREATE TABLE `iam_migration` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createTime` datetime DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 ROW_FORMAT=DYNAMIC COMMENT='iam-migration记录表';

SET FOREIGN_KEY_CHECKS = 1;
