// 处理预览时候的样式
export const handleStyle = (framework) => {
    require('mavon-editor/dist/css/index.css')
    if (framework === 'vue3') {
        require('../../../server/project-template/vue3/project-init-code/lib/client/src/css/app.css')
        require('../../../server/project-template/vue3/project-init-code/lib/client/src/css/reset.css')
        require('bk-lesscode-render/dist/index.css')
    } else {
        require('../../../server/project-template/vue2/project-init-code/lib/client/src/css/app.css')
        require('../../../server/project-template/vue2/project-init-code/lib/client/src/css/reset.css')
    }
}
