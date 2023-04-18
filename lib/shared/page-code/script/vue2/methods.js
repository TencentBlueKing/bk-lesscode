import { sharedI18n } from '../../../util'

/**
 * @desc 返回methods内容
 * @param { CodeModel } code
 * @returns { String }
 */
export default function (code) {
    let methods = ''

    // 当页面中含有导航布局或使用了远程函数或使用了函数管理中的函数时，methods里面会有内容
    if (code.hasLayout || code.remoteDataStr || (code.usingFuncCodes.length && code.pageType !== 'projectCode')) {
        let methodsCon = ''

        // web端导航布局相关的方法
        if (code.hasLayout && code.platform !== 'MOBILE') {
            methodsCon += getWebNavMethods(code.pageType, code.layoutType, code.uniqueKey, code.deletePageCodes)
        }

        // 远程数据源方法
        if (code.remoteDataStr) {
            methodsCon += `
                async initRemoteData () {
                    try {
                        ${code.remoteDataStr}
                    } catch (error) {
                        console.error(error)
                    }
                },
            `
        }

        // 预览和查看源码，函数写在页面里面
        if (code.pageType !== 'projectCode') methodsCon += code.methodStrList.map((func) => (func.funcStr)).join(',')

        methods = `methods: {
            ${methodsCon}
        },`
    }

    return methods
}

// 返回导航布局中用到的方法
function getWebNavMethods (pageType, layoutType, uniqueKey, deletePageCodes) {
    /* eslint-disable indent */
    let navStr = `
        goToPage (item) {
            if (this.$route.query.id === item.id) return
            this.setNav(item.id)
            const originQuery = item.query || ''
            const queryStr = originQuery[0] === '?' ? originQuery.slice(1) : originQuery
            const queryArr = queryStr.split('&').filter(v => v)
            const query = queryArr.reduce((res, item) => {
                const [key, value = ''] = item.split('=')
                res[key] = value
                return res
            }, { id: item.id })
            if (item.pageCode && item.pageCode === this.$route.name) {
                this.$router.push({ path: this.$route.path, query })
            } else if (item.pageCode && !${JSON.stringify(deletePageCodes || [])}.includes(item.pageCode)) {
                this.$router.push({ name: item.pageCode, query })
            } else if (item.fullPath) {
                this.$router.push({ path: item.fullPath, query })
            } else if (item.link) {
                window.open(item.link, '_blank')
            } else {
                this.$router.push({ path: '${uniqueKey}', query })
            }
        },
    `
    let setNav = ''
    const pageKey = 'pageCode'
    const pageValue = pageType === 'projectCode' ? 'this.$route.name' : 'this.$route.query.pageCode'
    switch (layoutType) {
        case 'top-bottom':
            setNav = `setNav (id) {
                const itemId = id || this.$route.query.id
                const name = ${pageValue};
                (this.topMenuLesscode || []).forEach((topNav) => {
                    const isSameId = itemId && (topNav.id === itemId || (Array.isArray(topNav.children) && topNav.children.find((nav) => (nav.id === itemId))))
                    const isSameName = !itemId && name && (topNav.${pageKey} === name || (Array.isArray(topNav.children) && topNav.children.find((nav) => (nav.${pageKey} === name))))
                    if (isSameId || isSameName) this.curNav = topNav || {}
                })
            },`
            break
        case 'left-right':
            setNav = `setNav (id) {
                const itemId = id || this.$route.query.id
                const name = ${pageValue};
                (this.leftMenuLesscode || []).forEach((menu) => {
                    let tempItem
                    if (itemId) {
                        tempItem = [menu, ...(menu.children || [])].find((child) => (child.id === itemId))
                    } else {
                        tempItem = [menu, ...(menu.children || [])].find((child) => (child.${pageKey} === name))
                    }
                    if (tempItem) this.curNav = tempItem
                })
            },`
            break
        case 'complex':
            setNav = `setNav (id) {
                const itemId = id || this.$route.query.id
                const name = ${pageValue};
                (this.complexMenuLesscode || []).forEach((menu) => {
                    const allMenus = [menu];
                    (menu.children || []).forEach((child) => {
                        allMenus.push(...[child, ...(child.children || [])])
                    })
                    const tempItem = itemId ? allMenus.find((child) => (child.id === itemId)) : allMenus.find((child) => (child.${pageKey} === name))
                    if (tempItem) {
                        this.curNav = tempItem
                        this.leftMenuLesscode = menu.children || []
                    }
                })
            },`
            break
    }

    if (['projectCode', 'vueCode'].includes(pageType)) {
        navStr += `signOut () {
                auth.signOut()
            },
        `
    } else {
        navStr += `signOut () {
                this.$bkMessage({ message: '${sharedI18n().t('请部署后使用本功能')}', theme: 'warn' })
            },
        `
    }
    navStr += setNav
    /* eslint-enable indent */
    return navStr
}
