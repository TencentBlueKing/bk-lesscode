<template>
    <span>
        <bk-popover
            ext-cls="form-manage-page-list"
            placement="right-start"
            theme="light"
            width="300">
            <span class="form-link-tag">
                <i class="bk-drag-icon bk-drag-lianjie"></i>
                <span>{{managePages.length}}</span>
            </span>
            <div slot="content" class="form-manage-list">
                <div class="list-title"><span>{{$t('关联的表单数据管理页')}}</span></div>
                <ul class="list-ul">
                    <li v-for="item in managePages" :key="item.id">
                        <i style="color: #71C26E" class="bk-drag-icon bk-drag-shujuyuan"></i>
                        <span class="name">{{item.pageName}}</span>
                        <i :title="$t('预览')" class="bk-icon icon-eye click-icon" @click="handlePreview(item)"></i>
                        <i :title="$t('编辑')" class="bk-drag-icon bk-drag-edit click-icon" style="font-size: 16px;" @click="handleEditPage(item)"></i>
                    </li>
                </ul>
            </div>
        </bk-popover>
    </span>
</template>

<script>
    import { defineComponent } from '@vue/composition-api'
    import usePageOperation from './use-page-operation'
    import { NOCODE_TYPE_MAP } from '@/common/constant'

    export default defineComponent({
        props: {
            managePages: {
                type: Array,
                default: () => ([])
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
    @import "@/css/variable";

    .form-link-tag {
        font-size: 12px;
        display: flex;
        padding: 0 2px;
        border-radius: 2px;
        margin-right: 3px;
        align-items: center;
        color: $primaryColor;
        background: #F0F5FF;
        .bk-drag-lianjie {
            margin-right: 2px;
            font-size: 12px;
        }
    }
    .form-manage-page-list {
        .form-manage-list {
            font-size: 12px;
            color: #63656E;
            cursor: default;
            .list-title {
                height: 24px;
                font-weight: bold;
            }
            .list-ul {
                li {
                    display: flex;
                    align-items: center;
                    height: 28px;
                    i {
                        margin-right: 6px;
                    }
                    .click-icon {
                        cursor: pointer;
                    }
                    .name {
                        display: inline-block;
                        width: 220px;
                    }
                    &:hover {
                        color: #3A84FF;
                        background: #E1ECFF;
                    }
                }
            }
        }
    }
</style>
