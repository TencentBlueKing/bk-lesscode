<template>
    <div class="create-related-page">
        <bk-select
            v-if="showSelect"
            :value="value"
            ext-popover-cls="related-page-selector"
            multiple
            display-tag
            auto-height
            searchable
            @selected="handleSelectPages">
            <bk-option v-for="option in pageList" :key="option.id" :id="option.id" :name="option.pageName" />
            <div slot="extension" class="create-related-page-extension" @click="handleCreatePage">
                <i class="bk-icon icon-plus-circle"></i>
                {{ $t('新建关联') }}
            </div>
        </bk-select>
        <CreatePageDialog ref="createPageDialog" platform="PC" :use-custom-save="true" @save="handleSave" />
    </div>
</template>
<script>
import { defineComponent, ref, computed } from 'vue'
import { useStore } from '@/store'
import router, { useRoute } from '@/router'
import CreatePageDialog from '@/components/project/create-page-dialog.vue'
import { createNode } from '@/element-materials/core/static/create-node'

export default defineComponent({
    name: 'TagsViewer',
    components: {
        CreatePageDialog,
    },
    props: {
        value: {
            type: Array,
            default: () => []
        },
        showSelect: {
            type: Boolean,
            default: true
        },
        type: String,
        tplId: Number,
        formId: Number,
        nodeId: String,
        fields: {
            type: Array,
            default: () => []
        }
    },
    setup(props, { emit }) {
        const store = useStore()
        const route = useRoute()

        const createPageDialog = ref(null)

        const pageList = computed(() => store.state.route.layoutPageList.filter(item => item.pageType === 'PC'))

        const handleSelectPages = (val) => {
            emit('update', val.slice())
        }

        const handleCreatePage = () => {
            createPageDialog.value.isShow = true
        }

        const handleSave = async () => {
            const pageDetail = await createPageDialog.value.save()

            const config = createNode(props.type, store.getters['project/projectDetail'].framework).toJSON()
            if (props.type === 'widget-flow-manage-container') {
                config.renderProps.id.code = props.tplId
                config.renderProps.id.renderValue = props.tplId
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

            const pageContent = JSON.parse(pageDetail.content || '[]')
            pageContent.push(config)
            await store.dispatch('flow/tpl/updateRelatedPageContent', {
                tplId: props.tplId,
                params: {
                    pageId: pageDetail.id,
                    content: JSON.stringify(pageContent)
                }
            })
            createPageDialog.value.isShow = false
            const { href } = router.resolve({ name: 'new', params: { project: route.params.project, pageId: pageDetail.id } })
            window.open(href, '_blank')
        }

        return {
            pageList,
            createPageDialog,
            handleSelectPages,
            handleCreatePage,
            handleSave
        }
    }
})
</script>
<style lang="postcss" scoped>
    .create-related-page-extension { 
        text-align: center;
        cursor: pointer;
        i {
            margin-right: 4px;
        }
    }
</style>
