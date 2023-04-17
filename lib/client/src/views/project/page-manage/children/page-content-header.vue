<template>
    <div class="page-header">
        <div class="page-info">
            <span class="icon-span"><i :style="{ color: NOCODE_TYPE_MAP['color'][currentPage.nocodeType || ''] }" :class="NOCODE_TYPE_MAP['icon'][currentPage.nocodeType || '']"></i></span>
            <span class="name-span">{{currentPage.pageName}}</span>
            <span class="tag-span">{{NOCODE_TYPE_MAP['title'][currentPage.nocodeType || '']}}</span>
        </div>
        <div class="page-operate">
            <bk-button theme="primary" @click="handleEditPage(currentPage)">编辑</bk-button>
            <bk-button @click="handlePreview(currentPage)">预览</bk-button>
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
        }
        .page-operate {
            button {
                width: 88px;
                margin-right: 8px;
            }
        }
    }
</style>
