/**
 * 将version转换为数组，方便对比
 * @param {*} version 版本，比如 0.0.0
 * @returns 返回版本数字
 */
export const transformVersionToNum = (version) => {
    const versionNums = version.split('.')
    return versionNums.reverse().reduce((acc, cur, index) => {
        return acc + Number(cur) * 10 ** index
    }, 0)
}
