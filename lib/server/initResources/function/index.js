import {
    handleFunctionIntoDb
} from '../../service/business/function.js'
import { LCDataService, TABLE_FILE_NAME } from '../../service/common/data-service'

const fs = require('fs')
const path = require('path')

export const initFunc = async (funcData = {}) => {
    const { importList } = funcData
    console.log('initFunc')
    const { list: dbFuncList = [] } = await LCDataService.get({
        tableFileName: TABLE_FILE_NAME.FUNC_MARKET,
        query: {
            deleteFlag: 0
        }
    })
    const funcNameList = dbFuncList.map(item => item.funcName) || []
    try {
        if (importList.length) {
            const funcStr = fs.readFileSync(path.resolve(__dirname, `./resources/${importList[0]}`), 'utf8')
            let funcList = JSON.parse(funcStr) || []
            funcList = funcList.filter(func => funcNameList.indexOf(func?.funcName) === -1)
            // 入库
            return LCDataService.bulkAdd(
                TABLE_FILE_NAME.FUNC_MARKET,
                handleFunctionIntoDb(funcList)
            )
        }
    } catch (err) {
        console.log(err, 'initFuncErr')
    }
}
