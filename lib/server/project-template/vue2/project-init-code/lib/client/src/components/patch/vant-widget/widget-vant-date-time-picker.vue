<template>
    <div>
        <van-cell :title="label" :value="syncValue" @click="show = true" />
        <van-popup v-model="show" round position="bottom">
            <van-datetime-picker
                :value="syncValue"
                :type="type"
                :title="dateTitle"
                :min-date="minDate"
                :max-date="maxDate"
                :show-toolbar="showToolbar"
                :readonly="readonly"
                :item-height="itemHeight"
                :columns-order="columnsOrder"
                :visible-item-count="visibleItemCount"
                :swipe-duration="swipeDuration"
                @cancel="cancelHandle"
                @confirm="confirmHandle"
                @change="changeHandle"
            />
        </van-popup>
    </div>
</template>

<script>
    import moment from 'moment'
    export default {
        name: 'widget-van-date-time-picker',
        props: {
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
            value: String
        },
        data () {
            return {
                date: moment(new Date()).format('yyyy-MM-DD hh:mm:ss'),
                show: false
            }
        },
        computed: {
            syncValue: {
                get () {
                    return this.value
                },
                set (value) {
                    this.$emit('update:value', value)
                }
            }
        },
        methods: {
            closeDatePicker () {
                this.show = false
            },
            changeHandle (pickerInstance) {
                this.$emit('change', pickerInstance)
            },
            confirmHandle (time) {
                this.closeDatePicker()
                this.syncValue = moment(time).format('yyyy-MM-DD hh:mm:ss')
                this.$emit('confirm')
            },
            cancelHandle () {
                this.closeDatePicker()
                this.$emit('cancel')
            }
        }
    }
</script>
