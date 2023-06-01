<template>
    <section style="font-size:12px">
        <section v-for="(item, index) in steps" :key="index">
            <p><strong>{{item.title}}</strong></p>
            <p>{{ item.desc }}<br><br></p>
        </section>
    </section>
</template>>

<script>
    export default {
        data () {
            return {
                steps: [
                    {
                        title: window.i18n.t('安装依赖包'),
                        desc: 'npm install'
                    },
                    {
                        title: window.i18n.t('配置与登录域名同主域的host'),
                        desc: `127.0.0.1 ${this.getHost()}`
                    },
                    {
                        title: window.i18n.t('检查配置文件'),
                        desc: window.i18n.t('注意：运行之前，请检查配置文件.babelrc、eslintrc.js等以.开头的配置文件是否存在。部分操作系统会默认隐藏这类文件，导致在推送到代码仓库时漏掉，最终影响部署结果。')
                    },
                    {
                        title: window.i18n.t('检查依赖'),
                        desc: window.i18n.t('请在源码根目录下package.json文件中查看nodejs及npm包版本信息，并将本地开发环境中的nodejs及npm包版本升级')
                    },
                    {
                        title: window.i18n.t('登录'),
                        desc: window.i18n.t('如需本地运行， 请先到lib/server/conf/token文件中，填写dev配置中的bk_app_code及bk_app_secret（可通过\'发布部署-》更多操作-》基本信息\'跳转至蓝鲸开发者中心获取该配置值），应用源码已集成登录逻辑')
                    },
                    {
                        title: window.i18n.t('本地数据库配置'),
                        desc: window.i18n.t('如果有用到数据源、表单页面等相关涉及到数据库的功能，请先在lib/server/conf/db-base.js配置本地开发环境数据库，未用到则跳过此步骤')
                    },
                    {
                        title: window.i18n.t('启动服务'),
                        desc: 'npm run dev'
                    },
                    {
                        title: window.i18n.t('打开链接'),
                        desc: window.i18n.t('浏览器输入：') + `${this.getHost()}:5000`
                    },
                    {
                        title: window.i18n.t('打包构建（生成dist目录）'),
                        desc: 'npm run build'
                    },
                    {
                        title: window.i18n.t('打包构建分析'),
                        desc: 'npm run build:analyzer'
                    }
                ]
            }
        },
        methods: {
            getHost () {
                const url = location.href
                const reg = new RegExp(/(\w+):\/\/([^/:]+)(:\d*)?/)
                const matchObj = url.match(reg)
                return matchObj[2].startsWith('local-') ? matchObj[2] : `local-${matchObj[2]}`
            }
        }
    }
</script>
