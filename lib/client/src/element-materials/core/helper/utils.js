export const toHyphenate = (str) => {
    return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

export const isFreeLayoutProperty = (type) => {
    return ['free-layout', 'h5-page'].includes(type)
}
