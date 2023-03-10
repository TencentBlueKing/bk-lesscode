/**
 * @desc 返回mixins内容
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    // 当生成的是项目源码时，统一将使用到的函数库中的函数跟页面函数中生命周期设置的函数放置到mixins文件中
    return code.pageType === 'projectCode' && (code.usingFuncCodes.length > 0 || code.exisLifyCycle.length > 0) ? 'mixins: [methodsMixin],' : ''
}
