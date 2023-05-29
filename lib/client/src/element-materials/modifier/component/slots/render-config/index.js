import bkVue2RenderMap from './vue2/bk'
import elementVue2RenderMap from './vue2/element'
import vantVue2RenderMap from './vue2/vant'
import bkVue3RenderMap from './vue3/bk'
import vantVue3RenderMap from './vue3/vant'

const html2Escape = (html = '') => {
    return html.replace(/[<>&"]/g, (c) => {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[c]
    })
}

const baseRenderMap = {
    'html' ({ val, type }) {
        let res = ''
        switch (type) {
            case 'value':
                res = val
                break
            case 'variable':
                res = `<render-html :html="${val}" ></render-html>`
                break
        }
        return res
    },
    'text' ({ val, type }) {
        let res = ''
        switch (type) {
            case 'value':
                res = html2Escape(val)
                break
            case 'variable':
                res = `{{${val}}}`
                break
        }
        return res
    }
}

export const vue2RenderMap = {
    ...bkVue2RenderMap,
    ...elementVue2RenderMap,
    ...vantVue2RenderMap,
    ...baseRenderMap
}

export const vue3RenderMap = {
    ...bkVue3RenderMap,
    ...vantVue3RenderMap,
    ...baseRenderMap
}

export const getRenderMap = (framework) => {
    if (framework === 'vue2') {
        return vue2RenderMap
    }
    return vue3RenderMap
}
