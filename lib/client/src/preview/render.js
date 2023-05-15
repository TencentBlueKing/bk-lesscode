import App from './children/app/app'
import generateRouter from './router'
import generateStore from './store'
import {
    render
} from 'bk-lesscode-render'
import {
    i18nConfig
} from '@/locales/i18n.js'

export const handleRender = (data, projectId, versionId, platform) => {
    const projectPageRouteList = (data.pageRouteList || []).map(item => ({
        ...item,
        fullPath: item.id ? `${item.layoutPath}${item.layoutPath.endsWith('/') ? '' : '/'}${item.path}` : ''
    }))
    const projectRouteList = (Object.values(data.routeGroup || {}) || []).map(({ children }) => children)
        .reduce((pre, cur) => pre.concat(cur), [])
        .map(({ id, layoutPath, path, redirect, pageCode }) => ({
            id,
            layoutPath,
            path,
            redirect,
            pageCode,
            fullPath: `${layoutPath}${layoutPath.endsWith('/') ? '' : '/'}${path}`
        }))

    const router = generateRouter(data.routeGroup, projectPageRouteList, projectRouteList, projectId, platform, versionId)
    const store = generateStore(data.storeData, { projectPageRouteList, projectRouteList })
    // 执行渲染
    window.app = render({
        component: App,
        router,
        store,
        i18nConfig,
        selector: '#preview-app'
    })
}
