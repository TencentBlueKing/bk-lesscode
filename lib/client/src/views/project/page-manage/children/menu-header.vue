<template>
    <section>
        <div class="page-menu-header">
            <div class="version-selector">
                应用当前版本：
                <project-version-selector :bordered="false" :popover-width="200" v-model="projectVersionId" @change="handleChangeProjectVersion" />
            </div>
            <div class="operate-icon">
                <i v-bk-tooltips="'预览应用'" class="bk-drag-icon bk-drag-play"></i>
                <i v-bk-tooltips="'下载项目源码'" class="bk-drag-icon bk-drag-download" @click="handleShowDownload"></i>
            </div>
        </div>
        <download-dialog :project-info="currentProject" :is-show="showDownloadDialog"></download-dialog>
    </section>
</template>

<script>
    import downloadDialog from '@/views/system/components/download-dialog'
    import { computed, defineComponent, ref } from '@vue/composition-api'
    import store from '@/store'
    import router from '@/router'

    export default defineComponent({
        components: {
            downloadDialog
        },
        setup () {
            const projectVersionId = ref('')
            const showDownloadDialog = ref(false)

            const projectId = router?.currentRoute?.params?.projectId
            projectVersionId.value = store.getters['projectVersion/currentVersionId']

            const currentProject = computed(() => {
                console.log('computed', store.getters['project/projectDetail'])
                return store.getters['project/projectDetail']
            })

            function handleChangeProjectVersion (versionId, version) {
                store.commit('projectVersion/setCurrentVersion', version)
            }

            function handleShowDownload () {
                showDownloadDialog.value = true
            }

            return {
                projectVersionId,
                currentProject,
                showDownloadDialog,
                handleShowDownload,
                handleChangeProjectVersion
            }
        }
    })
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
