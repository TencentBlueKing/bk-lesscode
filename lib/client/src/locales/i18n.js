import Vue from 'vue'
import VueI18n from 'vue-i18n'
import jsCookie from 'js-cookie'
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

export default i18n
