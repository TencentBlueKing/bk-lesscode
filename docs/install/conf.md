# 蓝鲸智云运维开发平台（LessCode）

## 配置文件说明

在将代码拉取到本地准备开发之前，需先将配置信息填写好，相应的配置文件位于`lesscode/lib/server/conf`和根目录下，

- 其中必须配置的文件为data-base.js、db-migrate.json、http.js、.bk.local.env
- 可选的配置文件为npm.js和bk-repo.js

### 各配置文件说明如下： 
#### .bk.local.env (全局变量配置)

在项目根目录下复制`.bk.development.env`文件，并重命名为`.bk.local.env`，依照注释填写相关值。

#### data-base.js (用于数据库的连接)

在 `lesscode/lib/server/conf` 中新建 `data-base.js` 文件（复制 `data-base.js.example`，并删除 `.example`即可）。然后依照 [data-base.js.example](../../lib/server/conf/data-base.js.example) 的注释填写本地开发和线上运行时的数据库的配置信息。

#### lesscode/lib/server/conf/db-migrate.json (用于自动执行db导入和变更)

在 `lesscode/lib/server/conf` 中新建 `db-migrate.json` 文件（复制 `db-migrate.json.example`，并删除 `.example`即可）。然后依照 [db-migrate.json.example](../../lib/server/conf/db-migrate.json.example) 的注释填写本地开发和线上运行时的数据库的配置信息。

#### http.js (蓝鲸社区版相关配置)

在 `lesscode/lib/server/conf` 中新建 `http.js` 文件（复制 `http.js.example`，并删除 `.example`即可）。然后依照 [http.js.example](../../lib/server/conf/http.js.example) 的注释填写本地开发和线上运行时蓝鲸社区版的配置信息。

#### bk-repo.js (蓝鲸制品库相关配置，用到自定义组件功能时需填写，未用到则可以忽略此文件)

在 `lesscode/lib/server/conf` 中新建 `bk-repo.js` 文件（复制 `bk-repo.js.example`，并删除 `.example`即可）。然后依照 [bk-repo.js.example](../../lib/server/conf/bk-repo.js.example) 的注释填写本地开发和线上运行时蓝鲸制品库的配置信息。

#### npm.js (npm镜像仓库配置，用到自定义组件功能时需填写，未用到则可以忽略此文件)

在 `lesscode/lib/server/conf` 中新建 `npm.js` 文件（复制 `npm.js.example`，并删除 `.example`即可）。然后依照 [npm.js.example](../../lib/server/conf/npm.js.example) 的注释填写本地开发和线上运行时的npm镜像仓库的配置信息。

#### data-source.js (画布区域使用数据源，连接数据库的配置。如不需要数据源功能，可忽略此文件)

在 `lesscode/lib/server/conf` 中新建 `data-source.js` 文件（复制 `data-source.js.example`，并删除 `.example`即可）。然后依照 [data-source.js.example](../../lib/server/conf/data-source.js.example) 的注释填写本地开发和线上运行时的数据库的配置信息。

#### encrypt-secret-key.js (用于加密的key配置，不可忽略)

在 `lesscode/lib/server/conf` 中新建 `encrypt-secret-key.js` 文件（复制 `encrypt-secret-key.js.example`，并删除 `.example`即可）。然后依照 [encrypt-secret-key.js.example](../../lib/server/conf/encrypt-secret-key.js.example) 的注释填写加密的key。

