import { getOffset } from '@/common/util'

export default {
    data () {
        return {
            centerRenderStyle: {}
        }
    },
    mounted () {
        this.calcRenderStyles()
    },
    methods: {
        calcRenderStyles () {
            const {
                top
            } = getOffset(this.$refs.root)
            
            const {
                width
            } = this.$refs.root.getBoundingClientRect()
            
            this.centerRenderStyle = {
                width: `${width}px`,
                'min-height': `calc(100vh - ${top + 25}px)`
            }
        }
    }
}
