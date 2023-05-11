<template>
    <div :class="[extCls]" test-posi-id="bk-member-selector">
        <bk-user-selector
            ref="bkUserSelector"
            :value="value"
            class="ui-user-selector"
            :fixed-height="true"
            :api="api"
            :disabled="disabled || hostLoading"
            :multiple="multiple"
            :placeholder="placeholderStr"
            @blur="onBlur"
            @change="onChange">
        </bk-user-selector>
    </div>
</template>

<script>
    import BkUserSelector from '@blueking/user-selector'

    export default {
        name: 'MemberSelector',
        components: {
            BkUserSelector
        },
        model: {
            prop: 'value',
            event: 'change'
        },
        props: {
            placeholder: {
                type: String,
                default: ''
            },
            disabled: {
                type: Boolean,
                default: false
            },
            // 多选
            multiple: {
                type: Boolean,
                default: true
            },
            value: {
                type: Array,
                default () {
                    return []
                }
            },
            // 外部设置的 class name
            extCls: {
                type: String,
                default: ''
            }
        },
        data () {
            return {
                host: '',
                hostLoading: false,
                users: []
            }
        },
        computed: {
            api () {
                return `${this.host}/api/c/compapi/v2/usermanage/fs_list_users/`
            },
            placeholderStr () {
                return this.placeholder || window.i18n.t('请选择')
            }
        },
        created () {
            if (process.env.BK_USER_MANAGE_HOST) {
                this.host = process.env.BK_USER_MANAGE_HOST
            } else {
                this.getUserManageUrl()
            }
        },
        methods: {
            async getUserManageUrl () {
                try {
                    this.hostLoading = true
                    const res = await this.$http.get('/nocode/userManageUrl')
                    this.host = res.data
                    this.hostLoading = false
                } catch (e) {
                    this.host = location.origin
                    this.hostLoading = false
                }
            },
            onChange (value) {
                this.$emit('change', value)
            },
            onBlur () {
                this.$emit('blur')
            }
        }
    }
</script>

<style lang="postcss" scoped>
.ui-user-selector {
  display: block;
  width: 100%;
}
</style>
