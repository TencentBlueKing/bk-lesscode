<template>
    <div class="create-binding-section">
        <div
            v-for="item in CREATE_METHODS"
            class="method-item"
            :key="item.id"
            @click="handleMethodClick(item.id)">
            <i class="bk-drag-icon bk-drag-crosshair"></i>
            {{ item.name }}
        </div>
        <select-form-dialog v-bind="dialogData" @selected="handleSelected" @close="handleClose" />
    </div>
</template>
<script>
    import { defineComponent, ref } from '@vue/composition-api'
    import SelectFormDialog from './select-form-dialog.vue'

    export default defineComponent({
        name: 'CreateBindingSection',
        components: {
            SelectFormDialog
        },
        props: {},
        setup (props, { emit }) {
            const CREATE_METHODS = [
                { id: 'NEW_FORM', name: window.i18n.t('新建空白表单') },
                { id: 'CITE_FORM', name: window.i18n.t('引用已有表单') },
                { id: 'REUSE_FORM', name: window.i18n.t('复用已有表单') }
            ]

            const dialogData = ref({
                show: false,
                isCite: true
            })

            const handleMethodClick = (val) => {
                console.log('method: ', val)
                if (val === 'NEW_FORM') {
                    console.log('新建空白表单')
                } else {
                    dialogData.value.isCite = val === 'CITE_FORM'
                    dialogData.value.show = true
                }
            }

            const handleSelected = () => {}

            const handleClose = () => {
                dialogData.value.show = false
            }

            return {
                CREATE_METHODS,
                dialogData,
                handleMethodClick,
                handleSelected,
                handleClose
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .create-binding-section {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .method-item {
            flex: 1;
            height: 40px;
            line-height: 40px;
            text-align: center;
            font-size: 12px;
            color: #63656e;
            border: 1px solid #c4c6cc;
            border-radius: 2px;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
                border-color: #3a84ff;
            }
            i {
                font-size: 16px;
            }
            &:not(:last-child) {
                margin-right: 12px;
            }
        }
    }
</style>
