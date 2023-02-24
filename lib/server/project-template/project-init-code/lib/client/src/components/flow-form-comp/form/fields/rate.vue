<template>
    <div>
        <bk-rate :rate.sync="defaultValue" :edit="!disabled" @score="chooseRate"></bk-rate>
    </div>
</template>

<script>
    export default {
        name: 'Rate',
        props: {
            value: {
                type: [Number, String],
                default: '{}'
            },
            disabled: {
                type: Boolean,
                default: true
            },
            field: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                defaultValue: parseInt(this.value || 0)
            }
        },
        computed: {},
        watch: {
            value (newValue, oldValue) {
                this.defaultValue = parseInt(newValue || 0)
            }
        },
        mounted () {
        
        },

        methods: {
            chooseRate (val) {
                this.$emit('change', val)
            }
        }
    }
</script>

<style lang="scss" scoped>

</style>
