<template>
    <div>
        <van-cell :title="label" :value="syncValue" @click="show = true" />
        <van-popup v-model="show" round position="bottom">
            <component
                v-bind="allProps"
                :is="componentType"
                @input="pickerModelHandle"
                @cancel="cancelHandle"
                @confirm="confirmHandle"
                @change="changeHandle"></component>
            />
        </van-popup>
    </div>
</template>

<script>
    import moment from 'moment'
    export default {
        name: 'widget-van-picker',
        props: {
            componentType: String,
            label: String,
            type: String,
            dateTitle: String,
            confirmButtonText: String,
            cancelButtonText: String,
            showToolbar: Boolean,
            readonly: Boolean,
            itemHeight: [Number, String],
            columnsOrder: Array,
            visibleItemCount: [Number, String],
            swipeDuration: [Number, String],
            minDate: Date,
            maxDate: Date,
            format: String,
            value: String
        },
        data () {
            return {
                show: false
            }
        },
        computed: {
            displayValue () {
                return this.componentType === 'van-datetime-picker'
                    ? moment(this.syncValue).format(this.format)
                    : this.syncValue
            },
            syncValue: {
                get () {
                    return this.value
                },
                set (value) {
                    this.$emit('input', value)
                }
            },
            allProps () {
                return Object.assign({}, this.$props, this.$attrs, { value: new Date(this.syncValue) })
            }
        },
        methods: {
            pickerModelHandle (val) {
                this.syncValue = val
            },
            closeDatePicker () {
                this.show = false
            },
            changeHandle (value) {
                this.$emit('change', value)
            },
            confirmHandle (value) {
                this.closeDatePicker()
                this.syncValue = this.componentType === 'van-datetime-picker'
                    ? moment(value).format(this.format)
                    : value
                this.$emit('confirm')
            },
            cancelHandle () {
                this.closeDatePicker()
                this.$emit('cancel')
            }
        }
    }
</script>
