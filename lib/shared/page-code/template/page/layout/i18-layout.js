export default function generateInternationMenu (code, isWhiteTheme, slotName) {
    const { layoutContent } = code
    const langMenuKey = 'topLangMenuList'
    layoutContent.langMenuList = [
        {
            id: 'zh-cn',
            name: '中文',
            icon: 'chinese'
        },
        {
            id: 'en',
            name: 'English',
            icon: 'english'
        }
    ]
    code.dataTemplate(langMenuKey, JSON.stringify(layoutContent.langMenuList || []))

    return `<bk-popover v-if="${langMenuKey}.length > 0"  class="nav-lang-menu" theme="light navigation-message empty-padding"  placement="bottom-end" :arrow="false" :distance="5"  :z-index="999" :tippy-options="{ animateFill: false, hideOnClick: false }">
                <div :class="{ 'info-language': true, 'white-nav-help-icon': ${isWhiteTheme} }">
                    <i :class="langIconCls(curLang)"></i>
                </div>
                <template ${slotName}>
                    <a
                        v-for="(lang) in ${langMenuKey}"
                        :key="lang.id"
                        class="popover-link"
                        @click="handleLanguageChange(lang)"
                    >
                        <i :class="langIconCls(lang.name)"></i>{{ lang.name }}
                    </a>
                </template>
            </bk-popover>`
}
