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
                    text: window.i18n.t('清空'),
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
