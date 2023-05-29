const path = require('path')
const nodemon = require('nodemon')
const chalk = require('chalk')
const { runDev } = require('@blueking/cli-service-webpack')

const backendDir = path.resolve(__dirname, '../lib/server')
const sharedDir = path.resolve(__dirname, '../lib/shared')
const ignore = [
    path.resolve(__dirname, '../lib/server/project-template'),
    path.resolve(__dirname, '../lib/server/npmTemp'),
    path.resolve(__dirname, '../lib/server/downloadTemp'),
    path.resolve(__dirname, '../lib/server/temp'),
    path.resolve(__dirname, '../lib/server/upload')
]

function startServer () {
    nodemon({
        script: path.resolve(backendDir, 'app.browser.js'),
        watch: [
            backendDir,
            sharedDir
        ],
        nodeArgs: [
            '--inspect'
        ],
        ext: 'js',
        ignore
    })
        .once('start', () => {
            runDev()
        })
        .on('quit', () => {
            console.log('\n', chalk.yellow('API server has quit'), '\n')
            process.exit()
        })
        .on('crash', () => {
            console.log('\n', chalk.red('API server crashed'), '\n')
        })
        .on('restart', () => {
            console.log('\n', chalk.yellow('API server restarted'), '\n')
        })
}

startServer()
