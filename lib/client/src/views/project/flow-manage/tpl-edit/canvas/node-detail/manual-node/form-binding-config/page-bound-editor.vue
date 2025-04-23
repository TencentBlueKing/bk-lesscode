<template>
  <div class="page-bound-editor">
    <bk-select
        v-if="isEditMode || !isTagViewMode"
        :value="pages"
        ref="selectRef"
        multiple
        display-tag
        auto-height
        searchable
        @toggle="handleSelectToggle"
        @change="handleChange">
        <bk-option v-for="option in pageList" :key="option.id" :id="option.id" :name="option.pageName" />
        <div slot="extension" class="selector-extension" @click="handleCreatePage">
            <i class="bk-icon icon-plus-circle"></i>
            {{ $t('新建关联') }}
        </div>
    </bk-select>
    <div v-else class="bound-pages-view">
      <div class="page-tags">
        <TagsViewer
            v-if="relatedPageNames.length > 0"
            :tags="relatedPageNames"
            :max-width="445"
            @tagClick="handlePageTagClick" />
        <template v-else>--</template>
      </div>
      <i class="bk-drag-icon bk-drag-edit edit-icon" @click="handleEdit" />
    </div>
    <CreatePageDialog ref="createPageDialogRef" platform="PC" :use-custom-save="true" @save="onCreatePageConfirm" />
  </div>
</template>

<script>
    import { defineComponent, ref, computed, nextTick } from 'vue'
    import { useStore } from '@/store'
    import { useRouter } from '@/router'
    import { createNode } from '@/element-materials/core/static/create-node'
    import TagsViewer from '../../../../components/tags-viewer.vue'
    import CreatePageDialog from '@/components/project/create-page-dialog.vue'

    export default defineComponent({
        name: 'PageBoundEditor',
        components: {
            TagsViewer,
            CreatePageDialog
        },
        props: {
            isTagViewMode: Boolean, // 查看态是否用标签模式展示
            type: String,
            tplId: Number,
            formId: Number,
            nodeId: String,
            nodes: {
                type: Array,
                default: () => []
            },
            fields: {
                type: Array,
                default: () => []
            },
            pages: {
                type: Array,
                default: () => []
            }
        },
        setup (props, { emit }) {
            const store = useStore()
            const router = useRouter()

            const isEditMode = ref(false)
            const selectRef = ref(null)
            const createPageDialogRef = ref(null)

            const projectId = computed(() => store.getters['project/currentProjectId'])
            const pageList = computed(() => store.state.route.layoutPageList.filter(item => item.pageType === 'PC'))
            const relatedPageNames = computed(() => {
                console.log(pageList.value, props.pages)
                return props.pages.map(item => {
                    const page = pageList.value.find(page => page.id === item)
                    return page ? page.pageName : item
                })
            })

            const handleEdit = () => {
                isEditMode.value = true
                nextTick(() => {
                  selectRef.value.show()
                })
            }

            const handleSelectToggle = (val) => {
                if (val === false) {
                    isEditMode.value = false
                }
            }

            const handleCreatePage = () => {
                createPageDialogRef.value.isShow = true
            }

            // 新建页面弹窗点击确定按钮后的回调，新建页面后将容器组件配置更新到页面content字段
            const onCreatePageConfirm = async () => {
                // const pageDetail = await createPageDialogRef.value.save()

                const config = createNode(props.type, store.getters['project/projectDetail'].framework).toJSON()
                if (props.type === 'widget-flow-manage-container') {
                    const nodeList = props.nodes.filter(node => node.type === 'Manual').map(node => ({
                        ...node,
                        label: node.config.name,
                        hideFilters: false,
                        buttons: [],
                        filters: [],
                        fields: [],
                        tableColsExclude: [],
                        tableRowActions: [],
                        queryData: {},
                    }))

                    config.renderProps.id.code = props.tplId
                    config.renderProps.id.renderValue = props.tplId
                    config.renderProps.nodeList.code = nodeList
                    config.renderProps.nodeList.renderValue = nodeList
                } else if (props.type === 'widget-form-container') {
                    const dataSource = {
                        action: 'executeFlow',
                        flowTplId: props.tplId,
                        nodeId: props.nodeId,
                        type: "USE_FORM",
                        relatedId: props.formId,
                        id: '',
                        tableName: ''
                    }
                    config.renderProps.dataSource.code = dataSource
                    config.renderProps.dataSource.renderValue = dataSource
                    config.renderProps.fields.code = props.fields
                    config.renderProps.fields.renderValue = props.fields
                } else if (props.type === 'widget-data-manage-container') {
                    config.renderProps.flowTplId.code = props.tplId
                    config.renderProps.flowTplId.renderValue = props.tplId
                    config.renderProps.nodeId.code = props.nodeId
                    config.renderProps.nodeId.renderValue = props.nodeId
                    config.renderProps.formId.code = props.formId
                    config.renderProps.formId.renderValue = props.formId
                }

                await store.dispatch('flow/tpl/updateRelatedPageContent', {
                    tplId: props.tplId,
                    params: {
                        pageId: pageDetail.id,
                        content: JSON.stringify([config])
                    }
                })
                createPageDialogRef.value.isShow = false

                store.dispatch('route/getProjectPageRoute', {
                    projectId: projectId.value,
                    versionId: store.getters['projectVersion/currentVersionId']
                })

                handleChange([...props.pages, pageDetail.id], true)

                const { href } = router.resolve({ name: 'new', params: { project: projectId.value, pageId: pageDetail.id } })
                window.open(href, '_blank')
            }

            const handleChange = (pages, refresh = false) => {
                emit('update', { pages, refresh })
            }

            const handlePageTagClick = (val) => {
                const page = pageList.value.find(page => page.pageName === val);
                if (page) {
                    // 新标签页打开页面编辑画布
                    window.open(`/project/${projectId.value}/page/${page.id}/`, '_blank')
                }
            }

            return {
                isEditMode,
                pageList,
                relatedPageNames,
                selectRef,
                createPageDialogRef,
                handleEdit,
                handleSelectToggle,
                handleChange,
                handleCreatePage,
                handlePageTagClick,
                onCreatePageConfirm
            }
        }
    })

</script>
<style lang="postcss" scoped>
    .bound-pages-view {
      display: flex;
      align-items: center;
      &:hover {
        .edit-icon {
            display: inline-block;
        }
      }
    }
    .edit-icon {
        display: none;
        font-size: 20px;
        cursor: pointer;
        &:hover {
            color: #3a84ff;
        }
    }
    .selector-extension {
        text-align: center;
    }
</style>