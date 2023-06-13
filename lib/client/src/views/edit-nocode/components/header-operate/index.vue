<template>
    <div class="page-header-operate">
        <save-btn
            v-if="!hideSave"
            :custom="customSave"
            :custom-loading="customLoading"
            :disabled="disabled"
            :tips="disabledTips"
            @save="$emit('save', $event)" />
        <preview-btn v-if="!hidePreview" />
        <form-page-operate v-if="pageDetail.nocodeType === 'FORM'"></form-page-operate>
        <data-manage-operate v-if="['FORM_MANAGE', 'FLOW_MANAGE'].includes(pageDetail.nocodeType)"></data-manage-operate>
        <page-setting-btn v-if="!hidePageSetting" />
    </div>
</template>

<script>
    import SaveBtn from './save'
    import PreviewBtn from '@/views/index/components/header-operate/preview'
    import PageSettingBtn from '@/views/index/components/header-operate/page-setting'
    import FormPageOperate from './form-page-operate'
    import DataManageOperate from './data-manage-operate'

    import { mapGetters } from 'vuex'

    export default {
        components: {
            SaveBtn,
            PreviewBtn,
            PageSettingBtn,
            FormPageOperate,
            DataManageOperate
        },
        props: {
            customSave: Boolean,
            hideSave: Boolean,
            hidePreview: Boolean,
            hidePageSetting: Boolean,
            customLoading: Boolean,
            disabled: Boolean,
            disabledTips: String
        },
        computed: {
            ...mapGetters('page', ['pageDetail'])
        }
    }
</script>

<style lang="postcss" scoped>
    .page-header-operate {
        margin-right: 12px;
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
            margin-left: 12px;
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
