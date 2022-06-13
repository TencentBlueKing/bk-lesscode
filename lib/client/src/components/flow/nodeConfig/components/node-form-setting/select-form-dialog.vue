<template>
    <bk-dialog
        class="select-form-dialog"
        width="704"
        render-directive="if"
        :value="show"
        :auto-close="false"
        :mask-close="false"
        :close-icon="false"
        @confirm="handleConfirm"
        @cancel="handleCancel">
        <header slot="header" class="dialog-header">
            <h4>请选择已有表单</h4>
            <span>（{{ method === 'COPY_FORM' ? '引用' : '复用' }}已有表单）</span>
        </header>
        <div class="dialog-content" v-bkloading="{ isLoading: listLoading }">
            <div style="margin-bottom: 16px; padding: 0 24px;">
                <bk-alert type="warning" :closable="true" :title="tips"></bk-alert>
            </div>
            <div class="form-list-wrapper">
                <div
                    v-for="item in formList"
                    :key="item.id"
                    :class="['form-card-item', { 'selected': selected === item.id }]"
                    @click="handleFormSelect(item.id)">
                    <div class="selected-label"></div>
                    <span class="preview-btn" @click.stop="$emit('preview', JSON.parse(item.content))">预览</span>
                    <p>{{ item.formName }}</p>
                </div>
                <bk-exception
                    v-if="formList.length === 0"
                    type="empty"
                    scene="part"
                    style="margin: 40px 0 80px;">
                </bk-exception>
            </div>
        </div>
    </bk-dialog>
</template>
<script>
    import { mapGetters } from 'vuex'
    import { messageError } from '@/common/bkmagic'

    export default {
        name: 'SelectFormDialog',
        props: {
            show: Boolean,
            method: String
        },
        data () {
            return {
                formList: [],
                listLoading: true,
                selected: ''
            }
        },
        computed: {
            tips () {
                return this.method === 'COPY_FORM'
                    ? '引用已有表单：引用已有表单快速建表，运行时节点数据不会存入被引用的表中，字段属性可自定义'
                    : '复用已有表单：运行时节点数据会存入被复用的表中，不支持增加和修改字段属性'
            },
            projectId () {
                return this.$route.params.projectId
            },
            ...mapGetters('projectVersion', { versionId: 'currentVersionId' })
        },
        watch: {
            show (val) {
                if (val) {
                    this.getFormList()
                }
            }
        },
        methods: {
            async getFormList () {
                try {
                    this.listLoading = true
                    const params = {
                        projectId: this.projectId,
                        versionId: this.versionId
                    }
                    this.formList = await this.$store.dispatch('nocode/flow/getFormList', params)
                } catch (e) {
                    messageError(e.message || e)
                } finally {
                    this.listLoading = false
                }
            },
            handleFormSelect (val) {
                this.selected = val
            },
            handleConfirm () {
                if (typeof this.selected !== 'number') {
                    this.$bkMessage({
                        message: '请选择表单',
                        theme: 'error'
                    })
                    return
                }
                const form = this.formList.find(item => item.id === this.selected)
                this.selected = ''
                this.$emit('confirm', form.id, JSON.parse(form.content), form.tableName)
            },
            handleCancel () {
                this.selected = ''
                this.$emit('update:show', false)
            }
        }
    }
</script>
<style lang="postcss">
    @import "@/css/mixins/scroller";

    .select-form-dialog {
        .bk-dialog-tool {
            display: none;
        }
        .dialog-header {
            display: flex;
            align-items: center;
            padding-top: 15px;
            h4 {
                margin: 0;
                font-size: 20px;
                line-height: 28px;
                font-weight: normal;
                color: #313238;
            }
            span {
                font-size: 12px;
                color: #63656e;
            }
        }
        .bk-dialog-body {
            padding-left: 0;
            padding-right: 0;
        }
        .form-list-wrapper {
            padding: 0 24px;
            display: flex;
            justify-content: space-between;
            flex-wrap: wrap;
            min-height: 160px;
            max-height: 320px;
            overflow: auto;
            @mixin scroller;
        }
        .form-card-item {
            position: relative;
            margin-bottom: 16px;
            padding: 0 50px 0 16px;
            width: 320px;
            height: 50px;
            line-height: 50px;
            font-size: 12px;
            color: #63656e;
            border: 1px solid #dcdee5;
            border-radius: 2px;
            cursor: pointer;
            &:hover {
                border-color: #3a84ff;
                .preview-btn {
                    display: block;
                }
            }
            &.selected {
                border-color: #3a84ff;
                .selected-label {
                    display: block;
                }
            }
            .selected-label {
                display: none;
                position: absolute;
                top: 0;
                right: 0;
                width: 0;
                height: 0;
                border-style: solid;
                border-width: 0 36px 36px 0;
                border-color: transparent #3a84ff transparent transparent;
                &:before {
                    content: '';
                    position: absolute;
                    top: 10px;
                    right: -34px;
                    width: 11px;
                    height: 1px;
                    background: #ffffff;
                    transform: rotate(-45deg);
                    border-bottom-left-radius: 1px;
                }
                &:after {
                    content: '';
                    position: absolute;
                    top: 12px;
                    right: -26px;
                    width: 5px;
                    height: 1px;
                    background: #ffffff;
                    transform: rotate(45deg);
                    border-bottom-right-radius: 1px;
                }
            }
            .preview-btn {
                display: none;
                position: absolute;
                right: 20px;
                top: 18px;
                font-size: 12px;
                line-height: 1;
                color: #3a84ff;
                cursor: pointer;
            }
        }
    }
</style>
