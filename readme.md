![](./lib/client/src/images/logo-name.png)

---

[![license](https://img.shields.io/badge/license-MIT-brightgreen.svg?style=flat)](https://github.com/TencentBlueKing/bk-lesscode/blob/develop/LICENSE.txt) [![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/TencentBlueKing/bk-lesscode/pulls) 

## 简介
蓝鲸智云运维开发平台(LessCode)提供了前端页面在线可视化拖拽组装、配置编辑、源码生成、二次开发等能力。旨在帮助用户通过尽量少的手写代码的方式快速设计和开发SaaS。本次平台开源部分支持基于Vuejs的UI组件拖拽及源码生成，未来我们将持续更新扩充平台能力。

## 功能特性
- 可视化拖拽布局：集成蓝鲸MagicBox Vue通用组件，支持在线画布拖拽组件进行页面布局编辑、在线预览、查看及下载源码
- 在线函数库管理：支持在线灵活编写管理事件函数及远程接口返回数据清洗函数
- 数据源管理：在线建表及数据处理
- 表单引擎：支持纯表单类页面及表单数据校验、提交等操作
- 流程引擎：支持流程管理，在线流程创建、编辑等操作
- 在线组件配置：支持组件样式、属性、事件在线配置
- 导航布局：提供多种导航布局
- 支持自定义组件开发：提供自定义组件开发规范及示例，开放自定义组件开发能力，满足业务场景组件集成需求
- 二次开发能力：生成的Vue源码文件支持无缝集成到蓝鲸前端开发框架([BKUI-CLI](https://bk.tencent.com/docs/document/6.0/130/5940))进行二次开发

## 代码目录

运维开发平台源代码目录结构如下：

```bash
├── README.md
├── docs/                   # 文档目录
│   ......
├── lib/                    # 源码目录
│   ├── client/             # 前端源码目录
│   │   ├── index.html      # 生产环境使用的 html
│   │   ├── preview.html    # 预览模块使用的 html
│   │   ├── require-monaco.html # 辅助引入 monaco 编辑器的 html
│   │   ├── src/            # 前端源码目录
│   │   │   ├── App.vue     # App 组件
│   │   │   ├── main.js     # 主入口
│   │   │   ├── api/        # 前端 ajax 目录
│   │   │       ......
│   │   │   ├── common/     # 常用前端模块目录
│   │   │       ......
│   │   │   ├── components/ # 前端组件目录
│   │   │       ......
│   │   │   ├── css/        # 前端 css 目录
│   │   │       ......
│   │   │   ├── element-materials/  # 基础组件的配置以及修改配置和页面渲染的逻辑
│   │   │   │       ......
│   │   │   ├── images/     # 前端使用的图片存放目录
│   │   │       .....
│   │   │   ├── preview/    # 前端预览模块 目录
│   │   │       ......
│   │   │   ├── router/     # 前端 router 目录
│   │   │       ......
│   │   │   ├── store/      # 前端 store 目录
│   │   │       ......
│   │   │   ├── views/      # 前端页面目录
│   │   │       ......
│   │   └── static/         # 前端静态资源目录
│   │       ......
│   └── server/             # 后端源码目录
│       ├── app.browser.js  # 服务器启动文件
│       ├── logger.js       # 后端日志组件
│       ├── util.js         # 后端工具方法
│       ├── conf/           # 后端配置文件目录
│       │   ......
│       ├── controller/     # 后端 controller 目录
│       │   ......
│       ├── middleware/     # 后端中间件目录
│       │   ......
│       ├── model/          # 后端实体目录
│       │   ......
│       ├── project-template/  # 后端生成项目源码模板
│       │   ......
│       ├── router/         # 后端路由目录
│       │   ......
│       ├── service/        # 后端服务目录
│       │   ......
│       ├── utils/          # 后端utils 目录
│       │   ......
├── scripts                 # 项目脚本
├── package.json            # 项目描述文件
├── forever.json            # forever 配置文件
├── .bk.env                 # 基础变量
├── .bk.development.env     # 开发环境变量
├── .bk.production.env      # 生产环境变量
```

## 技术栈

运维开发平台采用的主要技术如下：

1. 前端：主要是 Vue 全家桶，包括 vue, vue-router, vuex，使用 vuedraggable 来实现拖拽，前端工程化采用的是常用的 webpack 方案。
2. 后端：使用 koa@2 为服务器，mysql 为数据库。本地开发时使用 nodemon 作为进程管理，生产环境使用 forever 作为进程守护。

## 依赖说明

#### 环境依赖
项目主要的依赖是目前常用的比较新的模块，webpack@4，babel@7，vue@2，koa@2 等。**运行的 nodejs 要求为 >= 8.9.0**。

> 安装 Node.js 参见[官方文档](https://nodejs.org/)。安装完成后，注意设置 node 到 PATH 中

#### 服务依赖
- 蓝鲸软件基础环境（必须）：运维开发平台的登录及权限管理依赖于【蓝鲸软件基础环境】，请事先[下载搭建](https://bk.tencent.com/download/)
- 蓝鲸网关（非必须）：如需使用运维开发平台提供的API网关资源，请事先在【蓝鲸软件7.X环境】更新【蓝鲸网关（bk-apigateway）】的版本到【0.4.41】及以上
- 蓝鲸制品库服务（非必须）： 若需要使用到运维开发平台的自定义组件功能开发模块及文件库能力，请事先搭建 [蓝鲸制品库服务](https://github.com/Tencent/bk-ci/tree/master/src/backend/storage/core)， **搭建时并开启npm-registry**
- 蓝鲸PaaS3.0（非必须）：运维开发平台提供的一键部署能力依赖蓝鲸PaaS3.0平台能力，若需要请事先在【蓝鲸软件7.X环境】更新【蓝鲸PaaS3.0（bkpaas3）】的版本到【0.1.0-beta5】及以上
- 流程服务（非必须）：若需运维开发平台提供的流程类场景服务，请事先在【蓝鲸软件7.X环境】更新【流程服务（bk-itsm）】的版本到【2.6.1】及以上
- 蓝鲸基础计算平台（非必须）：若需运维开发平台提供的BKBase结果表作为数据源操作，请事先在【蓝鲸软件7.X环境】更新【蓝鲸基础计算平台（BKBase）】版本到【3.7】及以上

## 分支说明
运维开发平台使用 develop, master 两个分支进行迭代。其中 master 为稳定版分支，每次 release develop 为日常开发的分支，给运维开发平台贡献代码统一向主库 [bk-lesscode](https://github.com/TencentBlueKing/bk-lesscode/tree/master) 的  [develop](https://github.com/TencentBlueKing/bk-lesscode/tree/develop) 分支提 pr。

## 安装部署
- [本地开发部署](./docs/install/dev_install.md)
- [生产环境部署](./docs/install/prod_install.md)
- [数据库说明](./docs/install/database.md)
- [配置文件说明](./docs/install/conf.md)

## 开发文档
- [自定义组件开发和管理文档](./lib/client/src/views/help/docs/custom.md)
