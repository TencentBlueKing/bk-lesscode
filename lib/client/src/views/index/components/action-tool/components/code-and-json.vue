<template>
    <menu-item :item="item">
        <code-json-dialog @close="() => showDialog = false" :is-show="showDialog" />
    </menu-item>
</template>

<script>
    import MenuItem from './menu-item'
    import CodeJsonDialog from '../children/code-and-json-dialog'
    
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
                    tips: window.i18n.t('查看页面源码 & JSON')
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
