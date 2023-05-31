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
                type: Number,
                default: 0
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
        watch: {
            value (newValue, oldValue) {
                this.defaultValue = parseInt(newValue || 0)
            }
        },

        methods: {
            chooseRate (val) {
                this.$emit('change', val)
            }
        }
    }
</script>
