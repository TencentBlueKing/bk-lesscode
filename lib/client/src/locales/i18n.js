import Vue from 'vue'
import VueI18n from 'vue-i18n'
import jsCookie from 'js-cookie'
import { jsonp } from 'vue-jsonp'
import { locale, lang } from 'bk-magic-vue'
import enJson from './lang/en.json'
import zhCNJson from './lang/zh-cn.json'
import tempfuncEnJson from './temp-func/en.json'
import tempfuncZhChJson from './temp-func/zh-cn.json'
import versionLogEnJson from './version-log/en.json'
import versionLogZhChJson from './version-log/zh-cn.json'

Vue.use(VueI18n)

export const i18nConfig = {
    // 语言标识
    locale: jsCookie.get('blueking_language') || 'zh-cn',
    fallbackLocale: 'zh-cn',
    silentTranslationWarn: true,
    messages: {
    // 中文语言包
        'zh-cn': Object.assign(
            lang.zhCN,
            zhCNJson,
            tempfuncZhChJson,
            versionLogZhChJson
            // 通过英文包的key配置中文包内容 可省去中文包
            // Object.keys(enJson).reduce((pre, key) => {
            //     pre[key] = key
            //     return pre
            // }, {})
        ),
        // 英文语言包
        en: Object.assign(lang.enUS, enJson, tempfuncEnJson, versionLogEnJson)
    }
}

const i18n = new VueI18n(i18nConfig)
locale.i18n((key, value) => i18n.t(key, value))
window.i18n = i18n

export function getCurLang () {
    const coookieLang = jsCookie.get('blueking_language')
    return coookieLang || 'zh-cn'
}
export function changeLang (lang) {
    // 写到用户管理
    const url = `${window.BK_COMPONENT_API_URL}/api/c/compapi/v2/usermanage/fe_update_user_language`
    console.log(url, 'component api url')
    jsonp(url, {
        language: lang
    }).then(res => {
        console.log(url, 'changelangres:', res)
    })
    const domainList = location.hostname.split('.')
    // 本项目开发环境因为需要配置了 host 域名比联调环境多 1 级
    if (process.env.NODE_ENV === 'development') {
        domainList.splice(0, 1)
    }
    // 删除已有cookie
    for (let i = 0; i < domainList.length - 1; i++) {
        jsCookie.remove('blueking_language', {
            domain: domainList.slice(i).join('.')
        })
    }
    // 优先使用环境变量中的bk_domain
    let domain = window.BKPAAS_BK_DOMAIN
    if (!domain) {
        domain = domainList.length > 2 ? domainList.slice(1).join('.') : domainList.join('.')
    }
    console.log(domain, 'bk_domain:', window.BKPAAS_BK_DOMAIN)
    jsCookie.set('blueking_language', lang, {
        expires: 366,
        // 和平台保持一致，cookie 种在上级域名
        domain
    })
    window.location.reload()
}

export default i18n
