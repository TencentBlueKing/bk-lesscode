<template>
  <section class="form-editor-container-modifier">
    <section class="panel-head">
        <span class="element-id">{{ elementData.id }}</span>
        <div class="actions">
            <i v-bk-tooltips="$t('删除')" class="bk-drag-icon bk-drag-delet mr5"></i>
            <i v-bk-tooltips="$t('复制id')" class="bk-drag-icon bk-drag-copy" @click="handleCopyId"></i>
        </div>
    </section>
    <section class="panel-content">
        <form-container-element v-if="type === 'widget-form-container'" />
        <dataManageContainerElement v-if="type === 'widget-data-manage-container'" />
    </section>
  </section>
</template>
<script>
    import { execCopy } from '@/common/util'
    import formContainerElement from './components/form-container-element/index.vue'
    import dataManageContainerElement from './components/data-manage-container-element/index.vue'

    export default {
        name: 'form-editor-container-modifier',
        components: {
            formContainerElement,
            dataManageContainerElement
        },
        data () {
            return {
                type: '',
                elementData: null
            }
        },
        created () {
            this.activeElementUpdateCallback()
            LC.addEventListener('activeElementUpdate', this.activeElementUpdateCallback)
            this.$once('hook:beforeDestroy', () => {
                LC.removeEventListener('activeElementUpdate', this.activeElementUpdateCallback)
            })
        },
        methods: {
            activeElementUpdateCallback () {
                const activeElement = LC.getActiveElement()
                if (activeElement) {
                    const { componentData, elementData } = activeElement
                    this.type = componentData.type
                    this.elementData = elementData
                }
            },
            handleCopyId () {
                execCopy(this.elementData.id)
            }
        }
    }
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    .form-editor-container-modifier {
        height: 100%;
    }
    .panel-head {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 20px;
        height: 42px;
        border-bottom: 1px solid #dcdee5;
        .element-id {
            margin-right: 10px;
            max-width: 230px;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .actions {
            display: inline-flex;
            align-items: center;
            & > i {
                cursor: pointer;
                &:hover {
                    color: #3a84ff;
                }
            }
        }
    }
    .panel-content {
        height: calc(100% - 42px);
        overflow: auto;
        @mixin scroller;
    }
</style>