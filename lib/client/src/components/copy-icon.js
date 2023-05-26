import { bkMessage } from 'bk-magic-vue'

function copyTxt (value) {
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.setAttribute('value', value)
    input.select()
    if (document.execCommand('copy')) {
        document.execCommand('copy')
        bkMessage({ theme: 'success', message: window.i18n.t('复制成功') })
    }
    document.body.removeChild(input)
}

export default {
    name: 'copy-icon',

    functional: true,

    props: ['value'],

    render (h, ctx) {
        const props = ctx.props || {}
        const value = props.value || ''
        const style = {
            cursor: 'pointer',
            fontSize: '14px',
            color: '#3a84ff',
            marginLeft: '5px'
        }
        return <i class="bk-drag-icon bk-drag-copy" style={ style } onClick={ () => copyTxt(value) }></i>
    }
}
