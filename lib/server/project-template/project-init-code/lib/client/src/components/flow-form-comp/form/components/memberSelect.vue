<template>
    <div :class="[extCls]" test-posi-id="bk-member-selector">
        <bk-user-selector
            :value="value"
            class="ui-user-selector"
            :fixed-height="true"
            :api="api"
            :disabled="disabled || hostLoading"
            :multiple="multiple"
            :placeholder="placeholder"
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
                default: '请选择'
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
            }
        },
        created () {
            if (BK_USER_MANAGE_HOST) {
                this.host = BK_USER_MANAGE_HOST
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
<style lang="postcss">
    /* 人员选择器使用的tippy，引入了单独的css，会影响到组件库中基于tippy实现的组件样式 */
    .tippy-tooltip {
        .tippy-content {
            padding: 0;
        }
        .tippy-arrow {
            width: 0;
            height: 0;
        }
    }
</style>
