<template>
    <section>
        <bk-dialog v-model="isShow"
            theme="primary"
            :title="title"
            width="910"
            :position="{ top: 100 }"
            :mask-close="false"
            :auto-close="false"
            header-position="left"
            ext-cls="download-operate-dialog"
        >
            <section>
                {{initShow}}{{projectInfo}}
                <div style="margin-bottom: 16px;font-size:14px;">
                    即将下载<span style="font-weight: bold;">【{{projectName}}】</span>完整源码包，解压后，您可以按照以下操作进行二次开发：
                </div>
                <section class="intro-container">
                    <intro style="font-size: 12px;" />
                </section>
            </section>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    @click="handleDownloadSource">下载</bk-button>
                <bk-button @click="handleDialogCancel">取消</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    import intro from './project-intro.vue'
    export default {
        name: 'download-dialog',
        components: {
            intro
        },
        props: {
            initShow: {
                type: Boolean,
                required: false
            },
            projectInfo: {
                type: Object,
                default: () => ({})
            }
        },
        data () {
            return {
                isShow: false,
                projectId: '',
                projectCode: '',
                version: '',
                projectName: '',
                title: '下载源码包'
            }
        },
        watch: {
            initShow (val) {
                console.log(val, 333)
                if (val) {
                    this.isShow = val
                    if (this.projectInfo?.projectCode) {
                        this.projectId = this.projectInfo?.id
                        this.projectCode = this.projectInfo?.projectCode
                        this.projectName = this.projectInfo?.projectName
                        this.version = ''
                    }
                }
            }
        },
        methods: {
            handleDownloadSource () {
                window.open(`/api/projectCode/downloadCode?projectCode=${this.projectCode}&projectId=${this.projectId}&v=${this.version}`, '_self')
                setTimeout(() => {
                    this.isShow = false
                }, 500)
            },
            handleDialogCancel () {
                this.isShow = false
            }
        }
    }
</script>

<style lang="postcss">
    @import "@/css/mixins/scroller";

    .download-operate-dialog {
        .bk-dialog-body {
            padding: 0 22px;
            .intro-container {
                padding: 10px;
                background: #f0f1f5;
                height: 405px;
                overflow-y: auto;
                @mixin scroller;
            }
        }
    }
</style>
