import Vue from 'vue'

/**
 * @desc 页面编辑状态未保存离开确认
 * @param { String } message
 * @returns { Promise }
 */
export const leaveConfirm = (message = '离开将会导致未保存信息丢失') => {
    if (!window.leaveConfirm || window.leaveConfirm === 'dialog') {
        return Promise.resolve(true)
    }
    const vm = new Vue()
    const h = vm.$createElement
    return new Promise((resolve, reject) => {
        vm.$bkInfo({
            title: '确认离开当前页？',
            okText: '离开',
            subHeader: h('p', {
                style: {
                    color: '#63656e',
                    fontSize: '14px',
                    textAlign: 'center'
                }
            }, message),
            confirmFn: () => {
                window.leaveConfirm = false
                resolve(true)
            },
            cancelFn: () => {
                reject(Error('cancel'))
            }
        })
    })
}
