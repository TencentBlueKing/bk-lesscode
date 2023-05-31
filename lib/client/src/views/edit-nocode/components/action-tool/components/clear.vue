<template>
    <menu-item :item="item" :class="{ disabled}" />
</template>

<script>
    import MenuItem from '@/views/index/components/action-tool/components/menu-item'
    import { bus } from '@/common/bus'
    export default {
        components: {
            MenuItem
        },
        props: {
            disabled: Boolean,
            tips: String
        },
        data () {
            return {
                item: {
                    icon: 'bk-drag-icon bk-drag-delete',
                    text: window.i18n.t('清空'),
                    tips: this.tips,
                    func: this.handleClearAll
                }
            }
        },
        methods: {
            async handleClearAll () {
                if (this.disabled) {
                    return
                }
                this.$bkInfo({
                    title: window.i18n.t('是否清空画布?'),
                    subTitle: window.i18n.t('清空将会清除画布下所有配置，且无法恢复，你还要继续吗？'),
                    theme: 'danger',
                    confirmFn: () => {
                        this.$store.commit('nocode/formSetting/resetFieldList')
                        bus.$emit('resetFieldList', [])
                    }
                })
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .item.disabled {
        color: #c2c4c6;
        cursor: not-allowed;
    }
</style>
