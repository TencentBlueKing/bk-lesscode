import jsCookie from 'js-cookie'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import 'dayjs/locale/zh-cn'
import 'dayjs/locale/en'

dayjs.extend(relativeTime)

export default function (time) {
    if (jsCookie.get('blueking_language') === 'en') {
        return dayjs(time).locale('en')
    } else {
        return dayjs(time).locale('zh-cn')
    }
}
