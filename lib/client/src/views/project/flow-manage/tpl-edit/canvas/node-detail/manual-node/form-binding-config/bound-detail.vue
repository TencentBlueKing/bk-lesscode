<template>
    <div v-bkloading="{ loading: formListLoading }" class="bound-detail-section">
        <div class="title-area">
            <h5 class="form-name">{{ formDetail.formName }}</h5>
            <div class="method-tag">{{ typeNameMap[formType] }}</div>
        </div>
        <div class="bound-form-table">
            {{ $t('关联数据表：') }}
            <a v-if="formDetail.tableName" class="form-table-name" target="_blank" :href="tableDetailUrl">{{ formDetail.tableName }}</a>
        </div>
        <div class="operate-btns">
            <i
                class="bk-drag-icon bk-drag-edit edit-icon"
                @click="handleBtnClick('edit')">
            </i>
            <i
                v-bk-tooltips.top="$t('预览表单内容')"
                class="bk-drag-icon bk-drag-visible-eye preview-icon"
                @click="handleBtnClick('preview')">
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
    import { defineComponent, ref, computed, onMounted } from '@vue/composition-api'
    import { useStore } from '@/store'
    import { useRoute, useRouter } from '@/router'

    export default defineComponent({
        name: 'BoundDetailSection',
        props: {
            formType: String,
            formId: Number,
            relatedId: Number
        },
        setup (props, { emit }) {

            const store = useStore()
            const route = useRoute()
            const router = useRouter()

            const typeNameMap = {
                NEW_FORM: window.i18n.t('新建表单'),
                CITE_FORM: window.i18n.t('引用表单'),
                USE_FORM: window.i18n.t('复用表单')
            }

            const formList = ref([])
            const formListLoading = ref(false)

            const formDetail = computed(() => {
                const id = props.formType === 'USE_FORM' ? props.relatedId : props.formId
                if (id) {
                    return formList.value.find(item => item.id === id) || {}
                }
                return {}
            })

            const tableDetailUrl = computed(() => {
                if (formDetail.value) {
                    const route = router.resolve({ name: 'dataManage', query: { tableName: formDetail.value.tableName } })
                    return route.href
                }
                return ''
            })

            onMounted(() => {
                getFormList()
            })

            const getFormList = async() => {
                formListLoading.value = true
                const params = {
                    projectId: route.params.projectId,
                    versionId: store.getters['projectVersion/currentVersionId']
                }
                formList.value = await store.dispatch('nocode/form/getNewFormList', params)
                formListLoading.value = false
            }

            const handleBtnClick = (action) => {
                if (action === 'edit') {
                    emit('edit')
                } else if (action === 'preview') {
                    emit('preview', JSON.parse(formDetail.value.content))
                } else if (action === 'delete') {
                    emit('delete')
                }
            }
            return {
                typeNameMap,
                formListLoading,
                formDetail,
                tableDetailUrl,
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
                line-height: 1;
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
