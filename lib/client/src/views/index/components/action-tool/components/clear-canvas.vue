<template>
    <menu-item :item="item" />
</template>

<script>
    import MenuItem from './menu-item'
    import LC from '@/element-materials/core'
    
    export default {
        components: {
            MenuItem
        },
        data () {
            return {
                item: {
                    icon: 'bk-drag-icon bk-drag-delete',
                    tips: this.$t('清空画布内容区域（不包含导航部分）'),
                    func: this.handleClearAll
                }
            }
        },
        methods: {
            handleClearAll () {
                // const isLock = await this.checkLockStatus('lock')
                // if (isLock) return // 如果被锁，不可清空

                LC.reset()
            }
        }
    }
</script>
