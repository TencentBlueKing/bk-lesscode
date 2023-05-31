export default {
    props: {
        value: Object,
        type: Number,
        valueType: Number
    },

    computed: {
        list () {
            let list = [{ key: 'all', txt: this.$t('所有环境') }]
            if (this.type === 1) {
                list = [
                    { key: 'prod', txt: this.$t('正式环境') },
                    { key: 'stag', txt: this.$t('预发布环境') }
                ]
            }
            return list
        }
    },

    methods: {
        change (key, value) {
            const copyVaule = JSON.parse(JSON.stringify(this.value))
            copyVaule[key] = value
            this.$emit('update:value', copyVaule)
        }
    }
}
