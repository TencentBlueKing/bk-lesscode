<template>
    <div v-bkloading="{ loading: formListLoading }" class="bound-detail-section">
        <div class="detail-section-title">
            <h5 class="form-name">{{ formDetail.formName }}</h5>
            <div class="method-tag">{{ typeNameMap[formType] }}</div>
        </div>
        <div class="detail-section-content">
            <div class="bound-info-form">
                <div class="label">{{ $t('关联数据表：') }}</div>
                <div class="content">
                    <div class="form-bound-wrapper">
                        <a class="form-table-name" target="_blank" :href="tableDetailUrl">{{ formDetail.tableName }}</a>
                        <div class="btns">
                            <i
                                v-bk-tooltips.top="$t('编辑表单')"
                                class="bk-drag-icon bk-drag-edit edit-icon"
                                @click="handleBtnClick('edit')">
                            </i>
                            <i
                                v-bk-tooltips.top="$t('预览表单')"
                                class="bk-drag-icon bk-drag-visible-eye preview-icon"
                                @click="handleBtnClick('preview')">
                            </i>
                            <i
                                v-bk-tooltips.top="$t('删除表单')"
                                class="bk-icon icon-delete delete-icon"
                                style="font-size: 12px;"
                                @click="handleBtnClick('delete')">
                            </i>
                        </div>
                    </div>
                </div>
            </div>
            <!-- 流程第一个节点为人工节点时，才有该表单项 -->
            <div v-if="isFirstAndManualNode" class="bound-info-form">
                <div class="label">{{ $t('关联表单页：') }}</div>
                <div class="content">
                    <PageBoundEditor
                        type="widget-form-container"
                        :is-tag-view-mode="true"
                        :tpl-id="tplId"
                        :node-id="nodeId"
                        :formId="formType === 'USE_FORM' ? relatedId : formId"
                        :fields="fields"
                        :pages="containerPages.formContainer"
                        @update="handleUpdateContainerPages('formContainer', $event)" />
                </div>
            </div>
            <div class="bound-info-form">
                <div class="label">{{ $t('关联数据管理页：') }}</div>
                <div class="content">
                    <PageBoundEditor
                        type="widget-data-manage-container"
                        :is-tag-view-mode="true"
                        :tpl-id="tplId"
                        :node-id="nodeId"
                        :formId="formType === 'USE_FORM' ? relatedId : formId"
                        :pages="containerPages.dataManageContainer"
                        :fields="fields"
                        @update="handleUpdateContainerPages('dataManageContainer', $event)" />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { defineComponent, ref, computed, onMounted } from 'vue'
    import { useStore } from '@/store'
    import { useRoute, useRouter } from '@/router'
    import PageBoundEditor from './page-bound-editor.vue'

    export default defineComponent({
        name: 'BoundDetailSection',
        components: {
            PageBoundEditor
        },
        props: {
            tplId: Number,
            nodeId: String,
            formType: String,
            formId: Number,
            relatedId: Number,
            containerPages: Object,
            isFirstAndManualNode: Boolean
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

            const fields = computed(() => {
                if (formDetail.value.content) {
                    return JSON.parse(formDetail.value.content)
                }
                return []
            })

            // 关联数据表跳转链接
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

            // 获取表单列表
            const getFormList = async() => {
                formListLoading.value = true
                const params = {
                    projectId: route.params.projectId,
                    versionId: store.getters['projectVersion/currentVersionId']
                }
                formList.value = await store.dispatch('nocode/form/getNewFormList', params)
                formListLoading.value = false
            }

            const handleUpdateContainerPages = (type, { pages, refresh }) => {
                emit('updateContainerPages', {
                    pages: { ...props.containerPages, [type]: pages.slice()},
                    refresh
                })
            }

            const handleBtnClick = (action) => {
                if (action === 'edit') {
                    emit('edit')
                } else if (action === 'preview') {
                    emit('preview', formDetail.value.id)
                } else if (action === 'delete') {
                    emit('delete')
                }
            }
            return {
                typeNameMap,
                formListLoading,
                formDetail,
                fields,
                tableDetailUrl,
                handleBtnClick,
                handleUpdateContainerPages
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .bound-detail-section {
        position: relative;
        padding: 10px 24px 12px 24px;
        border: 1px solid #c4c6cc;
        border-radius: 2px;
        .detail-section-title {
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
        .detail-section-content {
            margin-top: 12px;
        }
        .bound-info-form {
            display: flex;
            align-items: flex-start;
            font-size: 12px;
            color: #63656e;
            &:not(:first-of-type) {
                margin-top: 4px;
            }
            .label {
                flex-shrink: 0;
                width: 140px;
                text-align: right;
            }
            .content {
                flex: 1;
                overflow: hidden;
                .form-bound-wrapper {
                    display: flex;
                    align-items: center;
                    overflow: hidden;
                    &:hover {
                        .btns {
                            display: flex;
                        }
                    }
                }
                .form-table-name {
                    color: #3a84ff;
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                }
                .btns {
                    display: none;
                    align-items: center;
                    justify-content: space-between;
                    margin-left: 4px;
                    height: 30px;
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
                    .delete-icon {
                        margin-left: 4px;
                    }
                }
            }
        }
    }
</style>
