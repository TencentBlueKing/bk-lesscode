/**
 * @desc 返回watch内容
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    let watch = ''
    // 当使用到web端导航布局时，watch里面会有内容
    if (code.hasLayout && code.platform !== 'MOBILE') {
        watch += `watch: {
            '$route' () {
                this.setNav()
            }
        },`
    }
    return watch
}
