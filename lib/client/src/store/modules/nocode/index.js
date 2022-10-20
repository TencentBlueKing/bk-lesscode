import form from './form.js'
import flow from './flow.js'
import formSetting from './form-setting'
import dataManage from './data-manage'
import nodeConfig from './node-config'

import markdown from './markdown'

export default {
    namespaced: true,
    modules: {
        form,
        flow,
        formSetting,
        dataManage,
        nodeConfig,
        markdown
    }
}
