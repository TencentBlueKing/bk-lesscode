import { REGX_CHIOCE_LIST } from '../../../../shared/no-code/constant'

/**
 * 生成 uuid
 *
 * @param {Number} len 长度
 * @param {Number} radix 基数
 *
 * @return {string} uuid
 */
export function uuid (len = 5, radix = 16) {
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('')
    const uuid = []
    radix = radix || chars.length

    if (len) {
        let i
        // Compact form
        for (i = 0; i < len; i++) {
            uuid[i] = chars[0 | Math.random() * radix]
        }
    } else {
        // rfc4122, version 4 form
        let r

        // rfc4122 requires these characters
        uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-'
        uuid[14] = '4'

        let i
        // Fill in random data.  At i==19 set the high bits of clock sequence as
        // per rfc4122, sec. 4.1.5
        for (i = 0; i < 36; i++) {
            if (!uuid[i]) {
                r = 0 | Math.random() * 16
                uuid[i] = chars[(i === 19) ? (r & 0x3) | 0x8 : r]
            }
        }
    }

    return uuid.join('')
}

export function getFieldDefaultVal (type) {
    switch (type) {
        case 'description':
        case 'input':
        case 'textarea':
        case 'date':
        case 'datetime':
        case 'select':
        case 'radio':
        case 'link':
        case 'rich-text':
            return ''

        case 'int':
        case 'rate':
            return 0

        case 'checkbox':
        case 'multiple-select':
        case 'member':
        case 'members':
        case 'table':
            return []

        default:
            return ''
    }
}

export function getFieldRegexList (type) {
    return REGX_CHIOCE_LIST().filter(item => {
        const types = Array.isArray(item.type) ? item.type : [item.type]
        return types.includes(type.toUpperCase()) || item.type === ''
    })
}
