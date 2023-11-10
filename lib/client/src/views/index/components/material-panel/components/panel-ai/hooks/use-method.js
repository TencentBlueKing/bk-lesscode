import store from '@/store'
import {
    getDefaultFunction
} from 'shared/function'

export default (cmdMessage) => {
    const handleCreateOrUpdateFunction = async (funcName, funcBody) => {
        if (!funcName || !funcBody) {
            cmdMessage.value += [
                '',
                '# cmd',
                'Create or update function fail. The funcName or funcBody is empty. please rethink and issue commands'
            ].join('\n')
            return
        }
        let functionItem = store.getters['functions/functionList'].find(item => item.funcCode === funcName)
    
        if (functionItem) {
            // 更新函数
            functionItem.funcBody = funcBody
            const code = await store.dispatch('functions/fixFunByEslint', functionItem)
            await store.dispatch('functions/editFunction', {
                ...functionItem,
                funcBody: code || funcBody
            })
        } else {
            // 生成函数
            functionItem = store.getters['functions/functionList'][0]
            const functionData = getDefaultFunction({
                funcName,
                funcCode: funcName,
                funcBody,
                projectId: functionItem.projectId,
                funcGroupId: functionItem.funcGroupId
            })
            const code = await store.dispatch('functions/fixFunByEslint', functionData)
            await store.dispatch('functions/createFunction', {
                ...functionData,
                funcBody: code || funcBody
            })
        }

        // 更新函数列表
        return store.dispatch('functions/getAllGroupAndFunction', {
            projectId: functionItem.projectId,
            versionId: functionItem.versionId
        }).then((functionData) => {
            store.commit('functions/setFunctionData', functionData)
            cmdMessage.value += [
                '',
                '# cmd',
                'Successfully create or update function.',
                'Have you finished the task? If so, call `done()`. Otherwise please continue.'
            ].join('\n')
        })
    }
    const handleGetFunctions = () => {
        const functionList = store.getters['functions/functionList']
        cmdMessage.value += [
            '',
            '# cmd',
            'You can use these functions:',
            ...functionList.map(item => `- ${item.funcName} (${item.funcCode})`)
        ].join('\n')
    }

    return {
        handleCreateOrUpdateFunction,
        handleGetFunctions
    }
}
