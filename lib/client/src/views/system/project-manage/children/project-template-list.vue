<template>
    <div class="project-list-card">
        <div :class="['project-item', 'project-template-item']" v-for="project in projectList"
            :key="project.id">
            <div class="item-bd">
                <template>
                    <div class="preview">
                        <page-preview-thumb :alt="$t('应用缩略预览')" :project-id="project.id" :img-src="project.templateImg" />
                    </div>
                </template>
                <div class="operate-btns">
                    <auth-button
                        theme="primary"
                        auth="create_app_with_template"
                        @click="handleApply(project)"
                        v-enClass="'en-btn-title'"
                        :title="$t('创建为新应用')"
                        :permission="iamNoResourcesPerm[$IAM_ACTION.create_app_with_template[0]]">
                        {{ $t('创建为新应用') }} </auth-button>
                    <auth-button
                        auth="preview_app_template"
                        @click="handlePreviewProject(project.id)"
                        style="margin-left: 10px; width: 90px;"
                        :permission="iamNoResourcesPerm[$IAM_ACTION.preview_app_template[0]]">
                        {{ $t('预览') }} </auth-button>
                    <auth-button
                        auth="download_app_template_source"
                        @click="handleDownloadProject(project)"
                        style="margin-left: 10px;"
                        v-enClass="'en-btn-title'"
                        :title="$t('下载源码')"
                        :permission="iamNoResourcesPerm[$IAM_ACTION.download_app_template_source[0]]">
                        {{ $t('下载源码') }} </auth-button>
                </div>
            </div>
            <div class="item-ft">
                <div class="col">
                    <h3 class="name" :title="project.projectName">{{project.projectName}}</h3>
                    <div class="stat"> {{$t('由 {0} 上传',[project.createUser || 'admin'])}}</div>
                    
                </div>
                <framework-tag class="framework-op" :framework="project.framework"></framework-tag>
            </div>
            <span class="favorite-btn">
                <i class="bk-icon icon-info-circle" v-bk-tooltips.top="{ content: project.projectDesc, allowHTML: false }"></i>
            </span>
        </div>

        <create-empty-project-dialog ref="createDialog" />

        <download-dialog ref="downloadDialog"></download-dialog>
    </div>
</template>

<script>
    import DownloadDialog from '@/views/system/components/download-dialog'
    import CreateEmptyProjectDialog from '@/views/system/components/create-empty-project-dialog'
    import PagePreviewThumb from '@/components/project/page-preview-thumb.vue'
    import frameworkTag from '@/components/framework-tag.vue'
    import { mapGetters } from 'vuex'

    export default {
        components: {
            DownloadDialog,
            CreateEmptyProjectDialog,
            PagePreviewThumb,
            frameworkTag
        },
        props: {
            projectList: {
                type: Array,
                default: () => ([])
            }
        },
        computed: {
            ...mapGetters(['iamNoResourcesPerm'])
        },
        methods: {
            handleApply (project) {
                this.$refs.createDialog.projectType = 'applyTemplate'
                this.$refs.createDialog.formData.copyFrom = project.id
                this.$refs.createDialog.formData.framework = project.framework || 'vue2'
                this.$refs.createDialog.selectTemplateName = project.projectName
                this.$refs.createDialog.visible = true
            },
            handlePreviewProject (id) {
                window.open(`/preview/project/${id}/`, '_blank')
            },
            handleDownloadProject (project) {
                this.$refs.downloadDialog.isShow = true
                this.$refs.downloadDialog.projectId = project.id
                this.$refs.downloadDialog.projectCode = project.projectCode
                this.$refs.downloadDialog.projectName = project.projectName
            },
        }
    }
</script>

<style scoped>
    .operate-btns {
        .en-btn-title {
            /deep/ span {
                display: block;
                width: 100%;
                overflow: hidden;
                white-space: nowrap;
                text-overflow: ellipsis;
                text-align: center;
                padding: 0 2px;
            }
        }
    }
</style>