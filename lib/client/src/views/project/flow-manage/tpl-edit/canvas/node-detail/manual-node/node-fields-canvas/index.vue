<template>
    <div class="node-fields-canvas">
        <div class="content-container">
            <div class="canvas-top-header">
                <div class="nav-area">
                    <i class="bk-drag-icon bk-drag-arrow-back back-icon" @click="handleBack"></i>
                    <div class="split-line"></div>
                    <breadcrumb-nav
                        :tpl-name="tplName"
                        :node-name="nodeName"
                        :form-name="formName"
                        :editable="editable"
                        @change="formName = $event" />
                </div>
                <div class="operate-btns">
                    <save-btn
                        :tpl-id="tplId"
                        :node-id="nodeId"
                        :form-type="formType"
                        :form-id="formId"
                        :form-name="formName"
                        :table-name="tableName"
                        :fields="fields"
                        :editable="editable"
                        @saved="handleFormSaved" />
                    <!-- <bk-button
                        v-bk-tooltips="{ content: $t('复用表单模式下表单不可编辑'), disabled: editable, placement: 'bottom-end' }"
                        :class="{ disabled: !editable }"
                        @click="handleClear">
                        {{ $t('清空') }}
                    </bk-button> -->
                </div>
            </div>
            <div v-if="!loading" class="canvas-edit-container">
                <div class="left-panel">
                    <materials />
                </div>
                <div class="fields-edit-panel">
                    <fields-canvas
                        :fields="fields"
                        :type="formType"
                        @selected="handleSelectField"
                        @update="handleUpdateFields"
                        @deleted="clearSelected" />
                </div>
                <div class="right-panel">
                    <modifiers
                        :fields="fields"
                        :field-data="selected"
                        :data-source="dataSource"
                        @delete="handleDelete"
                        @change="handleModifierChange" />
                </div>
            </div>
        </div>
    </div>
</template>
<script>
    import { defineComponent, ref, computed, onMounted, getCurrentInstance } from 'vue'
    import { useStore } from '@/store'
    import BreadcrumbNav from './components/breadcrumb-nav.vue'
    import SaveBtn from './components/save-btn.vue'
    import JsonViewBtn from './components/json-view-btn.vue'
    import Materials from './materials.vue'
    import FieldsCanvas from './fields-canvas.vue'
    import Modifiers from './modifiers.vue'

    export default defineComponent ({
        name: 'NodeFieldsCanvas',
        components: {
            BreadcrumbNav,
            SaveBtn,
            JsonViewBtn,
            Materials,
            FieldsCanvas,
            Modifiers
        },
        props: {
            tplId: Number,
            tplName: String,
            nodeId: String,
            nodeName: String,
            formId: Number,
            relatedId: Number,
            formType: String
        },
        setup (props, { emit }) {
            const instance = getCurrentInstance()

            const store = useStore()

            const loading = ref(false)
            const formName = ref('')
            const tableName = ref('')
            const fields = ref([])
            const selected = ref({})

            const dataSource = computed(() => {
                return { type: props.formType, id: props.formId, relatedId: props.relatedId }
            })

            const editable = computed(() => props.formType && props.formType !== 'USE_FORM')

            onMounted(() => {
                const id = props.formId || props.relatedId
                if (id) {
                    getFormDetail(id)
                } else {
                    formName.value = props.nodeName
                    fields.value = []
                }
            })

            const getFormDetail = async (id) => {
                loading.value = true
                const res = await store.dispatch('nocode/form/formDetail', { formId: id })
                formName.value = res.formName
                tableName.value = res.tableName
                fields.value = JSON.parse(res.content || '[]')
                loading.value = false
            }

            const handleBack = () => {
                instance.proxy.$bkInfo({
                    title: window.i18n.t('确认离开'),
                    okText: window.i18n.t('离开'),
                    subTitle: window.i18n.t('您将离开画布编辑页面，请确认相应修改已保存'),
                    confirmFn: async () => {
                        emit('close')
                    }
                })
            }

            const handleClear = () => {
                instance.proxy.$bkInfo({
                    title: window.i18n.t('是否清空画布?'),
                    subTitle: window.i18n.t('清空将会清除画布下所有配置，且无法恢复，你还要继续吗？'),
                    theme: 'danger',
                    confirmFn: () => {
                        fields.value = []
                    }
                })
            }

            const handleSelectField = (field) => {
                selected.value = field
            }

            const handleUpdateFields = (list) => {
                fields.value = list
            }

            const handleDelete = (field) => {
                const index = fields.value.findIndex((item) => item.id === field.id)
                if (index > -1) {
                    fields.value.splice(index, 1)
                }
                clearSelected(field)
            }

            const clearSelected = (field) => {
                if (field.id === selected.value.id) {
                    selected.value = {}
                }
            }

            const handleModifierChange = (property, val) => {
                if (property in selected.value.configure) {
                    selected.value.configure[property] = val
                } else {
                    this.$set(selected.value.configure, property, val)
                }

                if (property === 'dateDimension') {
                    selected.value.configure.value = ''
                }
                const index = fields.value.findIndex((item) => item.id === selected.value.id)
                if (index > -1) {
                    fields.value.splice(index, 1, selected.value)
                }
            }

            const handleFormSaved = (data) => {
                tableName.value = data.tableName
                emit('saved', data)
            }

            return {
                loading,
                formName,
                tableName,
                fields,
                selected,
                dataSource,
                editable,
                handleBack,
                handleClear,
                handleDelete,
                handleSelectField,
                handleUpdateFields,
                clearSelected,
                handleModifierChange,
                handleFormSaved,
                emit
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .node-fields-canvas {
        position: fixed;
        top: 52px;
        right: 0;
        left: 59px;
        bottom: 0;
        overflow: auto;
        background: #fafbfd;
        z-index: 3000;
    }
    .content-container {
        height: 100%;
    }
    .canvas-top-header {
        position: relative;
        display: flex;
        justify-content: space-between;
        height: 52px;
        background: #ffffff;
        &::after {
            content: '';
            position: absolute;
            right: 0;
            bottom: 0;
            left: 0;
            z-index: 99;
            height: 1px;
            box-shadow: 0px 2px 2px 0px rgba(0, 0, 0, 0.1);
        }
        .nav-area {
            display: flex;
            align-items: center;
            padding: 0 18px;
            height: 52px;
            .back-icon {
                font-size: 13px;
                color: #3a84ff;
                cursor: pointer;
            }
            .split-line {
                margin-left: 14px;
                margin-right: 11px;
                width: 1px;
                height: 16px;
                background: #d8d8d8;
            }
        }
        .operate-btns {
            display: flex;
            align-items: center;
            padding-right: 10px;
            .bk-button {
                &.disabled {
                    background-color: #dcdee5;
                    border-color: #dcdee5;
                    color: #fff;
                }
                &:not(:last-child) {
                    margin-right: 10px;
                }
            }
        }
    }
    .canvas-edit-container {
        position: relative;
        padding: 0 300px;
        height: calc(100% - 52px);
        overflow: hidden;
    }
    .left-panel {
        position: absolute;
        top: 0;
        left: 0;
        width: 300px;
        height: 100%;
        background: #ffffff;
        box-shadow: 2px 4px 4px 0 rgba(0, 0, 0, 0.1);
        transition: all .15s;
    }
    .fields-edit-panel {
        margin: 0 20px;
        padding: 20px 0;
        height: 100%;
    }
    .right-panel {
        position: absolute;
        top: 0;
        right: 0;
        width: 300px;
        height: 100%;
        background: #ffffff;
        box-shadow: -2px 4px 4px 0px rgba(0, 0, 0, 0.1);
        transition: all .15s;
    }
</style>
