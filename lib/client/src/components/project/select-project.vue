<template>
    <section>
        <bk-select
            ext-cls="select-project"
            ext-popover-cls="select-project-dropdown"
            v-model="projectId"
            :popover-options="{ appendTo: 'parent' }"
            :clearable="false"
            :searchable="true"
            @selected="changeProject"
            :search-placeholder="$t('输入应用名称搜索')">
            <bk-option v-for="option in projectList"
                :key="option.id"
                :id="option.id"
                :name="option.projectName">
                <span class="project-name">
                    <span v-bk-overflow-tips>{{option.projectName}}</span>
                    <framework-tag :framework="option.framework" bg-color="#28354D" />
                </span>
            </bk-option>
            <div slot="extension" class="extension">
                <div
                    class="page-row"
                    @click="handleTempCreate">
                    <i class="bk-icon icon-plus-circle" /> {{ $t('新建应用') }}
                </div>
            </div>
        </bk-select>
        <create-dialog ref="createDialog" />
        <template-dialog ref="templateDialog" @preview="handlePreview"></template-dialog>
    </section>
</template>

<script>
    import FrameworkTag from '@/components/framework-tag.vue'
    import CreateDialog from '@/views/system/components/create-empty-project-dialog'
    import TemplateDialog from '@/views/system/components/template-dialog'

    export default {
        components: {
            FrameworkTag,
            CreateDialog,
            TemplateDialog
        },
        props: {
            projectList: {
                type: Array,
                default: () => ([])
            }
        },
        data () {
            return {
                projectId: ''
            }
        },
        watch: {
            '$route.params.projectId' (val) {
                this.projectId = val
            }
        },
        created () {
            this.projectId = parseInt(this.$route.params.projectId)
        },
        methods: {
            changeProject (id) {
                if (this.$route.name === 'new' || this.$route.name === 'editNocode') {
                    this.$router.push({
                        name: 'pageList',
                        params: {
                            projectId: id
                        }
                    })
                } else {
                    this.$router.replace({
                        params: {
                            projectId: id
                        }
                    })
                }
            },
            handleTempCreate () {
                this.$refs.templateDialog.isShow = true
            },
            handleCreate (type = 'newProject') {
                this.$refs.createDialog.projectType = type
                this.$refs.createDialog.formData.projectName = ''
                this.$refs.createDialog.formData.copyFrom = null
                this.$refs.createDialog.visible = true
            },
            handlePreview (id) {
                window.open(`/preview/project/${id}/`, '_blank')
            }
        }
    }
</script>
