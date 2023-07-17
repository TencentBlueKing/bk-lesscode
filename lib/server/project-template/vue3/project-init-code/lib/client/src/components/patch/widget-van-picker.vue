<template>
    <div>
        <van-cell :title="label" :value="syncValue" @click="show = true" />
        <van-popup v-model="show" round position="bottom">
            <component
                v-bind="allProps"
                :is="componentType"
                @update:modelValue="pickerModelHandle"
                @cancel="cancelHandle"
                @confirm="confirmHandle"
                @change="changeHandle"></component>
            />
        </van-popup>
    </div>
</template>

<script>
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
                    ? this.value.join('-')
                    : this.getPickerCellDisplay(this.value)
            },
            syncValue: {
                get () {
                    return this.value
                },
                set (value) {
                    this.$emit('update:modelValue', value)
                }
            },
            allProps () {
                return Object.assign({}, this.$props, this.$attrs, { modelValue: new Date(this.syncValue) })
            }
        },
        methods: {
            getPickerCellDisplay (value) {
                const nameMap = value.map(item => {
                    const option = this.allProps.columns.find(option => option.value === item)
                    return option.text
                })
                return nameMap.join(' ')
            },
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
                this.syncValue = value.selectedValues
                this.closeDatePicker()
                this.$emit('confirm')
            },
            cancelHandle () {
                this.closeDatePicker()
                this.$emit('cancel')
            }
        }
    }
</script>
