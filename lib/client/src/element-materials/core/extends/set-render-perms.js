import _ from 'lodash'

/**
 * @desc 设置对接权限中心操作权限（全量覆盖）
 * @param { Node } node
 * @param { Object } perms
 * @returns { Boolean }
 */
export default function (node, perms) {
    if (!Array.isArray(perms)) {
        throw new Error(window.i18n.t('setRenderPerms 只支持 Array 数据'))
    }
    node.renderPerms = _.cloneDeep(perms)
    return true
}
