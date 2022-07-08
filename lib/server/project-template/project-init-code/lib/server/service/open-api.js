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
