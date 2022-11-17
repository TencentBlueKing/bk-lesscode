<template>
    <bk-form :label-width="110" :model="form" ref="funcForm" :form-type="formType" v-if="form.funcType === 1">
        <bk-form-item property="withToken" class="token-item">
            <bk-checkbox
                :key="hasToken"
                :true-value="1"
                :false-value="0"
                :value="form.withToken"
                :disabled="!hasToken"
                v-bk-tooltips="tokenContent"
                @change="updateToken"
            >蓝鲸应用认证</bk-checkbox>
        </bk-form-item>
    </bk-form>
</template>

<script>
    import mixins from './form-item-mixins'
    import dayjs from 'dayjs'

    export default {
        mixins: [mixins],

        props: {
            isShow: Boolean
        },

        data () {
            return {
                hasToken: true
            }
        },

        computed: {
            projectId () {
                return this.$route.params.projectId || this.form.projectId
            },

            tokenContent () {
                const content = `<pre class="token-pre"><span class="token-tip">请先关联蓝鲸应用并获取凭证Token，<a href="/project/${this.projectId}/credential" target="_blank">跳转设置</a></span></pre>`
                return {
                    content,
                    disabled: this.hasToken,
                    allowHtml: true
                }
            }
        },

        watch: {
            'form.withToken' () {
                this.determineClearToken()
            },

            projectId () {
                this.judgeDisableToken()
            }
        },

        created () {
            this.judgeDisableToken()
        },

        methods: {
            judgeDisableToken () {
                // 没有项目id，表示是在函数市场下
                if (!this.projectId) return
                this.$store.dispatch('functions/getTokenList', this.projectId).then((res) => {
                    const tokenList = res.data || []
                    const firstToken = tokenList[0]
                    this.hasToken = firstToken && dayjs(firstToken.expiresTime).isAfter(dayjs())
                    this.determineClearToken()
                })
            },

            determineClearToken () {
                // 如果没有配置 token，或者 token 过期。但是函数有token。这种情况下需要去除函数的 token 并给出提示
                if (!this.hasToken && this.form.withToken) {
                    this.updateToken(false)
                    this.messageWarn('该函数配置了蓝鲸应用认证，但是没有检测到有效凭证，请根据蓝鲸应用认证提示进行配置')
                }
            },

            updateToken (withToken) {
                this.updateValue({ withToken })
            }
        }
    }
</script>

<style lang="postcss" scoped>
    .token-item {
        margin: 10px 0 -10px;
        /deep/ .bk-checkbox-text {
            font-size: 12px;
        }
    }
    .token-tip {
        font-size: 12px;
        line-height: 16px;
        a {
            color: #3a84ff;
        }
    }
    .token-pre {
        margin: 0;
    }
</style>
