export const baseChartConfig = () => {
    return {
        width: {
            type: [Number, String],
            default: ''
        },
        height: {
            type: [Number, String],
            default: ''
        },
        type: {
            type: String,
            default: 'line'
        },
        title: {
            type: String,
            default: ''
        },
        'title-x': {
            type: String,
            default: 'center'
        },
        'legend-orient': {
            type: String,
            default: 'horizontal'
        },
        'legend-left': {
            type: String,
            default: 'left'
        },
        color: {
            type: String,
            default: 'default'
        },
        series: {
            type: Array,
            default: () => []
        },
        options: {
            type: Object,
            default: () => ({})
        }
    }
}
