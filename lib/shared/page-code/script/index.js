import getVue2Script from './vue2'
import getVue3Scipt from './vue3'

/**
 * @desc 根据vueType区分是生成vue2还是vue3源码，vue3预留
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    if (code?.vueType === 'vue3') {
        return getVue3Scipt(code)
    } else {
        return getVue2Script(code)
    }
}
