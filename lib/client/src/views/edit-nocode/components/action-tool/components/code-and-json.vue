<template>
    <menu-item :item="item">
        <code-json-dialog @close="() => showDialog = false" :is-show="showDialog" :type-list="['json']" default-type="json" />
    </menu-item>
</template>

<script>
    import MenuItem from '@/views/index/components/action-tool/components/menu-item'
    import CodeJsonDialog from '@/views/index/components/action-tool/children/code-and-json-dialog'
    
    export default {
        components: {
            MenuItem,
            CodeJsonDialog
        },
        data () {
            return {
                item: {
                    icon: 'bk-drag-icon bk-drag-yuanma',
                    func: this.toggleCodeAndJson,
                    tips: window.i18n.t('查看JSON')
                },
                showDialog: false
            }
        },
        methods: {
            toggleCodeAndJson () {
                this.showDialog = true
            }
        }
    }
</script>
