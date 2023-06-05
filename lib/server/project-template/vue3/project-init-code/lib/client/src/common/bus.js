// Use a bus for components communication
const eventHandlersMap = {}

export const bus = {
    $on (name, handler) {
        if (!eventHandlersMap[name]) {
            eventHandlersMap[name] = []
        }
        eventHandlersMap[name].push(handler)
    },
    $off (name, handler) {
        const eventHandlers = eventHandlersMap[name]
        if (eventHandlers) {
            const index = eventHandlers.find(event => event === handler)
            if (index >= 0) {
                eventHandlers.splice(index, 1)
            }
        }
    },
    $emit (name, args) {
        const eventHandlers = eventHandlersMap[name]
        eventHandlers.forEach((eventHandler) => {
            eventHandler(args)
        })
    }
}
