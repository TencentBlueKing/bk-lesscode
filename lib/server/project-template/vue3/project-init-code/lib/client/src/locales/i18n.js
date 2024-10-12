import { createI18n } from 'vue-i18n'
import dayjs from 'dayjs'
import { defaultRootConfig } from 'bkui-vue'
import { reactive } from 'vue'
import Cookies from 'js-cookie'

export const BK_UI_ROOT_CONFIG = defaultRootConfig || reactive({
    locale: null
})

// 初始化加载fallbackLocale 语言包，但是图表平台首先加载框架，无需放到框架里面去加载
const i18n = createI18n({
    fallbackLocale: 'zh-cn', // 设置备用语言
    silentFallbackWarn: true,
    silentTranslationWarn: true,
    globalInjection: true
})

window.i18n = i18n.global

export async function initLang () {
    try {
        const lang = getCurLang()
        const LangBkUI = await import(`bkui-vue/dist/locale/${lang}.esm`)
        BK_UI_ROOT_CONFIG.locale = LangBkUI?.default
        const langFile = await import(`./lang/${lang}.json`)
        i18n.global.setLocaleMessage(lang, langFile)
        i18n.global.locale = lang
        dayjs.locale(lang)
        return Promise.resolve(true)
    } catch (e) {
        console.error(e)
        return Promise.reject(e)
    }
}

export function getCurLang () {
    const coookieLang = Cookies.get('blueking_language')
    return coookieLang || 'zh-cn'
}

export function changeLang (lang) {
    const domainList = location.hostname.split('.')

    // 本项目开发环境因为需要配置了 host 域名比联调环境多 1 级
    if (process.env.NODE_ENV === 'development') {
        domainList.splice(0, 1)
    }

    // 删除已有cookie
    for (let i = 0; i < domainList.length - 1; i++) {
        Cookies.remove('blueking_language', {
            domain: domainList.slice(i).join('.')
        })
    }

    // 优先使用环境变量中的bk_domain
    let domain = window.BKPAAS_BK_DOMAIN
    if (!domain) {
        domain = domainList.length > 2 ? domainList.slice(1).join('.') : domainList.join('.')
    }
    console.log(domain, 'bk_domain:', window.BKPAAS_BK_DOMAIN)
    Cookies.set('blueking_language', lang, {
        expires: 30,
        domain
    })

    initLang()
        .finally(() => {
            window.location.reload()
        })
}
export default i18n
