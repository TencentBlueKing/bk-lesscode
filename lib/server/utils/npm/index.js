/**
 * 生成npm资源
 */

const fse = require('fs-extra')
const path = require('path')
const { spawn, exec } = require('child_process')

// npm.js配置文件不存在时赋值空对象
let config
try {
    config = require('../../conf/npm')
} catch (_) {
    config = {}
}

const npmLogin = (cmd, userName, passWord, email) => {
    return new Promise((resolve, reject) => {
        const npmLogin = spawn(cmd, ['login', `--registry ${config.registry}`], {
            stdio: ['pipe', 'pipe', 'inherit'],
            shell: true
        })

        npmLogin.stdout.on('data', (data) => {
            const str = data.toString()
            if (str.match(/Username/i)) {
                npmLogin.stdin.write(userName + '\n')
            } else if (str.match(/Password/i)) {
                npmLogin.stdin.write(passWord + '\n')
            } else if (str.match(/email/i)) {
                npmLogin.stdin.write(email + '\n')
                npmLogin.stdin.end()
            }
        })

        npmLogin.on('error', () => {
            reject(new Error(global.i18n.t('登录失败')))
        })

        npmLogin.on('close', () => {
            resolve()
        })
    })
}

const publishNpmSource = (dirPath) => {
    return new Promise((resolve, reject) => {
        exec(`npm publish --registry ${config.registry} --access public`, { cwd: dirPath }, (err) => {
            if (err) {
                console.dir(err)
                reject(err)
            } else {
                resolve()
            }
        })
    })
}

const generatorPackageJson = (params) => {
    const prefix = process.env.BKPAAS_ENVIRONMENT === 'prod' ? '' : 'test-'
    return `{
        "name": "${config.scopename}/${prefix}${params.name}",
        "version": "${params.version}",
        "description": "${params.description || 'LessCode custom component'}",
        "main":"index.umd.min.js",
        "author":"LessCode",
        "license":"MIT"
    }`
}

export const checkNpmSetting = () => {
    if (!config || !config.registry || !config.username) {
        throw new Error(global.i18n.t('请先确保{{n}}相关配置信息已正确填写', { n: 'lib/server/conf/npm.js' }))
    }
}

export const npmPublish = async (params) => {
    try {
        checkNpmSetting()
        const npmTempDir = path.resolve(__dirname, '../../npmTemp')
        // 生成npm临时目录
        await fse.ensureDir(npmTempDir)
        // 创建组件文件夹
        const componentPath = path.resolve(npmTempDir, params.componentDirName)

        // 自定义组件源码复制到npm目录下
        await fse.copySync(params.sourceDir, componentPath)
        await fse.outputFile(`${componentPath}/package.json`, generatorPackageJson(params))
        await npmLogin('npm', config.username, config.password, config.email)
        await publishNpmSource(componentPath)
        fse.remove(componentPath)
    } catch (error) {
        throw new Error(`npm: ${error.message}`)
    }
}
