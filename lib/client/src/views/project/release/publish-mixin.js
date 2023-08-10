import dayjs from 'dayjs'

export default {
    data () {
        return {
            typeMap: [window.i18n.t('部署'), window.i18n.t('下架')],
            statusMap: {
                successful: window.i18n.t('成功'),
                failed: window.i18n.t('失败'),
                running: window.i18n.t('中...')
            }
        }
    },
    methods: {
        getInfoTips (info, type = '') {
            let time = info.updateTime ? dayjs(info.updateTime).format('YYYY-MM-DD HH:mm:ss') : '--'
            let updateUser = info.updateUser
            if (info.releaseType === 'FROM_V3') {
                const paasInfo = info.fromPaasInfo ? JSON.parse(info.fromPaasInfo) : {}
                time = paasInfo.updateTime || time
                updateUser = paasInfo.updateUser || updateUser
            }

            const status = this.typeMap[info.isOffline] + this.statusMap[info.status]
            const env = info.env === 'stag' ? window.i18n.t('预发布环境') : window.i18n.t('生产环境')
            const statusColor = info.status === 'successful' ? '#2dcb56' : (info.status === 'failed' ? '#ea3636' : '')
            const loading = info.status === 'running' ? window.i18n.t('正在') : ''

            if (type === 'last') {
                return window.i18n.t('{0}，版本{1}，由 {2} 于 {3}', [env, info.version, updateUser, time]) + `<span> ${loading}${status}</span>`
            } else if (type === 'running') {
                return `${env}` + `<span style="font-weight: 700;"> ${info.version} </span> ${window.i18n.t('版本')}` + `<span style="color: ${statusColor}"> ${loading}${status}</span>`
            } else {
                return window.i18n.t('由 {0} 于 {1} {2}', [updateUser, time, status])
            }
        }
    }
}
