
/** 不同的图表，有不同的配置生成规则，规则基于baseOption生成 */
export const chartsConfigMap = {
    line: (props, baseOption, colorList) => {
        baseOption.data.datasets = props.data.map((data, index) => ({
            data: data.data,
            borderColor: colorList[index],
            backgroundColor: props.fillColor ? props.fillColor : `${colorList[index]}51`,
            label: data.title,
            fill: props.fill,
            tension: props.tension,
            stepped: props.stepped
        }))
        
        return baseOption
    },
    bar: (props, baseOption, colorList) => {
        const colorOpacity = props.colorOpacity > 255 ? 255 : props.colorOpacity
        const opacity0x = props.colorOpacity < 16 ? `0${colorOpacity.toString(16)}` : colorOpacity.toString(16)
        baseOption.data.datasets = props.data.map((data, index) => ({
            data: data.data,
            borderColor: colorList[index],
            backgroundColor: `${colorList[index]}${opacity0x}`,
            label: data.title,
            borderWidth: props.borderWidth
        }))
        return baseOption
    },
    pie: (props, baseOption, colorList) => {
        baseOption.data.datasets = [
            {
                data: props.data.map(item => item.y),
                backgroundColor: props.data.map((item, index) => colorList[index % colorList.length]),
                hoverOffset: props.hoverOffset,
                borderWidth: props.borderWidth,
                borderColor: props.borderColor
            }
        ]
        baseOption.data.labels = props.data.map(item => item.x)
        return baseOption
    },
    bubble: (props, baseOption, colorList) => {
        const colorOpacity = props.colorOpacity > 255 ? 255 : props.colorOpacity
        const opacity0x = props.colorOpacity < 16 ? `0${colorOpacity.toString(16)}` : colorOpacity.toString(16)
        baseOption.data.datasets = props.data.map((data, index) => ({
            data: data.data,
            borderColor: colorList[index],
            backgroundColor: `${colorList[index]}${opacity0x}`,
            label: data.title,
            borderWidth: props.borderWidth
        }))
        return baseOption
    },
    radar: (props, baseOption, colorList) => {
        const colorOpacity = props.colorOpacity > 255 ? 255 : props.colorOpacity
        const opacity0x = props.colorOpacity < 16 ? `0${colorOpacity.toString(16)}` : colorOpacity.toString(16)
        baseOption.data.datasets = props.data.map((data, index) => ({
            data: data.data.map(item => item.y),
            borderColor: colorList[index],
            backgroundColor: `${colorList[index]}${opacity0x}`,
            pointBackgroundColor: colorList[index],
            pointHoverBorderColor: colorList[index],
            label: data.title,
            fill: props.fill
        }))
        baseOption.data.labels = props.data[0].data.map(item => item.x)
        return baseOption
    },
    scatter: (props, baseOption, colorList) => {
        const colorOpacity = props.colorOpacity > 255 ? 255 : props.colorOpacity
        const opacity0x = props.colorOpacity < 16 ? `0${colorOpacity.toString(16)}` : colorOpacity.toString(16)
        baseOption.data.datasets = props.data.map((data, index) => ({
            data: data.data,
            borderColor: colorList[index],
            backgroundColor: `${colorList[index]}${opacity0x}`,
            borderWidth: props.borderWidth,
            label: data.title,
            pointRadius: props.pointRadius
        }))

        baseOption.options.scales = {
            x: {
                type: 'linear',
                position: 'bottom'
            }
        }
        return baseOption
    }
}

/** bk-charts 通用Props */
export function bkChartProps () {
    return {
        width: {
            type: [Number, String],
            default: ''
        },
        type: {
            type: String,
            default: 'line'
        },
        height: {
            type: [Number, String],
            default: ''
        },
        colorSet: {
            type: String,
            default: 'default'
        },
        data: {
            type: Array,
            default: () => []
        },
        title: {
            type: String,
            default: ''
        },
        fill: {
            type: Boolean,
            default: false
        },
        fillColor: {
            type: String,
            default: ''
        },
        tension: {
            type: [Number, String],
            default: 0
        },
        stepped: {
            type: Boolean,
            default: false
        },
        options: {
            type: Object,
            default: () => ({})
        },
        maintainAspectRatio: {
            type: Boolean,
            default: true
        },
        colorOpacity: {
            type: Number,
            default: 0
        },
        borderWidth: {
            type: [Number, String],
            default: 0
        },
        borderColor: {
            type: String,
            default: '#fff'
        },
        hoverOffset: {
            type: Number,
            default: 4
        },
        pointRadius: {
            type: Number,
            default: 3
        }
    }
}
