<template>
    <div :class="distance">
        <span class="distance-number" :class="value ? 'set' : 'unset'" @click="handlerIsInput" v-if="!isInput">{{ value ? (value + unit) : 0 }}</span>
        <div v-else class="item-focus">
            <bk-input ref="inputDom" style="width: 36px" :placeholder="' '" size="small" class="distance-input" @blur="handlerIsBlur">
            </bk-input>
            <div class="position-input-suffix" @mousedown="handlerBlockDefault">
                <slot></slot>
            </div>
        </div>
    </div>
</template>
<script>
    export default {
        name: 'position-distance',
        components: {},
        props: {
            distance: {
                type: String,
                default: ''
            },
            value: {
                type: String,
                default: ''
            },
            unit: {
                type: String
            }
        },
        data () {
            return {
                isInput: false
            }
        },
        methods: {
            handlerIsInput  () {
                this.isInput = true
                this.$nextTick(() => {
                    this.$refs.inputDom.focus()
                })
            },
            handlerIsBlur () {
                this.isInput = false
            },
            handlerBlockDefault (event) {
                event.preventDefault()
            }
        }
    }
</script>

<style lang="postcss">
.item-focus {
    border-color: #3A84FF !important;
    display: flex;
    align-items: center;
    border: 1px solid #C4C6CC;
    border-radius: 2px;
    height: 24px;
    background-color: #FFFFFF;
    padding-right: 4px;
}
.set {
    color: #63656E
}
.unset {
    color: #C4C6CC;
}
.distance-top {
    position: absolute;
    top: 0;
    left: 50%;
    transform: translate(-50%);
    padding: 3px 0;
    .distance-number {
        display: inline-block;
        width: 70px;
        text-align: center;
        line-height: 24px;
        background-color: #EAEBEF;
        border-radius: 2px;
    }

}

.distance-right {
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(0, -50%);

    .distance-number {
        margin-right: 2px;
        width: 36px;
        display: float;
        text-align: center;
        float: right;
        background-color: #EAEBEF;
        border-radius: 2px;
    }

}

.distance-bottom {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translate(-50%);
    padding: 3px 0;
    .distance-number {
        display: inline-block;
        width: 70px;
        text-align: center;
        line-height: 24px;
        background-color: #EAEBEF;
        border-radius: 2px;
    }

}

.distance-left {
    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(0, -50%);
    .distance-number {
        width: 36px;
        display: float;
        text-align: center;
        float: left;
        background-color: #EAEBEF;
        border-radius: 2px;
        margin-left: 2px;
    }
}
</style>
