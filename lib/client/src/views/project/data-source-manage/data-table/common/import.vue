<template>
    <section>
        <bk-button class="import-button" @click="showImport">导入</bk-button>

        <bk-dialog
            theme="primary"
            header-position="left"
            width="640"
            v-model="isShowImport">
            <span slot="header">
                {{ title }}
                <i
                    v-if="tips"
                    v-bk-tooltips="{ content: tips }"
                    class="bk-icon icon-info"
                ></i>
            </span>
            <bk-upload
                accept=".sql,.xlsx"
                with-credentials
                :limit="1"
                :multiple="false"
                :custom-request="handleRequest"
                v-if="isShowImport"
            ></bk-upload>

            <span class="import-tip">
                支持 XLSX，SQL 文件格式，
                <bk-link theme="primary" @click="downloadTemplate('xlsx')">
                    <i class="bk-drag-icon bk-drag-download"></i>XLSX 模板
                </bk-link>
                <bk-divider direction="vertical" class="tip-divider"></bk-divider>
                <bk-link theme="primary" @click="downloadTemplate('sql')">
                    <i class="bk-drag-icon bk-drag-download"></i>SQL 模板
                </bk-link>
            </span>

            <h5 class="result-message">
                {{ resultMessage }}
            </h5>
        </bk-dialog>
    </section>
</template>

<script lang="ts">
    import { defineComponent, ref } from '@vue/composition-api'

    export default defineComponent({
        props: {
            title: String,
            tips: String,
            handleImport: Function
        },

        setup (props, { emit }) {
            const isShowImport = ref<boolean>(false)
            const resultMessage = ref('')
            // 展示导入 dialog
            const showImport = () => {
                isShowImport.value = true
            }
            // 执行导入请求
            const handleRequest = (options) => {
                const {
                    fileObj,
                    fileList,
                    onProgress,
                    onSuccess
                } = options
                const [tableName, type] = fileList?.[0]?.name?.split('.')

                // 每次导入需要清空上次导入的结果信息
                resultMessage.value = ''
    
                // 读取文件
                const reader = new FileReader()
                if (type === 'xlsx') {
                    reader.readAsBinaryString(fileList[0].origin)
                } else {
                    reader.readAsText(fileList[0].origin, 'utf-8')
                }
                // 读取完成
                reader.onload = (event) => {
                    props
                        .handleImport({
                            data: {
                                tableName,
                                content: event.target.result
                            },
                            type
                        })
                        .then((message) => {
                            resultMessage.value = message
                            onSuccess({ code: 0 }, fileObj)
                        })
                        .catch((err) => {
                            fileObj.errorMsg = err.message
                        })
                }
                // 发生错误
                reader.onerror = () => {
                    fileObj.errorMsg = '上传文件失败'
                }
                // 执行完成
                reader.onloadend = () => {
                    fileObj.progress = '100%'
                    onProgress({}, 100)
                }
            }
            // 下载模板
            const downloadTemplate = (type) => {
                emit('downloadTemplate', type)
            }

            return {
                isShowImport,
                resultMessage,
                showImport,
                handleRequest,
                downloadTemplate
            }
        }
    })
</script>

<style lang="postcss" scoped>
    .import-tip, ::v-deep .bk-link-text {
        font-size: 12px;
        line-height: 16px;
    }
    .import-tip {
        display: inline-flex;
        align-items: center;
        margin-bottom: 5px;
    }
    .bk-drag-download {
        font-size: 14px;
        margin-right: 4px;
    }
    .tip-divider {
        margin: 0 4px !important;
    }
    .icon-info {
        font-size: 14px;
        vertical-align: middle;
        cursor: pointer;
    }
    .result-message {
        margin: 0 0 5px;
    }
</style>
