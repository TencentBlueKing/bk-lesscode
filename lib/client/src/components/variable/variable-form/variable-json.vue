<template>
    <lc-form :model="copyValue" ref="form">
        <lc-form-item
            v-for="(item, index) in list"
            error-display-type="normal"
            :property="item.key"
            :key="index"
            :rules="[jsonValidate]"
        >
            <span :key="index" class="variable-txt">{{item.txt}}：</span>
            <main :key="item.key" class="variable-code">
                <bk-input class="json-input"
                    :placeholder="$t('请输入默认值')"
                    type="textarea"
                    v-model="copyValue[item.key]"
                    @input="getDisplayJson(item.key, ...arguments)"
                    @blur="formatterValue(item.key)"
                ></bk-input>
                <json-viewer
                    :value="displayJSON[item.key]"
                    :expand-depth="5"
                    :show-array-index="false"
                    class="json-viewer"
                />
            </main>
        </lc-form-item>
    </lc-form>
</template>

<script>
    import mixins from './variable.mixin'
    import JsonViewer from 'vue-json-viewer'

    export default {
        components: {
            JsonViewer
        },

        mixins: [mixins],

        data () {
            return {
                displayJSON: {
                    all: '',
                    stag: '',
                    prod: '',
                    preview: ''
                },
                copyValue: {
                    all: '',
                    stag: '',
                    prod: '',
                    preview: ''
                },
                jsonValidate: {
                    validator: (val) => {
                        try {
                            const valType = Object.prototype.toString.apply(JSON.parse(val))
                            return (this.valueType === 3 && valType === '[object Array]') || (this.valueType === 4 && valType === '[object Object]')
                        } catch (error) {
                            return false
                        }
                    },
                    message: this.$t('默认值输入格式不正确'),
                    trigger: 'blur'
                }
            }
        },

        watch: {
            value: {
                handler (newVal, oldVar) {
                    if (JSON.stringify(newVal) !== JSON.stringify(oldVar)) this.initData()
                },
                immediate: true
            },

            list () {
                this.initData()
            }
        },

        methods: {
            initData () {
                this.list.forEach(({ key }) => {
                    this.getDisplayJson(key, this.value[key])
                });
                ['all', 'prod', 'stag'].forEach((key) => {
                    this.copyValue[key] = this.value[key]
                })
            },

            formatterValue (key) {
                try {
                    const formatterVal = JSON.stringify(JSON.parse(this.copyValue[key]), null, 2)
                    this.copyValue[key] = formatterVal
                    this.change(key, formatterVal)
                } catch (e) {
                    this.displayJSON[key] = this.getErrMessage() || e.message || this.$t('请输入正确格式的数据')
                }
            },

            getDisplayJson (key, val) {
                try {
                    const displayJson = JSON.parse(val)
                    const valType = Object.prototype.toString.apply(displayJson)
                    const isErrInput = (this.valueType === 3 && valType !== '[object Array]') || (this.valueType === 4 && valType !== '[object Object]')
                    if (isErrInput) throw new Error()
                    this.displayJSON[key] = displayJson
                    this.change(key, val)
                } catch (e) {
                    this.displayJSON[key] = this.getErrMessage() || e.message || this.$t('请输入正确格式的数据')
                }
            },

            getErrMessage () {
                const messageMap = {
                    3: this.$t('请输入 Array 格式数据'),
                    4: this.$t('请输入 JSON 格式数据')
                }
                return messageMap[this.valueType]
            },

            validate () {
                return this.$refs.form.validate()
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .variable-txt {
        display: inline-block;
        font-size: 12px;
        color: #63656e;
    }
    .variable-code {
        display: flex;
        flex-direction: row;
        align-items: stretch;
        height: 200px;
        .json-input, .json-viewer {
            flex: 1;
        }
        .json-input /deep/.bk-form-textarea {
            height: 200px;
        }
        .json-viewer {
            border: 1px solid #c4c6cc;
            border-left: none;
            height: 202px;
            width: 50%;
        }
        /deep/ .jv-code {
            overflow: auto;
            height: 202px;
        }
    }
</style>
