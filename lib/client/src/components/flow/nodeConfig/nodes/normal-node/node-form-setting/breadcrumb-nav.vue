<template>
    <div class="breadcrumb-nav">
        <template v-if="editMode">
            <bk-input
                v-model="name"
                ref="input"
                :class="['name-edit-input', { 'is-error': errorTips.length > 0 }]"
                :maxlength="50"
                :show-word-limit="true"
                @change="validate"
                @blur="handleSave"
                @enter="handleSave">
            </bk-input>
            <i
                v-if="errorTips.length > 0"
                v-bk-tooltips="errorTips"
                class="bk-icon icon-exclamation-circle-shape error-icon">
            </i>
        </template>
        <div v-else class="breadcrumb-content">
            <i class="bk-drag-icon bk-drag-flow-fill flow-icon"></i>
            <span class="up-level-nav" @click="$emit('backToFlow')">{{ flowConfig.flowName }}</span>
            /
            <span class="up-level-nav" @click="$emit('backToNode')">{{ nodeData.name }}</span>
            /
            <span class="form-name">{{ formConfig.formName }}</span>
            <i v-if="editable" class="bk-drag-icon bk-drag-edit edit-icon" @click="handleEditClick"></i>
        </div>
    </div>
</template>
<script>
    import { mapState } from 'vuex'
    export default {
        name: 'BreadcrumbNav',
        props: {
            flowConfig: {
                type: Object,
                default: () => ({})
            },
            editable: {
                type: Boolean,
                default: true
            }
        },
        data () {
            return {
                editMode: false,
                name: this.$store.state.nocode.nodeConfig.formConfig.formName,
                errorTips: ''
            }
        },
        computed: {
            ...mapState('nocode/nodeConfig', ['nodeData', 'formConfig'])
        },
        methods: {
            validate () {
                const name = this.name.trim()
                if (name.length === 0) {
                    this.errorTips = this.$t('表单名称不能为空')
                    return false
                }
                if (name.length > 50) {
                    this.errorTips = this.$t('表单名称不能超过50个字符')
                    return false
                }
                this.errorTips = ''
                return true
            },
            handleEditClick () {
                this.editMode = true
                this.$nextTick(() => {
                    this.$refs.input.focus()
                })
            },
            handleSave () {
                if (this.validate()) {
                    this.editMode = false
                    this.$store.commit('nocode/nodeConfig/setFormConfig', { formName: this.name.trim() })
                }
            }
        }
    }
</script>
<style lang="postcss" scoped>
    .breadcrumb-nav {
        position: relative;
    }
    .breadcrumb-content {
        display: flex;
        align-items: center;
        width: 320px;
        color: #313238;
        font-size: 14px;
        .flow-icon {
            margin-right: 5px;
            font-size: 12px;
            color: #63656e;
        }
        .up-level-nav {
            margin: 0 3px 0 4px;
            max-width: 90px;
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
            max-width: 120px;
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
