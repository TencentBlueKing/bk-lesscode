import {
    computed,
    // ref,
    getCurrentInstance,
    onBeforeUnmount
} from '@vue/composition-api'
import { useStore } from '@/store'
import { useRoute } from '@/router'
import { bkNotify, bkMessage } from 'bk-magic-vue'

let lockNotify = ''

export default function () {
    const store = useStore()
    const route = useRoute()

    const currentInstance = getCurrentInstance()
    const pageId = route.params.pageId
    
    const userInfo = computed(() => store.getters.user)

    const check = () => {
        return store.dispatch('page/pageLockStatus', {
            pageId
        })
    }

    /**
     * @desc 用编辑权时，间隔更新抢占状态
     */
    let updateTimer = ''
    const update = () => {
        store.dispatch('page/updatePageLock', {
            data: {
                pageId
            }
        }).then(() => {
            updateTimer = setTimeout(() => {
                update()
            }, 20000)
        })
    }

    /**
     * @desc 主动释放编辑权
     */
    const relase = () => {
        const data = new FormData()
        data.append('activeUser', userInfo.value.username)
        data.append('pageId', pageId)
        navigator.sendBeacon('/api/page/releasePage', data)
    }
    /**
     * @desc 个状态下的消息提示
     * @param { Object } paylod // type: 编辑状态类型；accessible：是否有效；user：编辑状态拥有权的用户名
     */
    const notify = ({ type, accessible, activeUser, render }) => {
        const getLockMessage = (h) => {
            const notifyType = `${type}-${accessible ? 'valiad' : 'invaliad'}`

            const userStyle = {
                color: '#EA3636'
            }
            const buttonStyle = {
                cursor: 'pointer',
                color: '#3a84ff'
            }
        
            const handleRefresh = () => {
                window.location.reload()
            }
            const handleOccupy = async () => {
                const data = await store.dispatch('page/occupyPage', {
                    data: {
                        pageId
                    }
                })
                if (data.activeUser === userInfo.value.username) {
                    lockNotify && lockNotify.close()
                    bkMessage({
                        message: window.i18n.t('抢占成功'),
                        theme: 'success'
                    })
                } else {
                    bkMessage({
                        message: window.i18n.t('抢占失败'),
                        theme: 'error'
                    })
                }
            }

            const notifyMap = {
                'lock-invaliad': () => (
                    <div>
                        <span>{ window.i18n.t('当前画布正在被') }</span>
                        <span style={userStyle}>{activeUser}</span>
                        <span>{ window.i18n.t('编辑，您暂无编辑权限，如需操作请联系其退出编辑，如仅需查看页面最新状态，请直接') }</span>
                        <span style={buttonStyle} onClick={handleRefresh}>{ window.i18n.t('刷新页面') }</span>
                    </div>
                ),
                'lock-valiad': () => (
                    <div>
                        <span>{ window.i18n.t('当前画布正在被') }</span>
                        <span style={userStyle}>{activeUser}</span>
                        <span>{ window.i18n.t('编辑，如需获取操作，可点击') }</span>
                        <span style={buttonStyle} onClick={handleOccupy}>{ window.i18n.t('获取权限') }</span>
                        <span>，{ window.i18n.t('如仅需查看页面最新状态，请直接') }</span>
                        <span style={buttonStyle} onClick={handleRefresh}>{ window.i18n.t('刷新页面') }</span>
                    </div>
                ),
                'taked-invaliad': () => (
                    <div>
                        <span>{ window.i18n.t('由于您长时间未操作，页面编辑权已被释放；当前页面正在被') }</span>
                        <span style={userStyle}>{activeUser}</span>
                        <span>{ window.i18n.t('编辑，如仍需操作请联系其退出，如仅需查看页面最新状态，请直接') }</span>
                        <span style={buttonStyle} onClick={handleRefresh}>{ window.i18n.t('刷新页面') }</span>
                    </div>
                ),
                'taked-valiad': () => (
                    <div>
                        <span>{ window.i18n.t('由于您长时间未操作，页面编辑权已被释放；当前页面正在被') }</span>
                        <span style={userStyle}>{activeUser}</span>
                        <span>{ window.i18n.t('编辑，如需获取操作，可点击') }</span>
                        <span style={buttonStyle} onClick={handleOccupy}>{ window.i18n.t('获取权限') }</span>
                        <span>，{ window.i18n.t('如仅需查看页面最新状态，请直接') }</span>
                        <span style={buttonStyle} onClick={handleRefresh}>{ window.i18n.t('刷新页面') }</span>
                    </div>
                )
            }
        
            return (
                <div style="line-height: 26px">
                    {notifyMap[notifyType]()}
                </div>
            )
        }
        if (lockNotify) {
            lockNotify.close()
        }
        // 如果不是在setup中调用，没有currentInstance
        const h = render || currentInstance.proxy.$createElement
        lockNotify = bkNotify({
            title: window.i18n.t('暂无编辑权限'),
            theme: 'warning',
            limit: 1,
            delay: 0,
            message: getLockMessage(h),
            useHTMLString: true
        })
        if (render) return lockNotify
    }

    // 间隔更新抢占状态有个定时器，组件卸载时需要去掉
    onBeforeUnmount(() => {
        lockNotify && lockNotify.close()
        lockNotify = null
        clearTimeout(updateTimer)
    })

    return {
        check,
        update,
        relase,
        notify
    }
}
