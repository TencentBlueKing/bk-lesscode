import bkToken from '../conf/token'
import {
    decodeToken
} from '@bkui/apigateway-nodejs-sdk'

export const getUserFromApiGW = async (jwt) => {
    const { user } = await decodeToken(jwt, bkToken)
    if (!user) {
        throw new Error('未解析到用户名，请修改后再试')
    }
    return user
}

export const getAuthQuerySubfix = (cookies) => {
    return `bk_app_code=${bkToken?.bk_app_code}&bk_app_secret=${encodeURI(bkToken?.bk_app_secret)}&${global.AUTH_NAME}=${cookies.get(global.AUTH_NAME)}`
}

export const getAuthPostParams = (cookies) => {
    return {
        bk_app_code: bkToken?.bk_app_code,
        bk_app_secret: bkToken?.bk_app_secret,
        [global.AUTH_NAME]: cookies.get(global.AUTH_NAME)
    }
}
