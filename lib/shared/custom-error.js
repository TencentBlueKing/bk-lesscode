
/**
 * 自定义错误
 */
export class CustomError extends Error {
    constructor (code, message, payload) {
        super()
        this.code = code
        this.message = message
        this.payload = payload
    }
}
