<template>
    <div class="page-header-operate">
        <save-btn />
        <preview-btn />
        <page-setting-btn />
    </div>
</template>

<script>
    import SaveBtn from './save'
    import PreviewBtn from './preview'
    import PageSettingBtn from './page-setting'
    import { defineComponent } from '@vue/composition-api'

    export default defineComponent({
        components: {
            SaveBtn,
            PreviewBtn,
            PageSettingBtn
        }
    })
</script>

<style lang="postcss" scoped>
    .page-header-operate {
        display: flex;
        justify-content: center;
        align-items: center;
        button {
            width: 88px;
            margin-left: 8px;
        }
        .setting-btn {
            width: 26px;
            height: 26px;
            margin: 0 12px;
            display: flex;
            justify-content: center;
            align-items: center;
            background: #F0F5FF;
            border-radius: 2px;
            cursor: pointer;
            &:hover {
                color: #3A84FF;
            }
            i {
                font-size: 14px;
            }
        }
    }
</style>
