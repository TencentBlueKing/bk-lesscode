<template>
    <div class="bk-lucky-canvas" @click="$emit('click')"></div>
</template>

<script>
    import { LuckyWheel } from 'lucky-canvas'

    export default {
        name: 'bk-lucky-canvas',
        props: {
            type: {
                type: String,
                default: 'LuckyWheel'
            },
            size: {
                type: Number,
                default: 200
            },
            width: {
                type: [Number, String],
                default: 200
            },
            height: {
                type: [Number, String],
                default: 200
            },
            blocks: {
                type: Array,
                default: () => [{ padding: '13px', background: '#617df2' }]
            },
            duration: {
                type: Number,
                default: 3000
            },
            accelerationTime: {
                type: Number,
                default: 2500
            },
            decelerationTime: {
                type: Number,
                default: 2500
            },
            prizes: {
                type: Array,
                default: () => [
                    { fonts: [{ text: '0', top: '10%' }], background: '#ffe8e9' },
                    { fonts: [{ text: '1', top: '10%' }], background: '#ffffff' },
                    { fonts: [{ text: '2', top: '10%' }], background: '#ffe8e9' },
                    { fonts: [{ text: '3', top: '10%' }], background: '#ffffff' },
                    { fonts: [{ text: '4', top: '10%' }], background: '#ffe8e9' },
                    { fonts: [{ text: '5', top: '10%' }], background: '#ffffff' }
                ]
            },
            buttons: {
                type: Array,
                default: () => [{
                    radius: '35%',
                    background: '#8a9bf3',
                    pointer: true,
                    fonts: [{ text: '开始', top: '-10px' }]
                }]
            }
        },
        data () {
            return {
                chartMap: {
                    'LuckyWheel': LuckyWheel
                },
                chartInstance: null
            }
        },
        computed: {
            chartOptions () {
                return {
                    width: this.size,
                    height: this.size,
                    blocks: this.blocks,
                    prizes: this.prizes,
                    buttons: this.buttons,
                    defaultConfig: {
                        stopRange: 0.8,
                        accelerationTime: this.accelerationTime,
                        decelerationTime: this.decelerationTime
                    },
                    end: this.end,
                    start: () => {
                        const probabilities = this.prizes.map(item => item.probability)
                        const target = this.drawLottery(probabilities)
                        this.chartInstance.play()
                        setTimeout(() => {
                            this.chartInstance.stop(target)
                        }, this.duration)
                    }
                }
            }
        },
        watch: {
            height (val) {
                this.chartInstance.height = val
            },
            width (val) {
                this.chartInstance.width = val
            },
            size (val) {
                this.chartInstance.height = val
                this.chartInstance.width = val
            },
            blocks (val) {
                this.chartInstance.blocks = val
            },
            prizes (val) {
                this.chartInstance.prizes = val
            },
            buttons (val) {
                this.chartInstance.buttons = val
            }
        },
        mounted () {
            this.$nextTick(() => {
                this.chartInstance = new this.chartMap[this.type](this.$el, this.chartOptions)
                this.chartInstance.init()
            })
        },
        methods: {
            init () {
                this.chartInstance.init()
            },
            play () {
                this.chartInstance.play()
            },
            stop (index) {
                this.chartInstance.stop(index)
            },
            drawLottery (probabilities) {
                let normalizedProbabilities
                // 过滤出有效的概率值（剔除null、undefined和非数字类型）
                const validProbabilities = probabilities.filter(p => typeof p === 'number' && !isNaN(p))

                // 如果存在无效概率或者未提供概率，或有效概率数小于奖品数
                // 则将每个奖项的中奖概率设置为相等
                if (validProbabilities.length !== probabilities.length) {
                    normalizedProbabilities = new Array(probabilities.length).fill(100 / probabilities.length)
                } else {
                    // 计算概率的总和
                    const total = validProbabilities.reduce((acc, p) => acc + p, 0)

                    // 归一化概率（使得它们的和为100）
                    normalizedProbabilities = validProbabilities.map(p => (p / total) * 100)
                }

                // 生成一个0-100%之间的随机数
                const rand = Math.random() * 100
                let sum = 0

                // 遍历归一化后的概率数组，确定中奖范围
                for (let i = 0; i < normalizedProbabilities.length; i++) {
                    // 累加概率，以确定当前随机数是否落在这个范围内
                    sum += normalizedProbabilities[i]
                    // 如果落在当前概率的范围内，则返回该奖品的索引
                    if (rand < sum) {
                        return i
                    }
                }

                // 理论上不应该到达这里，因为上面的代码已经覆盖了所有可能性
                throw new Error('中奖逻辑有误，请检查概率数组')
            }
        }
    }
</script>
