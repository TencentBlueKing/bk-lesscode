import ApplyPermissionDialog from '@/components/apply-permission/apply-dialog'

let permissionInstance

export const permissionDialog = (authParams = {}, authResult = {}) => {
    if (!permissionInstance) {
        permissionInstance = new Vue(ApplyPermissionDialog).$mount()
        permissionInstance.$watch(() => permissionInstance.isShowDialog, (isShowDialog) => {
            if (!isShowDialog) {
                document.body.removeChild(permissionInstance.$el)
            }
        })
    }
    permissionInstance.authParams = authParams
    permissionInstance.authResult = authResult
    permissionInstance.show()
    permissionInstance.$nextTick(() => {
        document.body.appendChild(permissionInstance.$el)
    })
}
