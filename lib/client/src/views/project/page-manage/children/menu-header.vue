<template>
    <section>
        <div class="page-menu-header">
            <div class="version-selector">
                {{ $t('应用当前版本：') }}
                <project-version-selector :bordered="false" :popover-width="200" v-model="projectVersionId" @change="handleChangeProjectVersion" />
            </div>
            <div class="operate-icon">
                <bk-dropdown-menu v-if="hasMobilePage" :align="'center'" :ext-cls="'preview-dropdown'">
                    <div class="dropdown-trigger-btn" slot="dropdown-trigger">
                        <i class="bk-drag-icon bk-drag-play"></i>
                    </div>
                    <ul class="bk-dropdown-list" slot="dropdown-content">
                        <li><a href="javascript:;" @click="handlePreviewPcProject">{{ $t('预览PC页面') }}</a></li>
                        <li><a href="javascript:;" @click="handlePreviewMobileProject">{{ $t('预览移动端页面') }}</a></li>
                    </ul>
                </bk-dropdown-menu>
                <i v-else v-bk-tooltips="$t('预览应用')" class="bk-drag-icon bk-drag-play" @click="handlePreviewPcProject"></i>
                <i v-bk-tooltips="$t('下载应用源码')" class="bk-drag-icon bk-drag-download" @click="handleShowDownload"></i>
            </div>
        </div>
        <download-dialog ref="downloadDialog"></download-dialog>
    </section>
</template>

<script>
    import downloadDialog from '@/views/system/components/download-dialog'
    import { mapGetters } from 'vuex'
    import { bus } from '@/common/bus'

    export default {
        components: {
            downloadDialog
        },
        props: {
            hasMobilePage: {
                type: Boolean,
                default: false
            }
        },
        data () {
            return {
                projectVersionId: ''
            }
        },
        computed: {
            ...mapGetters('project', ['currentProject']),
            ...mapGetters('projectVersion', { versionId: 'currentVersionId', currentVersion: 'currentVersion' }),
            projectId () {
                return this.$route.params.projectId
            }
        },
        created () {
            this.projectVersionId = this.versionId
        },
        methods: {
            handleChangeProjectVersion (versionId, version) {
                // console.log(versionId, version)
                // this.$store.commit('projectVersion/setCurrentVersion', version)
                bus.$emit('update-project-version', version)
            },
            handleShowDownload () {
                this.$refs.downloadDialog.isShow = true
                this.$refs.downloadDialog.projectId = this.projectId
                this.$refs.downloadDialog.version = this.versionId ? `${this.currentVersion.id}:${this.currentVersion.version}` : ''
                this.$refs.downloadDialog.projectCode = this.currentProject.projectCode
                this.$refs.downloadDialog.projectName = this.currentProject.projectName
            },
            handlePreviewPcProject () {
                // 跳转到预览入口页面
                const versionPath = `${this.versionId ? `/version/${this.versionId}` : ''}`
                window.open(`/preview/project/${this.projectId}${versionPath}/`, '_blank')
            },
            handlePreviewMobileProject () {
                // 跳转到预览入口页面
                const versionQuery = `${this.versionId ? `?version=${this.versionId}` : ''}`
                window.open(`/preview-mobile/project/${this.projectId}${versionQuery}`, '_blank')
            }
        }
    }
</script>

<style lang="postcss" scoped>
    @import "@/css/variable";

    .page-menu-header {
        width: 300px;
        height:52px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-bottom: 1px solid $boxBorderColor;
        border-right: 1px solid $boxBorderColor;
        .version-selector {
            margin-left: 8px;
            position: relative;
            display: flex;
            align-items: center;
            font-size: 12px;

            .project-version-selector {
                max-width: 260px;
            }
        }

        .operate-icon {
            i {
                cursor: pointer;
                margin-right: 8px;
                font-size: 14px;
                &:hover {
                    color: $primaryColor;
                }
            }
        }
    }
</style>
