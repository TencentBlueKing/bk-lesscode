/**
 * Tencent is pleased to support the open source community by making 蓝鲸智云PaaS平台社区版 (BlueKing PaaS Community Edition) available.
 * Copyright (C) 2017-2018 THL A29 Limited, a Tencent company. All rights reserved.
 * Licensed under the MIT License (the "License"); you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://opensource.org/licenses/MIT
 * Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on
 * an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the
 * specific language governing permissions and limitations under the License.
 */

const fs = require('fs')
const path = require('path')
const prettier = require('prettier')
const { CLIEngine, ESLint } = require('eslint')
const { ansiparse } = require('../util')
const eslintConfig = require('../system-conf/eslint-config')

const cli = new CLIEngine({
    fix: true,
    useEslintrc: true,
    allowInlineConfig: false,
    reportUnusedDisableDirectives: true,
    cwd: path.join(__dirname)
})

const ESLINT_TMP_FILE_PATH = 'eslint-fix-tmp.vue'

/**
 * 读取文件
 *
 * @param {String} filePath 文件路径，绝对路径
 */
async function read (curPath) {
    const ret = await fs.readFileSync(curPath, 'utf8')
    return ret
}

/**
 * 删除文件
 *
 * @param {String} filePath 文件路径，绝对路径
 */
const deleteFile = filePath => {
    if (!fs.existsSync(filePath)) {
        console.log('deleteFile 路径不存在')
        return
    }
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err, data) => {
            if (err) {
                reject(err)
            } else {
                resolve(data)
            }
        })
    })
}

async function createFile (filePath) {
    if (!fs.existsSync(filePath)) {
        await fs.writeFileSync(filePath, '', 'utf8')
    }
}

module.exports = {
    async formatCode (code) {
        try {
            let formatCode = prettier.format(code, {
                vueIndentScriptAndStyle: true,
                semi: false,
                parser: 'vue',
                tabWidth: 4,
                singleQuote: true,
                printWidth: 120,
                endOfLine: 'crlf'
            })
            // 正则替换两种格式的require为import
            formatCode = formatCode.replace(/const (.*) = require\((.*)\)/g, 'import $1 from $2')
            formatCode = formatCode.replace(/require\((.*)\)/g, 'import $1')
            // prettier format 的 jsxBracketSameLine 配置对 template 无效，因此手动替换
            formatCode = formatCode.replace(/\s*[\r\n|\n]\s*\>/g, '>')

            await createFile(path.join(__dirname, ESLINT_TMP_FILE_PATH))
            const report = cli.executeOnText(formatCode, ESLINT_TMP_FILE_PATH)
            CLIEngine.outputFixes(report)

            const ret = await read(path.join(__dirname, ESLINT_TMP_FILE_PATH))
            await deleteFile(path.join(__dirname, ESLINT_TMP_FILE_PATH))

            return ret || formatCode
        } catch (err) {
            console.log(err, 'format err')
            return err
        }
    },

    async formatPageCode (code) {
        return new Promise(async (resolve, reject) => {
            try {
                let formatCode = prettier.format(code, {
                    vueIndentScriptAndStyle: true,
                    semi: false,
                    parser: 'vue',
                    tabWidth: 4,
                    singleQuote: true,
                    printWidth: 120,
                    endOfLine: 'crlf'
                })
                // 正则替换两种格式的require为import
                formatCode = formatCode.replace(/const (.*) = require\((.*)\)/g, 'import $1 from $2')
                formatCode = formatCode.replace(/require\((.*)\)/g, 'import $1')
                // prettier format 的 jsxBracketSameLine 配置对 template 无效，因此手动替换
                formatCode = formatCode.replace(/\s*[\r\n|\n]\s*\>/g, '>')

                await createFile(path.join(__dirname, ESLINT_TMP_FILE_PATH))
                const report = cli.executeOnText(formatCode, ESLINT_TMP_FILE_PATH)
                CLIEngine.outputFixes(report)

                const ret = await read(path.join(__dirname, ESLINT_TMP_FILE_PATH))
                await deleteFile(path.join(__dirname, ESLINT_TMP_FILE_PATH))

                resolve(ret || formatCode)
            } catch (err) {
                console.log(err, 'format err')
                reject(new Error(global.i18n.t('代码格式化错误：{{n}}', { n: err })))
            }
        })
    },

    async formatJs (code) {
        try {
            const formatCode = prettier.format(code, {
                vueIndentScriptAndStyle: true,
                semi: false,
                parser: 'babel',
                tabWidth: 4,
                singleQuote: true,
                printWidth: 120,
                endOfLine: 'crlf'
            })
            await createFile(path.join(__dirname, ESLINT_TMP_FILE_PATH))
            const report = cli.executeOnText(formatCode, ESLINT_TMP_FILE_PATH)
            CLIEngine.outputFixes(report)

            const ret = await read(path.join(__dirname, ESLINT_TMP_FILE_PATH))
            await deleteFile(path.join(__dirname, ESLINT_TMP_FILE_PATH))

            return ret || formatCode
        } catch (err) {
            console.log(err, 'format err')
        }
    },

    async formatJsByEslint (code, path) {
        try {
            const options = {
                fix: true,
                overrideConfig: {
                    ...eslintConfig
                }
            }
            const eslint = new ESLint(options)
            // load code
            const results = await eslint.lintText(code)
            // 自动修正
            await ESLint.outputFixes(results)
            // formatter
            const formatter = await eslint.loadFormatter('stylish')
            let resultText = formatter.format(results)
            const errStrArr = ansiparse(resultText)
            if (errStrArr.length) resultText = `path: ${path}\n` + global.i18n.t('eslint检查不通过：\n{{n}}', { n: errStrArr.map((err) => (err.message)).join('') })
            return [resultText, results[0].output || code]
        } catch (err) {
            console.log(code, err, 'format err')
        }
    }
}
