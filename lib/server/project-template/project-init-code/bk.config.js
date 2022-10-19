
const path = require('path')

module.exports = {
    assetsDir: './lib/client/static',
    outputDir: './lib/client/dist',
    port: process.env.BK_APP_PORT,
    host: process.env.BK_APP_HOST,
    publicPath: process.env.BK_STATIC_URL,
    typescript: true,
    bundleAnalysis: false,
    replaceStatic: true,
    parallel: 8,
    copy: {
        from: './lib/client/static',
        to: './lib/client/dist/static'
    },
    resource: {
        main: {
            entry: './lib/client/src/main.js',
            html: {
                filename: 'index.html',
                template: './lib/client/index.html'
            }
        }
    },
    // webpack config 配置
    configureWebpack () {
        const serverAddress = `http://${process.env.BK_APP_HOST}:${process.env.BK_APP_PORT - 1}`
        return {
            resolve: {
                alias: {
                    '@': path.resolve(__dirname, './lib/client/src'),
                    'shared': path.resolve(__dirname, './lib/shared')
                }
            },
            devServer: {
                proxy: [
                    {
                        context (path) {
                            const proxyRegs = [
                                /^\/api/
                            ]
                            return proxyRegs.some(reg => reg.test(path))
                        },
                        target: serverAddress
                    }
                ]
            }
        }
    }
}
