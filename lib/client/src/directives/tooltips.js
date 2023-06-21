const showOverflowHiddenText = (el, value, that) => {
    el.mouseMoveHandler = function () {
        if (el.offsetWidth < el.scrollWidth) {
            el.instance = that.$bkPopover(el, { content: value, arrow: true, placement: 'top', flip: false, distance: 8, maxWidth: 400, duration: [100, 200], size: 'small' })
            el.instance?.show(500)
        }
    }
    el.mouseLeaveHandler = function () {
        if (el.instance) {
            el.instance.destroy(true)
        }
    }
    el.addEventListener('mouseenter', el.mouseMoveHandler)
    el.addEventListener('mouseleave', el.mouseLeaveHandler)
}
const destroy = function (el) {
    el.removeEventListener('mouseenter', el.mouseMoveHandler)
    el.removeEventListener('mouseleave', el.mouseLeaveHandler)
}

export default {
    install (Vue) {
        Vue.directive('tooltips', {
            bind (el, binding, vnode) {
                const that = vnode.context
                showOverflowHiddenText(el, binding.value ? binding.value : '', that)
            },
            update (el, binding, vnode) {
                destroy(el)
                const that = vnode.context
                showOverflowHiddenText(el, binding.value ? binding.value : '', that)
            },
            unbind (el) {
                destroy(el)
            }
        })
    }
}
