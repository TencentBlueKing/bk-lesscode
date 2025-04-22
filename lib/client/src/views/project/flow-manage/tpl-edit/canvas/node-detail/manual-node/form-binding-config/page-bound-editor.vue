<template>
  <div class="page-bound-editor">
    <!-- <bk-select
        v-if="isEditMode"
        :value="pages"
        ref="selectRef"
        multiple
        display-tag
        auto-height
        searchable
        @toggle="handleSelectToggle"
        @change="handleChange">
        <bk-option v-for="option in pageList" :key="option.id" :id="option.id" :name="option.pageName" />
        <div slot="extension" class="selector-extension" @click="createRelatedPageShow = true">
            <i class="bk-icon icon-plus-circle"></i>
            {{ $t('新建关联') }}
        </div>
    </bk-select> -->
    <CreateRelatedPage
        :show-select="isEditMode"
        :type="type"
        :value="pages"
        :tpl-id="tplId"
        :form-id="formId"
        :node-id="nodeId"
        :fields="fields"
        @update="handleChange" />
    <div v-if="isEditMode" class="bound-pages-view">
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
  </div>
</template>

<script>
    import { defineComponent, ref, computed, nextTick } from 'vue'
    import { useStore } from '@/store'
    import { useRoute } from '@/router'
    import TagsViewer from '../../../../components/tags-viewer.vue'
    import CreateRelatedPage from '../../components/create-related-page.vue'

    export default defineComponent({
        name: 'PageBoundEditor',
        components: {
            TagsViewer,
            CreateRelatedPage
        },
        props: {
            type: String,
            tplId: Number,
            formId: Number,
            nodeId: String,
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
            const route = useRoute()

            const isEditMode = ref(false);
            const selectRef = ref(null);
            const createRelatedPageShow = ref(false);

            const pageList = computed(() => store.state.route.layoutPageList.filter(item => item.pageType === 'PC'))
            const relatedPageNames = computed(() => {
                return props.pages.map(item => {
                    const page = pageList.value.find(page => page.id === item);
                    return page ? page.pageName : item;
                });
            }); 

            const handleEdit = () => {
                isEditMode.value = true;
                nextTick(() => {
                  selectRef.value.show();
                })
            }

            const handleSelectToggle = (val) => {
                if (val === false) {
                    isEditMode.value = false;
                }
            }

            const handleChange = (val) => {
                emit('update', val)
            }

            const handlePageTagClick = (val) => {
                const page = pageList.value.find(page => page.pageName === val);
                if (page) {
                    // 新标签页打开页面编辑画布
                    window.open(`/project/${route.params.projectId}/page/${page.id}/`, '_blank')
                }
            }

            return {
                isEditMode,
                pageList,
                relatedPageNames,
                selectRef,
                createRelatedPageShow,
                handleEdit,
                handleSelectToggle,
                handleChange,
                handlePageTagClick
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
</style>