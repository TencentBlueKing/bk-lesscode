# 蓝鲸智云运维开发平台（LessCode）

## 分支管理说明

运维开发平台使用 [develop](https://github.com/TencentBlueKing/bk-lesscode/tree/develop), [master](https://github.com/TencentBlueKing/bk-lesscode/tree/master) 两个分支进行迭代。其中 master 为稳定版分支，每次 release 都会基于这个分支；develop 为日常开发的分支，给运维开发平台贡献代码统一向 develop 分支提 pr。

## 本地开发环境搭建以及开发流程

> 主库：指 https://github.com/TencentBlueKing/bk-lesscode/
>
> fork 仓库：指 https://github.com/{YourName}/bk-lesscode
>
> 本地仓库：指从 fork 仓库 clone 到本地的仓库

1. fork 主库 [bk-lesscode](https://github.com/TencentBlueKing/bk-lesscode) 到你自己的 github 仓库
2. 把 fork 的仓库 clone 到本地仓库
    ```bash
    git clone https://github.com/{YourName}/bk-lesscode.git
    ```
3. 进入 bk-lesscode 目录
    ```bash
    cd bk-lesscode
    ```
4. remote 添加主库
    ```bash
    # base 为给主库设置的别名
    git remote add base https://github.com/TencentBlueKing/bk-lesscode.git
    ```
5. 本地仓库切换分支（以主库 develop 分支为准，develop 为日常开发的分支，每次均向 develop 分支提 pr）
    ```bash
    git checkout develop
    ```
6. 把主库 develop 的代码更新到本地仓库（第一次从主库合并最新代码到本地仓库，推荐 rebase，之后我们用 merge）
    ```bash
    # git merge base/develop
    git rebase base/develop
    ```
    rebase 之后，查看 git 状态（`git status`），如果发现本地仓库对比远程有 behind，那么此时需要执行如下命令
    ```bash
    git pull origin develop --allow-unrelated-histories
    ```
    之后便可正常 pull, push

7. 本地仓库切换 master 分支，把主库 master 的代码更新到本地仓库。（master 为稳定版分支，建议本地仓库 master 分支保持与主库一致）
    ```bash
    git checkout master

    # 和主库的 master 分支对比
    git diff base/master

    # 正常来说，对比不会有差异，如果有差异，那么就把主库的代码合入本地仓库（第一次从主库合并最新代码到自己的库，推荐 rebase，之后我们用 merge）
    # git merge base/master
    git rebase base/master
    ```
8. 本地仓库切换到 develop 分支，然后开始自己的开发
    ```bash
    git checkout develop
    # 安装 node_modules 依赖
    npm install .
    # 本地启动，开始开发
    npm run dev
    ```
9. 开发完成后，本地仓库推往 fork 仓库 develop 分支 **（自己 fork 的仓库，https://github.com/{YourName}/bk-lesscode.git）**
    ```bash
    git push origin develop
    ```
10. 推往自己 fork 仓库的 develop 分支后，可以向 bk-lesscode 主库的 develop 提 pr。 **（给运维开发平台贡献代码，统一向 develop 分支提 pr）**
