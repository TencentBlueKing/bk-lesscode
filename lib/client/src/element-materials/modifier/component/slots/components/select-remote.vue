<template>
    <section>
        <remote
            v-bind="$attrs"
            :payload="methodPayload"
            :default-value="copySlotVal.val"
            :remote-validate="slotConfig.remoteValidate"
            :change="remoteChange"
            :describe="slotConfig"
            :is-loading.sync="isLoading"
        />
        <select-key
            :params="methodPayload.keys"
            :options="optionList"
            :is-loading="isLoading"
            @change="changeParams"
        />
    </section>
</template>

<script>
    import Remote from '@/element-materials/modifier/component/props/components/strategy/remote'
    import safeStringify from '@/common/json-safe-stringify'
    import SelectKey from './common/select-key.vue'

    export default {
        components: {
            Remote,
            SelectKey
        },

        props: {
            slotVal: {
                type: Object,
                required: true
            },
            slotConfig: {
                type: Object,
                default: () => ({})
            },
            type: {
                type: String
            },
            change: {
                type: Function,
                default: () => {}
            }
        },

        data () {
            return {
                copySlotVal: JSON.parse(safeStringify(this.slotVal)),
                optionList: [],
                isLoading: false
            }
        },

        computed: {
            methodPayload () {
                const payload = this.copySlotVal.payload || {}
                return payload.methodData || {}
            }
        },

        created () {
            // 防止响应式更新
            this.copyType = this.type
        },

        methods: {
            changeParams ({ key, value }) {
                this.copySlotVal.payload.methodData.keys = {
                    ...this.copySlotVal.payload.methodData.keys,
                    [key]: value
                }
                this.triggleUpdate()
            },

            remoteChange (name, val, type, methodData) {
                this.optionList = Object.keys(val?.[0] || {})
                this.copySlotVal = {
                    ...this.copySlotVal,
                    val,
                    payload: {
                        methodData: {
                            ...this.methodPayload,
                            ...methodData,
                            keys: {
                                idKey: this.methodPayload?.keys?.idKey || this.optionList[0],
                                nameKey: this.methodPayload?.keys?.nameKey || this.optionList[0]
                            }
                        }
                    }
                }
                this.triggleUpdate()
            },

            triggleUpdate () {
                this.change(this.copySlotVal, this.copyType)
            }
        }
    }
</script>
