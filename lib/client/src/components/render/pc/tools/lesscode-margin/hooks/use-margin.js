import {
    reactive,
    toRefs,
    getCurrentInstance,
    onMounted,
    onBeforeUnmount
} from '@vue/composition-api'
import _ from 'lodash'
import DragLine from '../../../../common/drag-line'
import { autoStyle, autoPxTransform } from '@/common/util.js'

const hideStyles = {
    display: 'none'
}

export default function () {
    const { proxy } = getCurrentInstance()

    let isMarginTopResizeable = false
    let isMarginLeftResizeable = false
    let startClientX = 0
    let startClientY = 0
    let moveStartMarginTop = 0
    let moveStartMarginLeft = 0
            
    const state = reactive({
        margin: {
            top: 0,
            left: 0
        },
        tipTopStyles: hideStyles,
        tipLeftStyles: hideStyles
    })

    let dragLine = null

    const calcPosition = (event) => {
        let newMarginLeft = 0
        let newMarginTop = 0
        const { clientX, clientY } = event
        
        if (isMarginTopResizeable) {
            newMarginTop = parseInt(clientY - startClientY + moveStartMarginTop, 10)
            autoStyle(proxy.activeComponentData, 'marginTop', newMarginTop)
            state.tipTopStyles = {
                height: `${newMarginTop}px`,
                zIndex: 99
            }
        }
        if (isMarginLeftResizeable) {
            newMarginLeft = parseInt(clientX - startClientX + moveStartMarginLeft, 10)
            autoStyle(proxy.activeComponentData, 'marginLeft', newMarginLeft)
            state.tipLeftStyles = {
                width: `${newMarginLeft}px`,
                zIndex: 99
            }
        }

        state.margin = {
            top: newMarginTop,
            left: newMarginLeft
        }
    }

    /**
     * @desc 设置宽度
     * @param { Event } event
     */
    const handleMarginTop = (event) => {
        isMarginTopResizeable = true
        startClientY = event.clientY
        
        document.body.style.userSelect = 'none'
        moveStartMarginTop = parseInt(autoPxTransform(proxy.activeComponentData.style['margin-top']), 10) || 0
        if (!dragLine) {
            dragLine = new DragLine({
                container: proxy.activeComponentData.parentNode.$elm
            })
        }
        calcPosition(event)
    }
    /**
     * @desc 设置高度
     * @param { Event } event
     */
    const handleMarginLeft = (event) => {
        isMarginLeftResizeable = true
        startClientX = event.clientX
        document.body.style.userSelect = 'none'
        moveStartMarginLeft = moveStartMarginTop = parseInt(autoPxTransform(proxy.activeComponentData.style['margin-left']), 10) || 0

        if (!dragLine) {
            dragLine = new DragLine({
                container: proxy.activeComponentData.parentNode.$elm
            })
        }
        calcPosition(event)
    }
    /**
     * @desc 同时设置高度、宽度
     * @param { Event } event
     */
    const handleResizeBoth = (event) => {
        handleMarginTop(event)
        handleMarginLeft(event)
        calcPosition(event)
    }
    
    /**
     * @desc mousemove 事件，动态更新容器宽度
     * @param {Object} event
     */
    const handleMousemove = _.throttle((event) => {
        if (!isMarginTopResizeable && !isMarginLeftResizeable) {
            return
        }
        dragLine.check(proxy.activeComponentData.$elm, '[role="component-root"]')
        calcPosition(event)
    }, 30)

    /**
     * @desc 放开鼠标取消拖动状态
     */
    const handleMouseup = () => {
        isMarginLeftResizeable = false
        isMarginTopResizeable = false
        document.body.style.userSelect = ''
        state.tipLeftStyles = hideStyles
        state.tipTopStyles = hideStyles
        if (dragLine) {
            dragLine.uncheck()
            dragLine = null
        }
    }

    onMounted(() => {
        document.body.addEventListener('mousemove', handleMousemove)
        document.body.addEventListener('mouseup', handleMouseup)
    })

    onBeforeUnmount(() => {
        document.body.removeEventListener('mousemove', handleMousemove)
        document.body.removeEventListener('mouseup', handleMouseup)
    })

    return {
        ...toRefs(state),
        handleMarginTop,
        handleMarginLeft,
        handleResizeBoth
    }
}
