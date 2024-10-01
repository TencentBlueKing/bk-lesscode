<template>
    <div class="breadcrumb-nav">
        <template v-if="editMode">
            <bk-input
                v-model="name"
                ref="inputRef"
                :class="['name-edit-input', { 'is-error': errorTips.length > 0 }]"
                :maxlength="50"
                :show-word-limit="true"
                @change="validate"
                @blur="handleSave"
                @enter="handleSave" />
            <i
                v-if="errorTips.length > 0"
                v-bk-tooltips="{ content: errorTips, maxWidth: 400, allowHTML: false }"
                class="bk-icon icon-exclamation-circle-shape error-icon" />
        </template>
        <div v-else class="breadcrumb-content">
            <i class="bk-drag-icon bk-drag-flow-fill flow-icon" />
            <span class="up-level-nav" @click="emit('backToFlow')">{{ tplName }}</span>
            /
            <span class="up-level-nav" @click="emit('backToNode')">{{ nodeName }}</span>
            /
            <span class="form-name">{{ name }}</span>
            <i v-if="editable" class="bk-drag-icon bk-drag-edit edit-icon" @click="handleEditClick"></i>
        </div>
    </div>
</template>
<script>
    import { defineComponent, ref, watch, nextTick } from 'vue'

    export default defineComponent({
        name: 'BreadcrumbNav',
        props: {
            tplName: {
                type: String,
                default: ''
            },
            nodeName: {
                type: String,
                default: ''
            },
            formName: {
                type: String,
                default: ''
            },
            editable: {
                type: Boolean,
                default: true
            }
        },
        setup (props, { emit }) {
            const editMode = ref(false)
            const name = ref(props.formName)
            const errorTips = ref('')
            const inputRef = ref(null)

            watch(() => props.formName, (val) => {
                name.value = val
            })

            const handleEditClick = () => {
                editMode.value = true
                nextTick(() => {
                    inputRef.value.focus()
                })
            }
            const handleSave = () => {
                if (validate()) {
                    editMode.value = false
                    emit('change', name.value.trim())
                }
            }

            const validate = () => {
                const nameStr = name.value.trim()
                if (nameStr.length === 0) {
                    errorTips.value = window.i18n.t('表单名称不能为空')
                    return false
                }
                if (nameStr.length > 50) {
                    errorTips.value = window.i18n.t('表单名称不能超过50个字符')
                    return false
                }
                errorTips.value = ''
                return true
            }

            return {
                editMode,
                name,
                errorTips,
                inputRef,
                handleEditClick,
                handleSave,
                validate,
                emit
            }
        }
    })
</script>
<style lang="postcss" scoped>
    .breadcrumb-nav {
        position: relative;
    }
    .breadcrumb-content {
        display: flex;
        align-items: center;
        color: #313238;
        font-size: 14px;
        .flow-icon {
            margin-right: 5px;
            font-size: 12px;
            color: #63656e;
        }
        .up-level-nav {
            margin: 0 3px 0 4px;
            max-width: 100px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
            }
        }
        .form-name {
            margin-left: 4px;
            max-width: 200px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .edit-icon {
            font-size: 24px;
            cursor: pointer;
            &:hover {
                color: #3a84ff;
            }
        }
    }
    .name-edit-input {
        width: 320px;
        &.is-error {
            >>> .bk-input-text input {
                border-color: #ff5656;
                color: #ff5656;
            }
        }
    }
    .error-icon {
        position: absolute;
        right: 8px;
        top: 8px;
        color: #ea3636;
        cursor: pointer;
        font-size: 16px;
        z-index: 10;
    }
</style>
