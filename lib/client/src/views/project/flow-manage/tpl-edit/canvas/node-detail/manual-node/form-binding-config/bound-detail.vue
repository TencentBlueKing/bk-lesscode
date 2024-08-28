<template>
    <div class="bound-detail-section">
        <div class="title-area">
            <h5 class="form-name">人工节点_表单</h5>
            <div class="method-tag">引用表单</div>
        </div>
        <div class="bound-form-table">
            {{ $t('关联数据表：') }}
            <a class="form-table-name" href="/">表单名称</a>
        </div>
        <div class="operate-btns">
            <i
                class="bk-drag-icon bk-drag-edit edit-icon"
                @click="handleBtnClick('edit')">
            </i>
            <i
                v-bk-tooltips.top="$t('预览表单内容')"
                class="bk-drag-icon bk-drag-visible-eye preview-icon"
                @click="handleBtnClick('preivew')">
            </i>
            <i
                class="bk-icon icon-delete"
                style="font-size: 12px;"
                @click="handleBtnClick('delete')">
            </i>
        </div>
    </div>
</template>
<script>
    import { defineComponent } from '@vue/composition-api'

    export default defineComponent({
        name: 'BoundDetailSection',
        props: {},
        setup (props, { emit }) {

            const handleBtnClick = (action) => {
                console.log('action: ', action)
            }
            return {
                handleBtnClick
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .bound-detail-section {
        position: relative;
        padding: 10px 100px 12px 24px;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        .title-area {
            display: flex;
            align-items: center;
            h5 {
                margin: 0;
                font-size: 12px;
                color: #63656e;
                max-width: 420px;
                line-height: 16px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .method-tag {
                padding: 2px 6px;
                font-size: 12px;
                color: #3a84ff;
                background: #edf4ff;
                border: 1px solid rgba(58, 132, 255, 0.3);
                border-radius: 2px;
                transform: scale(0.83);
            }
        }
        .bound-form-table {
            margin-top: 4px;
            font-size: 12px;
            color: #63656e;
            .form-table-name {
                min-width: 80px;
                max-width: 168px;
                color: #3a84ff;
                white-space: nowrap;
                text-overflow: ellipsis;
                overflow: hidden;
            }
        }
        .operate-btns {
            position: absolute;
            top: 50%;
            right: 24px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            width: 70px;
            transform: translateY(-50%);
            i {
                cursor: pointer;
                &:hover {
                    color: #3a84ff;
                }
            }
            .edit-icon {
                font-size: 20px;
            }
            .preview-icon {
                font-size: 16px;
            }
        }
    }
</style>
