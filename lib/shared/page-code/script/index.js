import getVue2Script from './vue2'
import getVue3Scipt from './vue3'

export default function (code) {
    if (code?.vueType === 'vue3') {
        return getVue3Scipt(code)
    } else {
        return getVue2Script(code)
    }
}
