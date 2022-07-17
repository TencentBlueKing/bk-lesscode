import getRoot from './get-root'

const search = function (nodes, type, target = []) {
    if (nodes.length === 0) return target
    nodes.forEach(node => {
        if (node.type === type) {
            target.push(node)
        }
        return node.children.length && search(node.children, type, target)
    })
    return target
}

export default function (type) {
    return search(getRoot().children, type, [])
}
