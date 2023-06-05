<template>
    <div class="page-header">
        <div class="page-info">
            <span class="icon-span"><i :style="{ color: NOCODE_TYPE_MAP['color'][currentPage.nocodeType || ''] }" :class="NOCODE_TYPE_MAP['icon'][currentPage.nocodeType || '']"></i></span>
            <span class="name-span">{{currentPage.pageName}}</span>
            <span class="tag-span" :title="NOCODE_TYPE_MAP['title'][currentPage.nocodeType || '']">{{NOCODE_TYPE_MAP['title'][currentPage.nocodeType || '']}}</span>
        </div>
        <div class="page-operate">
            <bk-button theme="primary" @click="handleEditPage(currentPage)">{{ $t('编辑') }}</bk-button>
            <bk-button @click="handlePreview(currentPage)">{{ $t('预览') }}</bk-button>
        </div>
    </div>
</template>

<script>
    import { defineComponent } from '@vue/composition-api'
    import usePageOperation from './use-page-operation'
    import { NOCODE_TYPE_MAP } from '@/common/constant'

    export default defineComponent({
        props: {
            currentPage: {
                type: Object,
                default: () => ({})
            }
        },
        setup () {
            const { handleEditPage, handlePreview } = usePageOperation()
            return {
                NOCODE_TYPE_MAP,
                handleEditPage,
                handlePreview
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .page-header {
        width: 100%;
        height: 52px;
        padding: 0 24px 0 16px;
        box-shadow: 0 3px 4px 0 #0000000a;
        background: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: space-between;
        .page-info {
            .icon-span {
                padding: 5px 6px;
                background: #F5F7FA;
                border-radius: 2px;
                i {
                    font-size: 16px;
                }
            }
            .name-span {
                margin: 0 6px;
            }
            .tag-span {
                background: #F5F7FA;
                color: #979BA5;
                border-radius: 2px;
                font-size: 12px;
                padding: 2px 5px;
                display: inline-block;
                transform: scale(0.83, 0.83);
            }
        }
        .page-operate {
            button {
                width: 88px;
                margin-left: 8px;
            }
        }
    }
</style>
