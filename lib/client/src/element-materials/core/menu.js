import Vue from 'vue'
import Menu from './widget/menu'
let instance = null

export const showMenu = (event) => {
    event.preventDefault()
    clearMenu()
    if (event && event.type === 'contextmenu') {
        instance = new Vue({
            render (h) {
                return (
                    <Menu
                        left={event.pageX}
                        top={event.pageY} />
                )
            }
        }).$mount()
        document.body.appendChild(instance.$el)
    }
}

export const clearMenu = () => {
    if (instance) {
        document.body.removeChild(instance.$el)
        instance.$destroy()
        instance = null
    }
}
