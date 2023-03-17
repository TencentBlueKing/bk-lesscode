import Vue from 'vue'
import VueI18n from 'vue-i18n'
import jsCookie from 'js-cookie'
import { locale, lang } from 'bk-magic-vue'
import enJson from './lang/en.json'
import zhCNJson from './lang/zh-cn.json'

Vue.use(VueI18n)

const localLanguage = jsCookie.get('blueking_language') || 'zh-cn'
const i18n = new VueI18n({
    // 语言标识
    locale: localLanguage,
    fallbackLocale: 'zh-cn',
    messages: {
    // 中文语言包
        'zh-cn': Object.assign(
            lang.zhCN,
            zhCNJson
            // 通过英文包的key配置中文包内容 可省去中文包
            // Object.keys(enJson).reduce((pre, key) => {
            //     pre[key] = key
            //     return pre
            // }, {})
        ),
        // 英文语言包
        en: Object.assign(lang.enUS, enJson)
    }
})
locale.i18n((key, value) => i18n.t(key, value))
window.i18n = i18n

export default i18n
