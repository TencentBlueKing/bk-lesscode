import LC from '@/element-materials/core'

export default function () {
    return (event) => {
        event.stopPropagation()
        LC.showMenu(event)
    }
}
