<template>
    <div class="field-modifiers-panel">
        <template v-if="fieldData.id">
            <section class="panel-head">
                <span class="element-id">{{ fieldData.id }}</span>
                <div class="actions">
                    <i
                        v-bk-tooltips="$t('删除')"
                        :class="['bk-drag-icon bk-drag-delet delete-icon', dataSource.type === 'USE_FORM' ? 'disabled' : '']"
                        @click="handleDelete">
                    </i>
                    <i
                        v-bk-tooltips="$t('复制id')"
                        class="bk-drag-icon bk-drag-copy"
                        @click="handleCopyId">
                    </i>
                </div>
            </section>
            <section class="field-setting-container">
                <Setter :field="fieldData" :data-source="dataSource" :list="fields" @change="handleChange" />
            </section>
        </template>
        <div v-else class="empty-tips">{{ $t('请从左侧拖入组件或者选中组件') }}</div>
    </div>
</template>
<script>
    import { defineComponent } from '@vue/composition-api'
    import { execCopy } from '@/common/util'
    import Setter from '@/form-engine/setter/index'

    export default defineComponent({
        name: 'FieldModifiersPanel',
        components: {
            Setter
        },
        props: {
            fieldData: {
                type: Object,
                default: () => ({})
            },
            fields: {
                type: Array,
                default: () => []
            },
            dataSource: Object
        },
        setup (props, { emit }) {

            const handleDelete = () => {
                if (props.dataSource.type === 'USE_FORM') {
                    return
                }
                emit('delete', props.fieldData)
            }

            const handleCopyId = () => {
                execCopy(props.fieldData.id)
            }

            const handleChange = (property, val) => {
                emit('change', property, val)
            }

            return {
                handleDelete,
                handleCopyId,
                handleChange
            }
        }
    })
</script>
<style lang="postcss" scoped>
    @import "@/css/mixins/scroller";
    .field-modifiers-panel {
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
            .delete-icon {
                margin-right: 5px;
            }
            & > i {
                cursor: pointer;
                &.disabled {
                    color: #dcdee5;
                    cursor: not-allowed;
                }
                &:not(.disabled):hover {
                    color: #3a84ff;
                }
            }
        }
    }
    .field-setting-container {
        height: calc(100% - 42px);
        overflow: auto;
        @mixin scroller;
    }
    .empty-tips {
        margin-top: 200px;
        background: #ffffff;
        font-size: 14px;
        color: #63656e;
        text-align: center;
    }
</style>
