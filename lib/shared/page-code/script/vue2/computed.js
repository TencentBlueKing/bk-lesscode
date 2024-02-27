/**
 * @desc 返回computed内容
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    let computed = ''
    // isUseSwiper时，添加bkH5Container的compute属性，获取swiper实例
    if ((['vueCode', 'projectCode'].includes(code.pageType) && code.hasLayout) || code.projectVariables.length || code.pageComputedVariables.length || code.isUseSwiper) {
        let computedCon = ''
        if (['vueCode', 'projectCode'].includes(code.pageType) && code.hasLayout) {
            computedCon += '...mapGetters([\'user\']),\n'
        }
        // 生成项目源码或预览时，项目级变量统一放到store中
        code.projectVariables.forEach((variable) => {
            computedCon += `${variable.variableCode}: {
                get () {
                    return this.$store.state.variable.${variable.variableCode}
                },
                set (val) {
                    this.$store.dispatch('variable/setBkProjectVariable', { code: '${variable.variableCode}', val })
                }
            },
            `
        })
        // computed类型变量
        code.pageComputedVariables.forEach((variable) => {
            computedCon += `${variable.variableCode} () {
                ${variable.defaultValue.all}
            },
            `
        })
        // 使用了h5容器
        if (code.isUseSwiper) {
            computedCon += `bkH5Container() {
                return this.$refs['h5-container'].swiper
            }`
        }
        computed = `computed: {
            ${computedCon}
        },`
    }
    return computed
}
