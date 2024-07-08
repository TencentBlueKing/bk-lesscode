import * as CompFavouriteModel from '../model/comp-favourite'

export const list = async (ctx) => {
    try {
        const projectId = ctx.request.headers['x-project-id']
        const data = await CompFavouriteModel.all({
            projectId
        })
        ctx.send({
            code: 0,
            message: 'success',
            data
        })
    } catch (error) {
        ctx.send({
            code: -1,
            message: error.message,
            data: null
        })
    }
}
// 收藏
export const add = async (ctx) => {
    try {
        const projectId = ctx.request.headers['x-project-id']
        const { compId } = ctx.request.body

        if (!compId) {
            throw new Error(global.i18n.t('组件id不能为空'))
        }
        const params = {
            compId,
            projectId
        }
        await CompFavouriteModel.create(params)
        ctx.send({
            code: 0,
            message: 'success',
            data: ''
        })
    } catch (error) {
        ctx.send({
            code: -1,
            message: error.message,
            data: null
        })
    }
}

// 取消收藏
export const favouriteDelete = async (ctx) => {
    try {
        const projectId = ctx.request.headers['x-project-id']
        const { compId } = ctx.request.body

        if (!compId) {
            throw new Error(global.i18n.t('组件id不能为空'))
        }
        const params = {
            compId,
            projectId
        }
        await CompFavouriteModel.remove(params)
        ctx.send({
            code: 0,
            message: 'success',
            data: ''
        })
    } catch (error) {
        ctx.send({
            code: -1,
            message: error.message,
            data: null
        })
    }
}
