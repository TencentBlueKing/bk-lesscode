<template>
    <menu-item :item="item" />
</template>

<script>
    import MenuItem from '@/views/index/components/action-tool/components/menu-item'
    import { bus } from '@/common/bus'
    export default {
        components: {
            MenuItem
        },
        data () {
            return {
                item: {
                    icon: 'bk-drag-icon bk-drag-delete',
                    text: '清空',
                    func: this.handleClearAll
                }
            }
        },
        methods: {
            async handleClearAll () {
                this.$bkInfo({
                    title: '是否清空画布?？',
                    subTitle: '清空将会清除画布下所有配置，且无法恢复，你还要继续吗？',
                    theme: 'danger',
                    confirmFn: () => {
                        this.$store.commit('nocode/formSetting/restFieldList')
                        bus.$emit('restFieldList')
                    }
                })
            }
        }
    }
</script>
