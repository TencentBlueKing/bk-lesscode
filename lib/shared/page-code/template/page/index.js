import generateLayout from './layout'

/**
 * @desc 生成template部分
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    return generateLayout(code, code.targetData)
}
