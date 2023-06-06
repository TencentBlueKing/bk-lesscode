<template>
    <div :class="distance">
        <span class="distance-number" :class="value ? 'set' : 'unset'" @click="handleIsInput" v-show="!isInput">{{ value ? (value + unit) : 0 }}</span>
        <div v-show="isInput" class="distance-item-edit">
            <bk-input
                v-model="renderValue"
                type="number"
                ref="inputDom"
                style="width: 72px"
                placeholder=" "
                size="small"
                class="distance-input"
                @enter="handleEnterChange"
                @input="handleChange"
                @blur="handleIsBlur">
            </bk-input>
            <div class="position-input-suffix" @mousedown="handleBlockDefault">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'distance-item',
        components: {},
        props: {
            distance: {
                type: String,
                default: ''
            },
            value: {
                type: [Number, String],
                default: 0
            },
            unit: {
                type: String
            }
        },
        data () {
            return {
                renderValue: this.value,
                isInput: false
            }
        },
        watch: {
            value (val) {
                this.renderValue = val
            }
        },
        methods: {
            handleEnterChange (val) {
                this.isInput = false
                this.handleChange(val)
            },
            handleChange (val) {
                this.$emit('change', val)
            },
            handleIsInput  () {
                this.isInput = true
                this.$nextTick(() => {
                    this.$refs.inputDom.focus()
                })
            },
            handleIsBlur () {
                this.isInput = false
            },
            handleBlockDefault (event) {
                event.preventDefault()
            }
        }
    }
</script>

<style lang="postcss">
    .distance-item-edit {
        /* z-index: 100; */
        border-color: #3A84FF !important;
        display: flex;
        align-items: center;
        border: 1px solid #C4C6CC;
        border-radius: 2px;
        width: 96px;
        height: 24px;
        background-color: #FFFFFF;
        padding-right: 4px;
        .input-number-option {
            display: none;
        }
    }
    
    .distance-number {
        width: 96px;
        font-size: 12px;
        border-radius: 2px;
        height: 24px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        &:hover {
            background-color: #EAEBEF;
        }
    }
    .distance-number.set {
        color: #63656E
    }
    .distance-number.unset {
        color: #C4C6CC;
    }

    .distance-top {
        position: absolute;
        top: 0;
        left: 50%;
        transform: translate(-50%);
        padding: 3px 0;
        .distance-number {
            width: 96px;
            line-height: 24px;
        }
    }

    .distance-right {
        position: absolute;
        right: 0;
        top: 50%;
        transform: translate(0, -50%);
        .distance-input {
            width: 52px;
        }
        .distance-item-edit {
            width: 76px;
        }
        .distance-number {
            margin-right: 2px;
            width: 42px;
            display: float;
            float: right;
        }

    }

    .distance-bottom {
        position: absolute;
        bottom: 0;
        left: 50%;
        transform: translate(-50%);
        padding: 3px 0;
        .distance-number {
            width: 96px;
            line-height: 24px;
        }

    }

    .distance-left {
        position: absolute;
        left: 0;
        top: 50%;
        transform: translate(0, -50%);
        .distance-input {
            width: 52px;
        }
        .distance-item-edit {
            width: 76px;
        }
        .distance-number {
            width: 42px;
            display: float;
            float: left;
        }
    }
</style>
