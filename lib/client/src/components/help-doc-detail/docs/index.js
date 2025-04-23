import zhMdCom from './zh'
import enMdCom from './en'
import { getCurLang } from '@/locales/i18n'
const langMdComsMap = {
    'zh-cn': zhMdCom,
    'en': enMdCom
}
export default langMdComsMap[getCurLang()]
