module.exports = () => {
    return async function (ctx, next) {
        /**
         * 通用异常
         * @param  {String | BusinessError | Object} error 异常
         */
        ctx.throwError = function (error) {
            if (typeof error === 'string') {
                throw new global.BusinessError(error)
            } else if (error instanceof global.BusinessError) {
                throw error
            } else {
                const {
                    status = 200,
                    message,
                    code
                } = error
                throw new global.BusinessError(message, code, status)
            }
        }
        /**
         * 特定异常 BusinessError
         * @param  {String} error 异常
         */
        ctx.throwBusinessError = function (message) {
            throw new global.BusinessError(message, 499)
        }

        try {
            await next()
        } catch (error) {
            const {
                status = 500,
                code,
                message,
                data
            } = error

            ctx.status = status
            ctx.body = {
                code,
                message,
                data
            }

            // 调用日志记录下来
            ctx.app.emit('error', error, ctx)
        }
    }
}
