<template>
    <section>
        <bk-dialog v-model="isShow"
            render-directive="if"
            theme="primary"
            width="920"
            header-position="left"
            ext-cls="export-operate-dialog"
            :title="title"
            :position="{ top: 100 }"
            :mask-close="false"
            :auto-close="false"
            @value-change="handleDialogToggle"
        >
            <section v-bkloading="{ isLoading }">
                <div style="margin-bottom: 16px;font-size:14px;">
                    {{ $t('即将导出应用') }}<span style="font-weight: bold;">【{{projectName}}】</span>，{{ $t('您将得到应用JSON文件，您可以使用该JSON文件通过“应用开发”-》“新建”-》“导入应用”来创建新应用') }}
                </div>
                <section class="intro-container">
                    <p style="font-weight: bold;">{{ $t('注意：') }}</p>
                    <p>1. {{ $t('导出的应用中不包含流程及其相关页面内容') }}</p>
                    <p>2. {{ $t('如果应用内使用了“文件管理”里的文件内容，请另行对应用的文件进行导出并上传到新建的应用内，并替换文件使用链接') }}</p>
                    <p>3. {{ $t('如果应用内使用了应用本身的自定义组件，请另行在新应用内上传使用自定义组件并保证组件ID维持不变') }}</p>
                    <p>4. {{ $t('如果应用内使用了其它应用公开自定义组件，请确保该环境的自定义组件在新应用也能使用或自行替换') }}</p>
                    <section v-if="usingCompList.length">
                        <div style="margin-top: 10px; font-size: 12px;">{{ $t('此应用页面使用到的自定义组件列表如下：') }} </div>
                        <bk-table style="margin-top: 6px;"
                            :data="usingCompList">
                            <bk-table-column
                                :label="$t('table_组件名称')"
                            >
                                <template slot-scope="{ row }">
                                    <span class="component-name">{{ row.displayName }}({{ row.name }})</span>
                                </template>
                            </bk-table-column>
                            <bk-table-column
                                :label="$t('组件ID')"
                                prop="type">
                            </bk-table-column>
                            <bk-table-column
                                :label="$t('table_组件版本')"
                                prop="version">
                            </bk-table-column>
                        </bk-table>
                    </section>
                </section>
            </section>
            <div class="dialog-footer" slot="footer">
                <bk-button
                    theme="primary"
                    @click="handleExport">{{ $t('导出') }}</bk-button>
                <bk-button @click="handleDialogCancel">{{ $t('取消') }}</bk-button>
            </div>
        </bk-dialog>
    </section>
</template>

<script>
    export default {
        name: 'export-dialog',
        data () {
            return {
                isShow: false,
                isLoading: false,
                projectId: '',
                projectCode: '',
                version: '',
                projectName: '',
                title: window.i18n.t('导出应用'),
                usingCompList: []
            }
        },
        methods: {
            handleDialogToggle () {
                if (this.isShow) {
                    this.getComponentList()
                }
            },
            handleExport () {
                window.open(`/api/project/export?projectId=${this.projectId}`, '_self')
                setTimeout(() => {
                    this.isShow = false
                }, 500)
            },
            handleDialogCancel () {
                this.isShow = false
            },
            async getComponentList () {
                try {
                    this.isLoading = true
                    this.usingCompList = await this.$store.dispatch('components/useing', { belongProjectId: this.projectId, projectVersionId: null })
                } catch (error) {
                    this.usingCompList = []
                } finally {
                    this.isLoading = false
                }
            }
        }
    }
</script>

<style lang="postcss">
    @import "@/css/mixins/scroller";

    .export-operate-dialog {
        .bk-dialog-body {
            padding: 0 22px;
            .intro-container {
                padding: 10px;
                background: #f0f1f5;
                min-height: 400px;
                overflow-y: auto;
                @mixin scroller;

                p {
                    line-height: 22px;
                }
            }
        }
    }
</style>
