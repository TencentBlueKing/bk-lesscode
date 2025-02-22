export default [
    {
        date: '2024.12.27',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('资源市场: 内置vue3页面模板'),
                    window.i18n.t('资源市场: 模板支持vue2/vue3便捷过滤'),
                    window.i18n.t('画布: 小鲸组件优化'),
                    window.i18n.t('画布: vue3组件支持v-model指令设置'),
                    window.i18n.t('画布: 增强移动端画布容器功能'),
                    window.i18n.t('画布: 流程管理容器交互优化'),
                    window.i18n.t('源码: 优化源码中的公共样式'),
                    window.i18n.t('文档: 增加英文文档'),
                    window.i18n.t('数据源: 数据表API增加函数示例')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布：修复vue3导航设置为二级菜单时预览页面异常问题'),
                    window.i18n.t('画布：修复sideslider组件偶现zIndex异常问题'),
                    window.i18n.t('数据源：修复导出数据时date格式数据异常问题')
                ]
            }
        ]
    },
    {
        date: '2024.11.07',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('流程: 流程模块重构、对接新的流程引擎'),
                    window.i18n.t('画布: 组件属性进行分组'),
                    window.i18n.t('画布: 补充组件缺少的属性'),
                    window.i18n.t('画布: 组件事件增加简易中文描述'),
                    window.i18n.t('画布: vue2组件升级到最新版本'),
                    window.i18n.t('画布: echarts图表提供简易配置'),
                    window.i18n.t('平台: 源码工程里面的vue升级到2.7.x版本')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 兼容当组件的数据中，含有连字符跟驼峰格式的的相同属性')
                ]
            }
        ]
    },
    {
        date: '2024.08.19',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('平台: 平台名称/footer/header区域等信息支持全局配置'),
                    window.i18n.t('表单&数据管理: 表单容器字段默认值支持变量'),
                    window.i18n.t('画布: 英文模式下，组件属性不展示简易名称displayName'),
                    window.i18n.t('画布: vue3应用bkui组件库，组件属性补充对齐组件库本身'),
                    window.i18n.t('数据源: 离开数据管理页面时，给出二次提示')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复表单容器组件确认、取消按钮无法隐藏问题'),
                    window.i18n.t('画布: 修复vue3tab组件无法切换tab的问题'),
                    window.i18n.t('画布: 修复vue3导航的内置padding预览时与画布样式配置不一致问题'),
                    window.i18n.t('函数: 修复编辑函数需要检验变量时，变量非最新的问题'),
                    window.i18n.t('数据源: 修复预览时需要区分本地数据源跟第三方数据源的问题'),
                    window.i18n.t('数据源: 修复数据源api默认page不为1的问题'),
                    window.i18n.t('模板市场: 添加页面模板到应用时，disabled页面模板所属的应用本身')
                    
                ]
            }
        ]
    },
    {
        date: '2024.07.04',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('平台: 文档中心内容重新梳理补充'),
                    window.i18n.t('平台: 导航栏增加“帮助文档”入口， 弹窗查看文档'),
                    window.i18n.t('画布: 组件属性名增加展示中文displayName'),
                    window.i18n.t('画布: vue2、vue3增加折叠面板collapse基础组件'),
                    window.i18n.t('画布: vue2、vue3增加可编辑description自定义组件'),
                    window.i18n.t('画布: vue3增加带分组列表展示自定义组件'),
                    window.i18n.t('画布: 导航logo支持设置点击跳转页面'),
                    window.i18n.t('画布: 复合导航侧边支持拖拽区域'),
                    window.i18n.t('画布: bkcharts 图表标题提供 左/中/右对齐 选项，图例提供可置于 上/下 的选项'),
                    window.i18n.t('表单&数据管理: 字段联动规则支持配置多种逻辑运算'),
                    window.i18n.t('表单&数据管理: 下拉字段支持数据源key、value配置'),
                    window.i18n.t('表单&数据管理: 日期组件支持年、月、日、时间类型'),
                    window.i18n.t('表单&数据管理: 数据管理容器增加列跳转'),
                    window.i18n.t('数据源: sql语句使用base64加密'),
                    window.i18n.t('数据源: 数据管理支持全局过滤、全局排序')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复vue3部分组件样式异常、图标渲染异常'),
                    window.i18n.t('画布: 修复空白导航布局下， 页面高度不为100%问题'),
                    window.i18n.t('表单&数据管理: 修复表单事件源码配置跟预览不一致'),
                    window.i18n.t('表单&数据管理: 修复列重复问题')
                ]
            }
        ]
    },
    {
        date: '2024.05.07',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: table支持设置状态列'),
                    window.i18n.t('应用: 预览页跟画布编辑页自定义组件加载速度优化'),
                    window.i18n.t('应用: ajax请求401时调整为弹出小窗登录'),
                    window.i18n.t('应用: 创建页面失败自动定位到错误位置'),
                    window.i18n.t('数据源: 兼容ENUM类型'),
                    window.i18n.t('API: object跟array类型参数可绑定变量')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 修复权限校验问题'),
                    window.i18n.t('应用: package.json部分依赖升级'),
                    window.i18n.t('画布: 修复vue3中table偶现无法删除'),
                    window.i18n.t('画布: 修复table组件无法渲染问题'),
                    window.i18n.t('画布: 修复页面JSON内函数payload中format不存在的问题'),
                    window.i18n.t('画布: 修复表单容器内radio事件不生效问题')
                ]
            }
        ]
    },
    {
        date: '2024.03.21',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 应用内左侧导航调整'),
                    window.i18n.t('应用: 对接消息通知中心'),
                    window.i18n.t('应用: 发布部署数据同步到homepage'),
                    window.i18n.t('数据源: 支持接入第三方数据库'),
                    window.i18n.t('数据源: sql语句在api层面加密传输'),
                    window.i18n.t('移动端: h5容器swipper组件升级')
                ]
            }
        ]
    },
    {
        date: '2023.11.28',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: vue2应用表单类型页面以表单容器组件形式整合到自定义页面'),
                    window.i18n.t('应用: vue2应用数据管理类型页面以数据管理容器组件形式整合到自定义页面'),
                    window.i18n.t('画布: vue3应用支持表单容器跟数据管理容器组件'),
                    window.i18n.t('画布: AI小鲸支持页面需求描述 拆解任务 完成多个组件布局生成'),
                    window.i18n.t('发布部署: 新建的应用部署后为开发者中心云原生类型类用，发布部署模块适配云原生类型应用')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复echart图表无法自适应屏幕宽高变化问题'),
                    window.i18n.t('移动端: 修复vant样式冲突问题')
                ]
            }
        ]
    },
    {
        date: '2023.10.18',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: markdown类型页面以组件形式整合到自定义页面'),
                    window.i18n.t('函数: 代码编辑器支持代码提示跟代码生成'),
                    window.i18n.t('数据源: 数据管理模块支持自然语言描述生成SQL'),
                    window.i18n.t('移动端: 新增宫格布局'),
                    window.i18n.t('移动端: 新增简易tab组件'),
                    window.i18n.t('画布: transfer, cascade, process, big-tree等组件可配置对应的实际使用字段跟展示字段'),
                    window.i18n.t('画布: ai对话框增加常用提示模板'),
                    window.i18n.t('画布: 支持事件行为跟自然语言描述生成事件'),
                    window.i18n.t('画布: 可切换类型的组件 value值设置及校验需要和类型一致')
                ]
            }
        ]
    },
    {
        date: '2023.08.31',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 应用支持归档'),
                    window.i18n.t('应用: 发布部署模块页面重构'),
                    window.i18n.t('移动端: 新增侧边导航'),
                    window.i18n.t('画布: 页面内置边距回显到页面样式的padding属性'),
                    window.i18n.t('画布: 组件属性面板支持搜索')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 当页面模板中含有tab组件时，应用页面模板失败'),
                    window.i18n.t('应用: 国际化相关样式修复')
                ]
            }
        ]
    },
    {
        date: '2023.08.03',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 应用列表页增加应用模版推荐'),
                    window.i18n.t('应用: 创建应用跟页面时，从空白创建跟从模板创建入口合并'),
                    window.i18n.t('画布: 增加AI开发助手'),
                    window.i18n.t('画布: 移动端新增时间选择、选择器组件'),
                    window.i18n.t('画布: 导航支持设置可拖拽区域'),
                    window.i18n.t('画布: 导航路由参数支持应用级变量'),
                    window.i18n.t('画布: 离开画布时，如果未修改则不弹出离开确认弹窗'),
                    window.i18n.t('画布: 公开自定义组件按分类展示、区分移动端跟PC端自定义组件'),
                    window.i18n.t('函数&API: 请求支持设置header，header支持设置变量'),
                    window.i18n.t('函数&API: 请求配置参数时支持配置参数校验')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 保存变量时，校验变量格式并错误提示'),
                    window.i18n.t('流程&表单: 表单字段数据源支持数据表相关问题修复'),
                    window.i18n.t('流程&表单: 流程体验问题修复'),
                    window.i18n.t('画布: 移动端导航使用问题优化'),
                    window.i18n.t('画布: 修复v-vtml预览跟部署后变现不一致问题'),
                    window.i18n.t('函数&API: API使用提示优化')
                ]
            }
        ]
    },
    {
        date: '2023.06.29',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 新建应用区分vue2跟vue3, 支持拖拽vue3应用'),
                    window.i18n.t('应用: 应用内菜单导航布局更新'),
                    window.i18n.t('应用: 表单统一修改成上下布局'),
                    window.i18n.t('画布: 画布ui重构、物料区、菜单栏、配置区更新'),
                    window.i18n.t('画布: 增加“撤销”快捷键'),
                    window.i18n.t('画布: v-model支持表达式'),
                    window.i18n.t('数据源: 数据源内置接口支持自定义字段'),
                    window.i18n.t('流程&表单: 表单字段数据源支持数据表、API数据源')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 国际化相关样式优化、问题修复'),
                    window.i18n.t('画布: 进入画布时，数据未更新问题'),
                    window.i18n.t('画布: 修复复制拥有相同type类型组件时，数据异常问题'),
                    window.i18n.t('画布: 修复自由布局的粘贴位置问题'),
                    window.i18n.t('画布: 修复移动端漂浮栏滚动位置错误问题')
                ]
            }
        ]
    },
    {
        date: '2023.05.26',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 支持国际化'),
                    window.i18n.t('应用: 抽屉Sideslider统一修改为可快捷关闭，关闭前有表单信息修改时二次弹窗提醒'),
                    window.i18n.t('应用: 导航布局管理优化 & 优化移动端路由结构'),
                    window.i18n.t('流程&表单: 提单页独立路由，节点保存逻辑拆分与修改')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复vant-ui v-model绑定的源码问题'),
                    window.i18n.t('流程&表单: 节点引用和复用表单字段key重复的问题处理'),
                    window.i18n.t('流程&表单: 删除提单页后复用表单报错问题修复')
                ]
            }
        ]
    },
    {
        date: '2023.04.18',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 移动端新增日期选择器组件'),
                    window.i18n.t('流程&表单: 表单画布新增计算组件'),
                    window.i18n.t('流程&表单: 表单画布新增自动编号组件'),
                    window.i18n.t('数据源: 数据导入支持更新和去重'),
                    window.i18n.t('应用: 路由管理支持预览对应导航布局')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 修复应用预览缓存问题')
                ]
            }
        ]
    },
    {
        date: '2023.03.08',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('平台：统一优化表格无数据时展示、搜索相关场景交互'),
                    window.i18n.t('平台: 统一优化平台文本溢出展示及交互'),
                    window.i18n.t('应用: 凭证token改成自动获取, 去掉凭证管理页面'),
                    window.i18n.t('应用：功能页面增加对应文档指引入口'),
                    window.i18n.t('流程&表单: 数据管理页支持添加操作按钮'),
                    window.i18n.t('流程&表单: 新增评分组件'),
                    window.i18n.t('画布: 移动端拖拽时、自适应单位'),
                    window.i18n.t('画布: 移动端input增加宽度设置'),
                    window.i18n.t('画布: 新增文本框基础组件'),
                    window.i18n.t('画布: 表单容器支持配置操作按钮显示或隐藏')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 函数调试体验问题优化'),
                    window.i18n.t('流程&表单: 表单字段配置隐藏条件增加校验空表单逻辑'),
                    window.i18n.t('画布: 修复存为模板时，组件id被替换导致预览模板报错问题')
                ]
            }
        ]
    },
    {
        date: '2023.02.06',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用：支持应用导入导出功能'),
                    window.i18n.t('应用: 文件管理支持导出功能'),
                    window.i18n.t('应用：自定义组件管理支持导出功能'),
                    window.i18n.t('应用：自定义组件分类支持单独修改'),
                    window.i18n.t('画布: 增加画布中交互式组件的检测和使用提示'),
                    window.i18n.t('画布: 表单画布头部操作按钮顺序和自定义画布保持一致'),
                    window.i18n.t('其它: 版本更新日志交互优化')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 修复没有PC根路径时根路由无法绑定移动端路由的问题及根路由支持解除绑定'),
                    window.i18n.t('应用: 函数调试体验问题优化'),
                    window.i18n.t('应用: 修复数据源建表新增字段报错问题')
                ]
            }
        ]
    },
    {
        date: '2022.12.01',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用：应用顶部导航更新'),
                    window.i18n.t('应用：资源管理目录调整'),
                    window.i18n.t('应用: 应用根路由支持绑定跳转到移动端路由'),
                    window.i18n.t('数据源: 数据表支持导入sql和excel格式数据'),
                    window.i18n.t('函数: 支持函数在线调试'),
                    window.i18n.t('函数: 函数执行参数交互优化及支持事件类型参数'),
                    window.i18n.t('函数: 保存函数时自动修复Eslint格式问题'),
                    window.i18n.t('函数: 远程函数API选择 及 API节点里API地址选择交互优化'),
                    window.i18n.t('画布: 组件数据类型选择远程函数时，支持配置函数返回的key和value'),
                    window.i18n.t('画布: 选中组件时增加复制粘贴操作操作'),
                    window.i18n.t('画布: block布局样式面板展示margin属性、段落组件样式面板展示position属性')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复自由布局偶现无法选中问题，自由布局高度减小使组件溢出问题'),
                    window.i18n.t('画布: 修复windows下快捷键不生效问题'),
                    window.i18n.t('画布: 修复“源码查看  是否包含导航代码按钮”且换失效问题'),
                    window.i18n.t('画布: 修复页面组件树删除搜索内容触发删除组件问题'),
                    window.i18n.t('应用: 浏览器宽度太小时，导航样式错乱问题'),
                    window.i18n.t('应用: 其它交互及样式问题修复和文案调整')
                ]
            }
        ]
    },
    {
        date: '2022.11.07',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 平台本身和拖拽应用的源码框架升级为bk  cli2'),
                    window.i18n.t('应用: 文档页面按导航分类'),
                    window.i18n.t('数据源: 数据操作模块体验优化'),
                    window.i18n.t('画布: bkcharts图表配置项优化'),
                    window.i18n.t('画布: 函数配置优化，配置执行参数时展示对应的参数名'),
                    window.i18n.t('画布: 文字链接（link）组件支持设置padding、背景色和圆角样式')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 修复删除页面时报错问题')
                ]

            }
        ]
    },
    {
        date: '2022.10.17',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 拖拽应用对接权限中心，支持对拖拽页面设置访问控制和自定义权限操作'),
                    window.i18n.t('应用: 新增支持markdown类型页面'),
                    window.i18n.t('应用: 流程提单页展示预览图'),
                    window.i18n.t('画布: 表单容器结合数据源，表单容器使用优化'),
                    window.i18n.t('部署: 部署页面始终展示“更多操作”'),
                    window.i18n.t('流程 & 表单：流程管理页区分预览、i节点增加调用调试功能预发布、生产环境流程记录'),
                    window.i18n.t('流程 & 表单：api节点增加调用调试功能'),
                    window.i18n.t('流程 & 表单：流程api节点变量使用交互优化'),
                    window.i18n.t('流程 & 表单：流程部署状态提示优化')
                ]
            }, {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 修复从模板新建应用时，模板预览图没有使用模板封面'),
                    window.i18n.t('应用: 修复创建应用时，底部footer遮挡确认按钮问题')
                ]
            }
        ]
    }, {
        date: '2022.09.16',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 数据源管理对接bkBase数据表，数据操作模块优化'),
                    window.i18n.t('应用: 开源版交付时内置官方页面模板和函数市场函数'),
                    window.i18n.t('画布: 移动端页面新增底部导航布局'),
                    window.i18n.t('画布: 导航组件支持分别设置背景色和主题色'),
                    window.i18n.t('画布: 函数执行参数支持使用变量'),
                    window.i18n.t('画布: v-for 指令的支持使用数据源'),
                    window.i18n.t('画布: 组件支持设置v - bkloading和v - bk - tooltips指令'),
                    window.i18n.t('画布: 移动端页面增加模拟header区域'),
                    window.i18n.t('流程 & 表单：表单组件【单行文本 / 多行文本 / 数字 / 日期 / 时间】默认值支持联动'),
                    window.i18n.t('流程 & 表单：下拉类表单组件【单选下拉、可输入单选下拉、多选下拉、单选框、多选框】支持默认选项联动'),
                    window.i18n.t('流程 & 表单：流程类应用预览时增加跳转到itsm入口')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 运营数据：函数所属应用信息缺失'),
                    window.i18n.t('应用: 数据表的id没有从1开始'),
                    window.i18n.t('画布: h5容器背景图默认设置为100 %'),
                    window.i18n.t('画布: 移动端组件属性优化'),
                    window.i18n.t('画布: 组件属性文案统一优化'),
                    window.i18n.t('画布: 卡片列表案例保存模板后预览报错')
                ]
            }
        ]
    }, {
        date: '2022.08.25',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 平台对接权限中心'),
                    window.i18n.t('应用: 数据源管理模块：支持数据操作'),
                    window.i18n.t('应用: 平台右侧悬浮按钮交互优化'),
                    window.i18n.t('画布: 新增简易版tab组件，可在画布中直接拖拽每个tab下的内容'),
                    window.i18n.t('画布: 存为模板时，支持更新覆盖已有模板，并支持编辑模板时上传模板封面'),
                    window.i18n.t('画布: 文字链接组件支持新窗口打开'),
                    window.i18n.t('流程 & 表单：表单和数据管理页支持页面生命周期函数绑定'),
                    window.i18n.t('流程 & 表单：流程、表单管理页 页面设置新增关联流程和关联表单信息'),
                    window.i18n.t('流程 & 表单：表单字段编辑支持复制、删除快捷键'),
                    window.i18n.t('流程 & 表单：流程部署状态提示优化')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 函数编辑时，切换函数交互优化'),
                    window.i18n.t('画布: 移动端h5容器相关体验问题优化'),
                    window.i18n.t('画布: 表格类复合组件的表头刷新优化'),
                    window.i18n.t('画布: 修复表格自定义列绑定的函数，存为模板时未带上绑定函数的问题'),
                    window.i18n.t('部署: 修复部署后表格未展示问题'),
                    window.i18n.t('部署: 修复人名组件自动适配http / https问题')
                ]
            }
        ]
    }, {
        date: '2022.07.29',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 增加流程管理，可创建包含流程的页面及其相应数据管理页'),
                    window.i18n.t('应用: 远程函数使用优化，可直接选择apigateway网关api'),
                    window.i18n.t('应用: API管理支持生成对应远程函数'),
                    window.i18n.t('应用: 应用管理和页面管理增加列表视图及卡片布局下卡片宽度自适应'),
                    window.i18n.t('应用: 应用列表支持排序'),
                    window.i18n.t('部署: 部署日志交互优化'),
                    window.i18n.t('画布: 移动端画布增加h5容器，可用于拖拽生成宣传活动类h5页面'),
                    window.i18n.t('画布: 表格使用优化：表格分页配置优化，表格数据支持全局排序和全局过滤'),
                    window.i18n.t('画布: 表单类组件支持设置简约风格'),
                    window.i18n.t('画布: 移动端组件放开动画设置，增加多行布局'),
                    window.i18n.t('画布: 人员选择器增加v - model指令')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 数据源使用体验问题'),
                    window.i18n.t('部署: 已发布至应用市场的应用显示为未发布'),
                    window.i18n.t('预览: 修复删除页面后点击导航菜单页面空白问题'),
                    window.i18n.t('画布: 移动端组件在自由布局中渲染异常问题'),
                    window.i18n.t('画布: 移动端画布，顶部编辑组件，tooltips被遮挡'),
                    window.i18n.t('画布: 画布页面下拉框取消页面跳转后选中态错误')
                ]
            }
        ]
    },
    {
        date: '2022.06.29',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 增加表单类型页面，创建页面时会同步创建对应的数据表，也可以基于表单页面创建对应的表单管理页'),
                    window.i18n.t('应用: 新增API管理模块'),
                    window.i18n.t('应用: 新建页面调整，新建页面调整成先选择页面类型，再选择来源（空白页面或模板）')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 修复页面更新时间不正确问题')
                ]
            }
        ]
    }, {
        date: '2022.06.10',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 增加文件管理模块，可上传图片后在图片组件、轮播图组件，组件背景图片设置等地方引用；可上传压缩包、文档等类型文件后，在文字链接组件中引用'),
                    window.i18n.t('应用: 创建LessCode应用时同步创建并绑定开发PaaS平台 - 开发者中心应用，绑定后可直接将拖拽成功的应用发布部署至PaaS平台 - 开发者中心'),
                    window.i18n.t('应用: 应用内左侧导航支持展开收起'),
                    window.i18n.t('画布: 属性面板优化，值为数组类型的属性，支持配置远程函数'),
                    window.i18n.t('画布: 支持远程函数或数据源的属性，支持自定义变量'),
                    window.i18n.t('画布: 画布增加调整组件宽高、边距位置，组件居中的便捷操作'),
                    window.i18n.t('画布: 文本、段落、链接等文字类组件可在画布直接编辑文字'),
                    window.i18n.t('画布: 组件级别开放存为模板按钮'),
                    window.i18n.t('画布: 画布空白区域支持鼠标右键面板操作'),
                    window.i18n.t('画布: 应用导航logo支持选择图片')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 修复页面模板管理中操作模板后，左侧模板分类数据未及时更新问题'),
                    window.i18n.t('画布: 修复复制组件没有复制slot问题'),
                    window.i18n.t('画布: 修改number输入框可输入非法数字的问题'),
                    window.i18n.t('画布: 修复部署后页面padding设置为0不生效问题'),
                    window.i18n.t('画布: 修复divider组件设置为纵向时高度不能设置问题'),
                    window.i18n.t('画布: 修复自定义组件信息展示与无法收藏问题'),
                    window.i18n.t('画布: 交互式组件优化'),
                    window.i18n.t('预览: 修复版本导致的预览内容不正确的问题'),
                    window.i18n.t('预览: 修复移动端模板预览未在手机背景中预览问题'),
                    window.i18n.t('预览: 图标大小预览时不生效问题、exception组件预览时不居中问题')

                ]
            }
        ]
    }, {
        date: '2022.05.18',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 项目概念更换为应用'),
                    window.i18n.t('应用: 增加LessCode首页'),
                    window.i18n.t('应用: 菜单归类划分调整'),
                    window.i18n.t('应用: 部署版本调整优化'),
                    window.i18n.t('画布: 函数交互优化，事件配置面板更新，选择函数时提供对应函数示例'),
                    window.i18n.t('画布: 布局增加行组件，行和列选中交互优化'),
                    window.i18n.t('画布: 导航设置优化，新增页面时可选将页面添加到导航菜单中'),
                    window.i18n.t('画布: 移动端增加tab组件')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 画布体验问题优化'),
                    window.i18n.t('画布: 修复添加模板到应用时，变量函数未成功添加的问题'),
                    window.i18n.t('画布: 修复导航首次预览无法获取最新数据问题'),
                    window.i18n.t('画布: 优化单个页面报错，导致其它页面也预览失败问题'),
                    window.i18n.t('画布: 修复页面样式设置影响其它页面的问题'),
                    window.i18n.t('画布: 修复画布锁相关问题'),
                    window.i18n.t('应用: 修复复制项目时，未复制表信息问题'),
                    window.i18n.t('应用: 修复新建版本在变量引用变量时关联数据的问题'),
                    window.i18n.t('应用: fix编辑路由数据为空问题')
                ]
            }
        ]
    }, {
        date: '2022.04.01',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 支持移动端h5页面拖拽'),
                    window.i18n.t('画布: 画布增加选中和操作列'),
                    window.i18n.t('画布: 画布交互体验优化'),
                    window.i18n.t('画布: 导航布局支持设置主题色')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 画布体验问题修复')
                ]
            }
        ]
    }, {
        date: '2022.02.28',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 整体画布重构、持续优化画布拖拽体验，fix画布与预览不一致问题'),
                    window.i18n.t('画布: 丰富组件样式面板，组件支持配置更多样式属性'),
                    window.i18n.t('画布: 画布支持实时预览，更新画布和函数变量等不需要重新刷新页面或新开窗口'),
                    window.i18n.t('画布: 预览和保存分离，预览时不自动保存画布内容'),
                    window.i18n.t('画布: 源码查看和json查看使用monaco - editor')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 优化画布体验问题')
                ]
            }
        ]
    }, {
        date: '2021.12.30',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 应用预览和页面预览速度优化'),
                    window.i18n.t('画布: element table组件支持数据源配置'),
                    window.i18n.t('文档: 增加应用模板使用指引和页面模板使用指引')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 优化计算变量和v - model填值情况'),
                    window.i18n.t('应用: 导航滚动和应用收起样式优化')
                ]
            }
        ]
    }, {
        date: '2021.11.25',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 增加应用版本管理功能'),
                    window.i18n.t('应用：增加在线建表、数据源管理模块'),
                    window.i18n.t('应用：页面内容模板支持导入导出'),
                    window.i18n.t('画布: 增加页面级别的样式配置, 可在画布编辑页页面设置tab设置页面内容区域的样式'),
                    window.i18n.t('画布: 表单容器表单项编辑增加保存并继续新增选项'),
                    window.i18n.t('画布：组件样式补充（link、input、upload、timeline、diff、布局、colorpicker）')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 画布拖拽体验问题优化'),
                    window.i18n.t('画布: 修复编辑form - item导致表单组件内容被重置问题')
                ]
            }
        ]
    }, {
        date: '2021.10.13',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 新增应用模板，用户可在模板市场或新建应用时，基于官方模板直接创建应用'),
                    window.i18n.t('应用：新增页面内容模板，用户可以在画布中将页面的局部或者整个内容区域保存为模板，并在新建页面时或者画布拖拽中直接使用'),
                    window.i18n.t('画布: 属性切换为变量方式时的增加数据示例'),
                    window.i18n.t('画布: 右侧属性面板加上组件文档链接地址'),
                    window.i18n.t('画布: Card组件开放foot、header插槽')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用：优化应用列表和页面列表加载性能'),
                    window.i18n.t('应用：优化自定义组件文档提示'),
                    window.i18n.t('画布: 优化表格pagination配置'),
                    window.i18n.t('画布: 修复侧边栏收起后，快捷键失效，不能删除的问题'),
                    window.i18n.t('画布: 修复右键菜单无法触发的问题'),
                    window.i18n.t('画布: 修复边框设置圆角不生效问题'),
                    window.i18n.t('画布: 修复组件和grid设置margin时画布渲染异常问题'),
                    window.i18n.t('画布: 修复单选框和复选框组件预览时默认选中的选项无法去掉问题')
                ]
            }
        ]
    }, {
        date: '2021.09.08',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('函数: 函数市场支持导入导出函数'),
                    window.i18n.t('画布: mockData数据支持分页'),
                    window.i18n.t('文档：增加交互式组件使用文档、变量使用文档')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用: 修复应用、页面、函数分类、自定义组件分类名称校验重名时不区分大小写问题'),
                    window.i18n.t('画布: 修复表格自定义列绑定函数使用报错问题'),
                    window.i18n.t('画布: 修复对象类型变量，直接.引用变量会报错的问题'),
                    window.i18n.t('画布: 修复element组件库pagination组件layout属性bug'),
                    window.i18n.t('画布: 修复element组件库的radio组件默认值显示有误问题')
                ]
            }
        ]
    }, {
        date: '2021.08.30',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用: 增加函数市场模块，用户可将函数市场函数添加至应用使用'),
                    window.i18n.t('画布: 用到获取远程数据的地方提供数据示例'),
                    window.i18n.t('画布: html类型的slot支持编写vue语法')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复交互式组件出现嵌套渲染的问题'),
                    window.i18n.t('画布: 修复自由布局中表格宽度不断增大的问题'),
                    window.i18n.t('画布: 优化拖入交互底色过浅的问题、右键菜单交互问题')
                ]
            }
        ]
    }, {
        date: '2021.08.13',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 重构slot相关逻辑，支持同时配置多个slot、具名slot等，方便后续更灵活配置各类组件的slot'),
                    window.i18n.t('画布: form表单容器表单项配置交互优化、支持配置表单校验、函数编辑时支持指令获取form相关变量'),
                    window.i18n.t('画布: 自由布局拖入组件位置调整、拖拽体验优化')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复部分组件复制时报错问题'),
                    window.i18n.t('画布: element组件问题修复(radio组件默认值不生效问题、提供table组件height属性和maxheight属性默认值)'),
                    window.i18n.t('其他: 体验问题修复')
                ]
            },
            {
                reviseTitle: window.i18n.t('说明'),
                logMassage: [
                    window.i18n.t('由于slot相关逻辑重构改动较大，涉及存量数据更新，请用户先自行备份数据库page表数据，并在更新此版本后在浏览器执行调用 域名 / api / db - upgrade - helper /20210722_update_slot更新数据')
                ]
            }
        ]
    }, {
        date: '2021.08.03',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 画布编辑页面增加加锁和抢占功能'),
                    window.i18n.t('画布: Element表单组件（标签输入、穿梭框、rate组件）加上v - model可以获取表单值'),
                    window.i18n.t('画布: Element按钮组件增加icon设置属性')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('其他: 体验问题修复')
                ]
            }
        ]
    }, {
        date: '2021.07.22',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: Element 基础组件库组件丰富'),
                    window.i18n.t('画布: 修改部署页面title'),
                    window.i18n.t('应用管理: 函数和计算变量添加自动fix eslint')]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复p标签与文字相关组件的对齐问题'),
                    window.i18n.t('应用管理: 函数相关体验问题'),
                    window.i18n.t('其他: 修改身份认证失败状态码')
                ]
            }
        ]
    }, {
        date: '2021.07.01',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 新增') + '[@blueking/bkcharts](https:/ / www.npmjs.com / package /@blueking/bkcharts)',
                    window.i18n.t('画布: Element 基础组件库组件丰富'),
                    window.i18n.t('应用管理: 支持函数的导入导出'),
                    window.i18n.t('应用管理: 删除权限增加是否为数据的创造者的判断逻辑'),
                    window.i18n.t('其他: 复合组件更新')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 属性面板多类型属性值切换类型 tab 时，保留编辑的值'),
                    window.i18n.t('其他: 其他体验 bug 修复以及优化')
                ]
            }
        ]
    }, {
        date: '2021.06.18',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 支持 json 导入和渲染')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('其他: 其他体验 bug 修复以及优化')
                ]
            }
        ]
    }, {
        date: '2021.06.03',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用管理: 导航支持配置 query'),
                    window.i18n.t('画布: 新增 sideslider 组件')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复交互式组件的若干问题'),
                    window.i18n.t('应用管理: 页面绑定路由时未禁用已绑定跳转的路由问题'),
                    window.i18n.t('应用管理: 页面预览图偶发失败的问题')
                ]
            }, {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('应用管理: 导航路由参数 tips 优化')
                ]
            }
        ]
    }, {
        date: '2021.04.27',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 属性、指令支持设置变量'),
                    window.i18n.t('画布: 新增复合组件'),
                    window.i18n.t('画布: dialog 组件支持 grid'),
                    window.i18n.t('应用管理: 变量管理')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('应用管理: 复制应用时不创建默认 home 页面')
                ]
            }, {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('画布: 拖拽排序效果优化为：当鼠标放到拖拽 icon 上时触发拖拽效果'),
                    window.i18n.t('画布: 段落组件自动换行优化'),
                    window.i18n.t('其他: 其他体验 bug 修复以及优化')
                ]
            }
        ]
    }, {
        date: '2021.04.12',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('其他: 新增开放 API，新增获取发布部署相关信息接口')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复自由布局高度调整后，计算可拖拽区域没有实时更新的问题'),
                    window.i18n.t('画布: 自由布局容器自适应高度问题'),
                    window.i18n.t('画布: 复制 slot 可拖拽类型组件时预览和生成源码报错问题'),
                    window.i18n.t('画布: 修复属性面板样式体验问题'),
                    window.i18n.t('画布: 修复 grid 外边距设置为负值时，失去焦点后，在右侧属性面板会自动变为 0 的问题'),
                    window.i18n.t('画布: 修复表格列选中排序后，再次点击表格时，排序多选框没有回填回来的问题'),
                    window.i18n.t('画布: 修复 divider 分割线组件外边距不生效的问题'),
                    window.i18n.t('画布: 修复 input value 指令不为空的问题')
                ]
            }
        ]
    }, {
        date: '2021.03.29',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('预览 / 部署: 添加应用预览'),
                    window.i18n.t('画布: 表格添加 pagination, showPaginationInfo 配置，支持设置翻页'),
                    window.i18n.t('画布: 表格、导航、tab、step、select、radio、radioButton、面包屑的表头或内容选项，增加拖动排序能力'),
                    window.i18n.t('画布: 步骤组件 steps 支持页面配置'),
                    window.i18n.t('应用管理: 创建应用时新建默认 home 页面和代码查看器样式优化')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复右侧属性面板中对象类型数据修改失败的问题'),
                    window.i18n.t('画布: 图表高度设置问题'),
                    window.i18n.t('画布: 表格的表头新增，prop 格式不统一问题'),
                    window.i18n.t('画布: 新增表格时表格的条纹、boreder 属性不生效问题'),
                    window.i18n.t('画布: 通过样式设置尺寸宽度为百分比时画布中组件宽度显示不正确的问题'),
                    window.i18n.t('画布: 表格组件分页配置，count 值与默认 data 条数保持一致'),
                    window.i18n.t('预览 / 部署: 部署页面样式错乱问题')
                ]
            }, {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('画布: 布局 UI 优化'),
                    window.i18n.t('画布: 代码查看器滚动条颜色与工具栏按钮大小调整'),
                    window.i18n.t('应用管理: 优化页面截图实现')
                ]
            }
        ]
    }, {
        date: '2021.03.16',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 新增函数调用参数'),
                    window.i18n.t('画布: 新增 divider 分割线组件'),
                    window.i18n.t('画布: 导航模板侧边导航默认展开；右上角显示用户名以及支持退出登录功能'),
                    window.i18n.t('画布: 段落组件支持 v - model'),
                    window.i18n.t('画布: 文字链接组件增加 click 事件'),
                    window.i18n.t('画布: 表格增加首列为多选框的配置'),
                    window.i18n.t('画布: 表格列增加宽度设置'),
                    window.i18n.t('预览 / 部署: 部署页面增加绑定模块对应的 v3 进程管理页面入口')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复各个组件中 text slot 的 XSS 问题'),
                    window.i18n.t('画布: 修复段落组件 p 标签下载下来与内容不同的问题')
                ]
            },
            {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('画布: 文字链接组件 icon 位置配置改成下拉选择'),
                    window.i18n.t('画布: 属性面板样式调整'),
                    window.i18n.t('画布: dialog 组件交互优化。显示、隐藏按钮常驻，且再交互组件右侧配置面板添加可隐藏 / 显示的按钮；组件树点击非交互组件，当前交互式组件直接隐藏；遮罩层会添加隐藏组件的具体 id'),
                    window.i18n.t('画布: 远程函数添加说明；小窗复制的函数（未保存状态下）不显示删除和复制的 icon；函数管理的说明文档双引号改为单引号')
                ]
            }
        ]
    }, {
        date: '2021.03.08',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 新增 v -if, v - show, v -for 指令'),
                    window.i18n.t('画布: 新增 dialog 组件'),
                    window.i18n.t('画布: 基础组件增加 bkflow 流程组件'),
                    window.i18n.t('画布: 新增页面 json 展示'),
                    window.i18n.t('画布: 画布编辑页面增加新手指引'),
                    window.i18n.t('画布: 基础组件新增 Element 组件库以及 vue - weui 组件库')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 编辑页面体验问题'),
                    window.i18n.t('画布: 优化 grid、card 组件 hover 和 select 效果'),
                    window.i18n.t('应用管理: 修复共享的应用组件公开范围中特定应用丢失的问题'),
                    window.i18n.t('应用管理: 修复切换应用当前应用数据未更新问题'),
                    window.i18n.t('其他: cookie path 设置')
                ]
            },
            {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('画布: 代码查看器及页面配置样式优化'),
                    window.i18n.t('画布: 优化编辑器属性提示'),
                    window.i18n.t('应用管理: 优化没有权限调用 apigateway 接口的提示信息'),
                    window.i18n.t('其他: 更新 postcss 配置')
                ]
            }

        ]
    }, {
        date: '2021.02.04',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: table 自定义列内容'),
                    window.i18n.t('画布: 组件 slot支持拖拽（card 组件）'),
                    window.i18n.t('画布: 添加段落组件'),
                    window.i18n.t('预览 / 部署: 新增 BKPAAS_ENVIRONMENT 变量，自定义组件判断环境使用')
                ]
            },
            {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('应用管理: 自定义组件文档增加本地调试指引')
                ]
            }
        ]
    }, {
        date: '2021.01.26',
        detailList: [
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('体验 bug 修复以及优化')
                ]
            }
        ]
    }, {
        date: '2021.01.15',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('画布: 新增组件树'),
                    window.i18n.t('画布: 新增函数支持编辑函数标识')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('体验 bug 修复以及优化')
                ]
            }
        ]
    }, {
        date: '2021.01.07',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用管理: 新增操作审计功能'),
                    window.i18n.t('画布: chart 图表类型支持动态设置数据和属性')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('体验 bug 修复以及优化')
                ]
            }
        ]
    }, {
        date: '2020.12.22',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用管理: 布局模板实例新增[** 复合型导航布局 **](/help/layout)，方便用户更快速的搭建页面'),
                    window.i18n.t('画布: 支持设置自定义样式，可自定义编写 CSS 代码')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 体验 bug 修复以及优化')
                ]
            }
        ]
    }, {
        date: '2020.12.03',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用管理: 新增成员管理模块，用来管理应用的成员以及权限'),
                    window.i18n.t('应用管理: 新增布局模板实例模块，用来设置页面的导航布局，方便用户更快速的搭建页面'),
                    window.i18n.t('应用管理: 发布部署，绑定蓝鲸应用模块时，列表包含已下架的应用'),
                    window.i18n.t('画布: 新增图标面板，与基础组件、自定义组件面板区分开来，方便用户拖拽图标'),
                    window.i18n.t('画布: 新增[自由布局](/help/free - layout)')
                ]
            },
            {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('应用管理: 为初次进入系统的用户创建 demo 应用时，数据添加 createUser 和 updateUser')
                ]
            }
        ]
    }, {
        date: '2020.11.10',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用管理: 为初次进入系统的用户新增了 demo 应用')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复预览页面与部署后页面样式不一致的问题'),
                    window.i18n.t('画布: 自定义组件 ID 中带有 `_数字` 时，生成源码 eslint 检测不通过的问题')
                ]
            }
        ]
    }, {
        date: '2020.10.28',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('应用管理: 自定义组件支持设置公开范围，可公开到特定应用以及所有应用（包括后续新增的应用)'),
                    window.i18n.t('应用管理: 函数模块，远程函数支持调用 APIGW API（需先绑定蓝鲸应用模块）'),
                    window.i18n.t('画布: 自定义组件新增收藏功能'),
                    window.i18n.t('画布: grid 支持背景色设置'),
                    window.i18n.t('画布: 新增[函数使用指引](/help/method)'),
                    window.i18n.t('画布: 新增按钮组组件'),
                    window.i18n.t('应用管理 / 画布: 函数支持自己调用自己')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('画布: 修复 tree 组件查看源码的错误和数据问题')
                ]
            }, {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('画布: 组件属性设置中，优化 Array 类型数据的编辑模式，采用 jsonView 的形式'),
                    window.i18n.t('其他优化: 优化帮助入口；画布中鼠标改为手型；优化左侧栏收起的样式；部署页面优化；导航 logo 设置鼠标样式为 pointer，可点击跳转等等')
                ]
            }
        ]
    }, {
        date: '2020.10.16',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('新增页面生命周期配置'),
                    window.i18n.t('新增自定义组件下架逻辑'),
                    window.i18n.t('新增[表格查询案例文档](/help/case - table  search)'),
                    window.i18n.t('部署模块新增下架功能、同步 Paas 平台部署记录')
                ]
            }
        ]
    }, {
        date: '2020.09.25',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('新增应用级别路由配置功能'),
                    window.i18n.t('新增部分基础组件'),
                    window.i18n.t('画布中，组件新增指令配置，可用来配置组件的指令，在编辑函数时，可以通过编辑器自动补全、代码提示来获取组件的对应属性指令值'),
                    window.i18n.t('函数编辑新增 eslint 检测，代码提示等等')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('自定义组件、应用部署、函数管理模块部分 bug 修复')
                ]
            },
            {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('text, img 标签使用原生html标签，优化原生标签的 class 添加'),
                    window.i18n.t('自定义组件文档体验优化、文档完善')
                ]
            }
        ]
    }, {
        date: '2020.09.03',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('新增发布部署模块，与蓝鲸 PaaS 平台打通'),
                    window.i18n.t('新增自定义组件管理模块'),
                    window.i18n.t('新增应用级别的源码下载，方便二次开发'),
                    window.i18n.t('新增页面配置，支持简单的页面路由设置'),
                    window.i18n.t('组件新增 v - model 配置')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('拖拽部分 bug 修复')
                ]
            }
        ]
    }, {
        date: '2020.08.14',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('新增应用管理模块'),
                    window.i18n.t('新增页面管理模块'),
                    window.i18n.t('新增函数管理模块')
                ]
            },
            {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('拖拽画布中的函数管理优化')
                ]
            }
        ]
    }, {
        date: '2020.06.12',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('新增【图表】类型组件，增加【折线图】、【柱状图】、【饼状图】示例'),
                    window.i18n.t('增加复制、粘贴、撤销、恢复、删除等快捷操作'),
                    window.i18n.t('每个组件必要的属性增加 tip 说明'),
                    window.i18n.t('画布仅剩一个 grid 时，不允许删除；'),
                    window.i18n.t('增加清空 grid 操作')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('修复刷新页面时，没有选中组件但右侧面板会显示 grid 属性的问题'),
                    window.i18n.t('修复其他 bug')
                ]
            },
            {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('右侧组件属性、样式、事件说明'),
                    window.i18n.t('细节优化')
                ]
            }
        ]
    }, {
        date: '2020.05.26',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('添加[帮助文档](/help)'),
                    window.i18n.t('每个组件必要的属性增加 tip 说明'),
                    window.i18n.t('页面添加开源版入口')
                ]
            },
            {
                reviseTitle: window.i18n.t('修复'),
                logMassage: [
                    window.i18n.t('修复预览页面高度截断 bug')
                ]
            },
            {
                reviseTitle: window.i18n.t('优化'),
                logMassage: [
                    window.i18n.t('细节样式优化')
                ]
            }
        ]
    }, {
        date: '2020.04.28',
        detailList: [
            {
                reviseTitle: window.i18n.t('新增'),
                logMassage: [
                    window.i18n.t('运维开发平台（LessCode）初始版本')
                ]
            }
        ]
    }

]
